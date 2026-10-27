export const CONTENT_STAGES = ["idea", "research", "draft", "production", "review", "approved", "scheduled", "published"] as const;
export type ContentStage = (typeof CONTENT_STAGES)[number];
export type ExternalAction = "upload" | "schedule" | "comment_post";

const transitions: Record<ContentStage, readonly ContentStage[]> = {
  idea: ["research", "draft"],
  research: ["draft", "blocked" as ContentStage],
  draft: ["production", "research"],
  production: ["review", "draft"],
  review: ["approved", "draft"],
  approved: ["scheduled", "published"],
  scheduled: ["published", "approved"],
  published: [],
};

export type JobFailure = { code: string; retryable: boolean; attempts: number; maxAttempts: number };

export function canTransitionContent(from: ContentStage, to: ContentStage): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertContentTransition(from: ContentStage, to: ContentStage): void {
  if (!canTransitionContent(from, to)) throw new Error(`Invalid content transition: ${from} → ${to}`);
}

export function nextFailureState(failure: JobFailure): "retryable_failure" | "dead_letter" | "failed" {
  if (!failure.retryable) return "failed";
  return failure.attempts < failure.maxAttempts ? "retryable_failure" : "dead_letter";
}

export function canPerformExternalAction(input: { action: ExternalAction; contentStage: ContentStage; rightsConfirmed: boolean; finalConfirmation: boolean; }): boolean {
  if (!input.finalConfirmation) return false;
  if (input.action === "comment_post") return input.contentStage === "approved";
  return input.contentStage === "approved" && input.rightsConfirmed;
}

export function assertExternalAction(input: Parameters<typeof canPerformExternalAction>[0]): void {
  if (!input.finalConfirmation) throw new Error("Final operator confirmation is required");
  if (input.action !== "comment_post" && input.contentStage !== "approved") throw new Error("Content must be approved before a YouTube action");
  if (input.action !== "comment_post" && !input.rightsConfirmed) throw new Error("Rights confirmation is required before a YouTube action");
  if (input.action === "comment_post" && input.contentStage !== "approved") throw new Error("Reply draft must be approved before posting");
}
