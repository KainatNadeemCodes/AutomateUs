import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type EncryptedSecret = { version: string; iv: string; tag: string; ciphertext: string };

export function encryptSecret(plaintext: string, keyMaterial: string, version = "v1"): EncryptedSecret {
  if (!plaintext) throw new Error("Secret value is required");
  const key = deriveKey(keyMaterial);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { version, iv: iv.toString("base64url"), tag: cipher.getAuthTag().toString("base64url"), ciphertext: ciphertext.toString("base64url") };
}

export function decryptSecret(encrypted: EncryptedSecret, keyMaterial: string): string {
  const key = deriveKey(keyMaterial);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.iv, "base64url"));
  decipher.setAuthTag(Buffer.from(encrypted.tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted.ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

function deriveKey(keyMaterial: string): Buffer {
  if (!keyMaterial || keyMaterial.length < 16) throw new Error("Encryption key material must be at least 16 characters");
  return createHash("sha256").update(keyMaterial).digest();
}
