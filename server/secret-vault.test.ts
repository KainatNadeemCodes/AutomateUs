import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./secret-vault";

describe("secret vault", () => {
  it("round-trips an encrypted provider credential", () => {
    const encrypted = encryptSecret("refresh-token-value", "a-long-test-encryption-key", "v2");
    expect(encrypted.version).toBe("v2");
    expect(encrypted.ciphertext).not.toContain("refresh-token-value");
    expect(decryptSecret(encrypted, "a-long-test-encryption-key")).toBe("refresh-token-value");
  });

  it("rejects tampered ciphertext and the wrong key", () => {
    const encrypted = encryptSecret("provider-key", "a-long-test-encryption-key");
    expect(() => decryptSecret(encrypted, "another-long-encryption-key")).toThrow();
    const tampered = { ...encrypted, ciphertext: `${encrypted.ciphertext.slice(0, -1)}${encrypted.ciphertext.endsWith("A") ? "B" : "A"}` };
    expect(() => decryptSecret(tampered, "a-long-test-encryption-key")).toThrow();
  });
});
