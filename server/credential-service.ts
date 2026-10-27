import { and, eq } from "drizzle-orm";
import { auditEvents, providerCredentials } from "../drizzle/schema";
import { getDb } from "./db";
import { decryptSecret, encryptSecret } from "./secret-vault";

export type CredentialActor = { userId: number; tenantId: number };
export type CredentialInput = { provider: string; secret: string; channelId?: number | null; scopes?: string[] };

export async function saveProviderCredential(actor: CredentialActor, input: CredentialInput) {
  if (!input.provider.trim() || !input.secret.trim()) throw new Error("Provider and secret are required");
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const encrypted = encryptSecret(input.secret, encryptionKey(), "v1");
  const secretRef = JSON.stringify(encrypted);
  const existing = await db.select({ id: providerCredentials.id }).from(providerCredentials).where(and(eq(providerCredentials.tenantId, actor.tenantId), eq(providerCredentials.provider, input.provider))).limit(1);
  if (existing[0]) {
    await db.update(providerCredentials).set({ encryptedSecretRef: secretRef, channelId: input.channelId ?? null, scopes: input.scopes ?? [], status: "active", updatedAt: new Date() }).where(eq(providerCredentials.id, existing[0].id));
    await writeAudit(actor, "credential_rotated", input.provider, `Rotated ${input.provider} credential`);
    return { id: existing[0].id, status: "active", action: "rotated" as const };
  }
  const result = await db.insert(providerCredentials).values({ tenantId: actor.tenantId, channelId: input.channelId ?? null, provider: input.provider, encryptedSecretRef: secretRef, scopes: input.scopes ?? [], status: "active" });
  await writeAudit(actor, "credential_created", input.provider, `Created ${input.provider} credential`);
  return { id: Number(result[0].insertId), status: "active", action: "created" as const };
}

export async function getProviderCredentialStatus(actor: CredentialActor, provider: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db.select({ id: providerCredentials.id, provider: providerCredentials.provider, channelId: providerCredentials.channelId, scopes: providerCredentials.scopes, status: providerCredentials.status, keyVersion: providerCredentials.keyVersion, lastValidatedAt: providerCredentials.lastValidatedAt }).from(providerCredentials).where(and(eq(providerCredentials.tenantId, actor.tenantId), eq(providerCredentials.provider, provider))).limit(1);
  await writeAudit(actor, "credential_status_accessed", provider, `Read ${provider} credential status`);
  return rows[0] ?? null;
}

export async function revokeProviderCredential(actor: CredentialActor, provider: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.update(providerCredentials).set({ status: "revoked", updatedAt: new Date() }).where(and(eq(providerCredentials.tenantId, actor.tenantId), eq(providerCredentials.provider, provider)));
  await writeAudit(actor, "credential_revoked", provider, `Revoked ${provider} credential`);
  return { revoked: result[0].affectedRows > 0 };
}

export function decryptStoredCredential(secretRef: string): string {
  return decryptSecret(JSON.parse(secretRef), encryptionKey());
}

async function writeAudit(actor: CredentialActor, action: string, provider: string, summary: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditEvents).values({ tenantId: actor.tenantId, actorUserId: actor.userId, action, targetType: "provider_credential", targetId: provider, summary });
}

function encryptionKey() {
  const key = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!key) throw new Error("Credential encryption key is not configured");
  return key;
}
