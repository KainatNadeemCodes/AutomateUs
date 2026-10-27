import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

export type ExternalAction = "upload" | "schedule" | "comment_post";
export type ReviewState = "draft" | "needs_review" | "approved" | "rejected" | "stale";

export type ConfirmationPayload = {
  tenantId: number;
  channelId: number;
  contentVersionId?: number;
  replyDraftIds?: number[];
  action: ExternalAction;
  payload: Record<string, unknown>;
  expiresAt: number;
};

export type ApprovedContext = {
  actorId: number;
  tenantId: number;
  channelId: number;
  reviewState: ReviewState;
  rightsConfirmed: boolean;
  confirmation: ConfirmationPayload;
  finalToken: string;
};

export function fingerprintPayload(payload: Record<string, unknown>): string {
  return createHash("sha256").update(stableSerialize(payload)).digest("hex");
}

export function createConfirmationToken(payload: Omit<ConfirmationPayload, "expiresAt"> & { expiresAt?: number }): string {
  const normalized: ConfirmationPayload = { ...payload, expiresAt: payload.expiresAt ?? Date.now() + 5 * 60 * 1000 };
  const body = Buffer.from(stableSerialize(normalized)).toString("base64url");
  const signature = createHash("sha256").update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function parseConfirmationToken(token: string): ConfirmationPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = createHash("sha256").update(body).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const value = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ConfirmationPayload;
    return typeof value.expiresAt === "number" ? value : null;
  } catch {
    return null;
  }
}

export function assertFinalConfirmation(context: ApprovedContext, now = Date.now()): void {
  if (!context.actorId || !context.tenantId || !context.channelId) throw new Error("Authenticated tenant and channel context is required");
  if (!context.confirmation || context.confirmation.expiresAt <= now) throw new Error("Final operator confirmation is missing or expired");
  if (context.confirmation.tenantId !== context.tenantId || context.confirmation.channelId !== context.channelId) throw new Error("Confirmation scope does not match the requested channel");
  if (context.confirmation.action === "upload" || context.confirmation.action === "schedule") {
    if (context.reviewState !== "approved") throw new Error("Content must be approved before a YouTube action");
    if (!context.rightsConfirmed) throw new Error("Media rights must be confirmed before a YouTube action");
  }
  if (context.confirmation.action === "comment_post" && context.reviewState !== "approved") throw new Error("Reply draft must be approved before posting");
  const expectedToken = createConfirmationToken(context.confirmation);
  if (expectedToken !== context.finalToken) throw new Error("Confirmation token does not match the approved payload");
}

export function deriveIdempotencyKey(parts: { tenantId: number; channelId: number; operation: string; versionId?: number; nonce: string }): string {
  return `${parts.tenantId}:${parts.channelId}:${parts.operation}:${parts.versionId ?? "none"}:${parts.nonce}`;
}

export function newCorrelationId(): string {
  return randomUUID();
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map(key => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`).join(",")}}`;
}
