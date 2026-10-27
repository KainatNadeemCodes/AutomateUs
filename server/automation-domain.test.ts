import { describe, expect, it } from "vitest";
import { assertContentTransition, assertExternalAction, canPerformExternalAction, nextFailureState } from "./automation-domain";

describe("automation workflow contract", () => {
  it("allows only forward or intentional repair transitions", () => {
    expect(() => assertContentTransition("research", "draft")).not.toThrow();
    expect(() => assertContentTransition("review", "approved")).not.toThrow();
    expect(() => assertContentTransition("idea", "published")).toThrow("Invalid content transition");
  });

  it("moves retryable failures to dead letter after the attempt limit", () => {
    expect(nextFailureState({ code: "TIMEOUT", retryable: true, attempts: 1, maxAttempts: 3 })).toBe("retryable_failure");
    expect(nextFailureState({ code: "TIMEOUT", retryable: true, attempts: 3, maxAttempts: 3 })).toBe("dead_letter");
    expect(nextFailureState({ code: "POLICY", retryable: false, attempts: 1, maxAttempts: 3 })).toBe("failed");
  });

  it("requires confirmation and rights for YouTube actions", () => {
    expect(canPerformExternalAction({ action: "upload", contentStage: "approved", rightsConfirmed: true, finalConfirmation: true })).toBe(true);
    expect(canPerformExternalAction({ action: "upload", contentStage: "approved", rightsConfirmed: true, finalConfirmation: false })).toBe(false);
    expect(() => assertExternalAction({ action: "schedule", contentStage: "review", rightsConfirmed: true, finalConfirmation: true })).toThrow("approved");
    expect(() => assertExternalAction({ action: "upload", contentStage: "approved", rightsConfirmed: false, finalConfirmation: true })).toThrow("Rights");
    expect(() => assertExternalAction({ action: "comment_post", contentStage: "approved", rightsConfirmed: false, finalConfirmation: false })).toThrow("confirmation");
  });
});
