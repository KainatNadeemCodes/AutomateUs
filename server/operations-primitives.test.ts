import { describe, expect, it } from "vitest";
import { assertMediaAsset, buildMediaStorageKey, classifyProviderError, makeOperationLog, reconcileUncertainUpload } from "./operations-primitives";

describe("operations primitives", () => {
  it("builds tenant-scoped media keys and validates active manifests", () => {
    expect(buildMediaStorageKey({ tenantId: 1, channelId: 2, contentVersionId: 3, kind: "final", id: "asset-4" })).toBe("tenants/1/channels/2/versions/3/final/asset-4");
    expect(() => assertMediaAsset({ id: "asset-4", tenantId: 1, channelId: 2, contentVersionId: 3, kind: "final", storageKey: "key", checksum: "sha", mimeType: "video/mp4", status: "active", createdAt: Date.now() })).not.toThrow();
  });

  it("never blindly retries an uncertain upload", () => {
    const input = { expectedTitle: "A calm workflow", expectedCreatedAfter: Date.parse("2026-09-01T00:00:00Z"), candidates: [{ id: "v1", title: "A calm workflow", publishedAt: "2026-09-02T00:00:00Z" }] };
    expect(reconcileUncertainUpload(input)).toEqual({ state: "reconciled", videoId: "v1" });
    expect(reconcileUncertainUpload({ ...input, candidates: [{ ...input.candidates[0], id: "v1" }, { ...input.candidates[0], id: "v2" }] })).toEqual({ state: "ambiguous" });
    expect(reconcileUncertainUpload({ ...input, candidates: [] })).toEqual({ state: "not_found" });
  });

  it("classifies provider errors for visible recovery", () => {
    expect(classifyProviderError(429)).toBe("quota");
    expect(classifyProviderError(503)).toBe("retryable");
    expect(classifyProviderError(401)).toBe("auth");
    expect(classifyProviderError(400)).toBe("permanent");
    expect(makeOperationLog({ correlationId: "c1", tenantId: 1, channelId: 2, stage: "render", status: "completed" })).toMatchObject({ correlationId: "c1", tenantId: 1, stage: "render", status: "completed" });
  });
});
