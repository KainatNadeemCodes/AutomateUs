import { describe, expect, it } from "vitest";
import { assertFinalConfirmation, createConfirmationToken, deriveIdempotencyKey, fingerprintPayload } from "./approval-guards";

const base = {
  tenantId: 7,
  channelId: 21,
  contentVersionId: 42,
  action: "schedule" as const,
  payload: { title: "A calm workflow", privacy: "unlisted", publishAt: "2026-09-18T09:30:00Z" },
  expiresAt: Date.now() + 60_000,
};

describe("approval-first external action guards", () => {
  it("accepts an approved, rights-confirmed action with a matching token", () => {
    const token = createConfirmationToken(base);
    expect(() => assertFinalConfirmation({ actorId: 4, tenantId: 7, channelId: 21, reviewState: "approved", rightsConfirmed: true, confirmation: base, finalToken: token })).not.toThrow();
  });

  it("rejects a scheduling attempt when content is not approved", () => {
    const token = createConfirmationToken(base);
    expect(() => assertFinalConfirmation({ actorId: 4, tenantId: 7, channelId: 21, reviewState: "needs_review", rightsConfirmed: true, confirmation: base, finalToken: token })).toThrow("Content must be approved");
  });

  it("rejects a token from another channel or payload", () => {
    const token = createConfirmationToken(base);
    const changed = { ...base, channelId: 22 };
    expect(() => assertFinalConfirmation({ actorId: 4, tenantId: 7, channelId: 21, reviewState: "approved", rightsConfirmed: true, confirmation: changed, finalToken: token })).toThrow("Confirmation scope");
  });

  it("rejects expired confirmations and unconfirmed rights", () => {
    const expired = { ...base, expiresAt: Date.now() - 1 };
    const expiredToken = createConfirmationToken(expired);
    expect(() => assertFinalConfirmation({ actorId: 4, tenantId: 7, channelId: 21, reviewState: "approved", rightsConfirmed: true, confirmation: expired, finalToken: expiredToken })).toThrow("expired");
    const validToken = createConfirmationToken(base);
    expect(() => assertFinalConfirmation({ actorId: 4, tenantId: 7, channelId: 21, reviewState: "approved", rightsConfirmed: false, confirmation: base, finalToken: validToken })).toThrow("rights");
  });

  it("produces deterministic fingerprints and distinct idempotency keys", () => {
    expect(fingerprintPayload({ b: 2, a: 1 })).toBe(fingerprintPayload({ a: 1, b: 2 }));
    expect(deriveIdempotencyKey({ tenantId: 7, channelId: 21, operation: "render", versionId: 42, nonce: "abc" })).toBe("7:21:render:42:abc");
    expect(deriveIdempotencyKey({ tenantId: 7, channelId: 21, operation: "render", versionId: 43, nonce: "abc" })).not.toBe(deriveIdempotencyKey({ tenantId: 7, channelId: 21, operation: "render", versionId: 42, nonce: "abc" }));
  });
});
