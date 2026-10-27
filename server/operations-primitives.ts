export type MediaAsset = { id: string; tenantId: number; channelId: number; contentVersionId: number; kind: "source" | "narration" | "visual" | "caption" | "thumbnail" | "final"; storageKey: string; checksum: string; mimeType: string; status: "active" | "expired" | "deleted"; createdAt: number };

export type UploadCandidate = { id: string; title: string; publishedAt?: string; privacyStatus?: string };

export function buildMediaStorageKey(asset: Pick<MediaAsset, "tenantId" | "channelId" | "contentVersionId" | "kind" | "id">): string {
  return `tenants/${asset.tenantId}/channels/${asset.channelId}/versions/${asset.contentVersionId}/${asset.kind}/${asset.id}`;
}

export function assertMediaAsset(asset: MediaAsset): void {
  if (!asset.storageKey || !asset.checksum || !asset.mimeType) throw new Error("Media asset manifest is incomplete");
  if (asset.status !== "active") throw new Error("Media asset is not active");
}

export function reconcileUncertainUpload(input: { expectedTitle: string; expectedCreatedAfter: number; candidates: UploadCandidate[] }): { state: "reconciled" | "not_found" | "ambiguous"; videoId?: string } {
  const matches = input.candidates.filter(candidate => candidate.title.trim() === input.expectedTitle.trim() && (!candidate.publishedAt || new Date(candidate.publishedAt).getTime() >= input.expectedCreatedAfter));
  if (matches.length === 1) return { state: "reconciled", videoId: matches[0].id };
  if (matches.length > 1) return { state: "ambiguous" };
  return { state: "not_found" };
}

export function classifyProviderError(status: number, code?: string): "retryable" | "quota" | "auth" | "permanent" {
  if (status === 401 || status === 403 && code === "AUTH") return "auth";
  if (status === 429 || code === "QUOTA_EXCEEDED") return "quota";
  if (status >= 500 || status === 408) return "retryable";
  return "permanent";
}

export function makeOperationLog(input: { correlationId: string; tenantId: number; channelId?: number; jobId?: number; stage: string; status: string; provider?: string; durationMs?: number; errorCode?: string }) {
  return { ...input, timestamp: new Date().toISOString() };
}
