import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { assertContentTransition, assertExternalAction, nextFailureState } from "../automation-domain";
import { getProviderCredentialStatus, revokeProviderCredential, saveProviderCredential } from "../credential-service";

export const automationRouter = router({
  status: protectedProcedure.query(({ ctx }) => ({
    tenant: { id: ctx.user.id, name: "Workspace" },
    approvalFirst: true,
    irreversibleActionsRequireConfirmation: true,
    supportedStages: ["idea", "research", "draft", "production", "review", "approved", "scheduled", "published"],
  })),
  validateTransition: protectedProcedure.input(z.object({ from: z.string(), to: z.string() })).mutation(({ input }) => {
    assertContentTransition(input.from as Parameters<typeof assertContentTransition>[0], input.to as Parameters<typeof assertContentTransition>[1]);
    return { valid: true, from: input.from, to: input.to };
  }),
  validateExternalAction: protectedProcedure.input(z.object({ action: z.enum(["upload", "schedule", "comment_post"]), contentStage: z.string(), rightsConfirmed: z.boolean(), finalConfirmation: z.boolean() })).mutation(({ input }) => {
    assertExternalAction({ ...input, contentStage: input.contentStage as Parameters<typeof assertExternalAction>[0]["contentStage"] });
    return { valid: true, action: input.action };
  }),
  classifyFailure: protectedProcedure.input(z.object({ code: z.string(), retryable: z.boolean(), attempts: z.number().int().min(0), maxAttempts: z.number().int().positive() })).query(({ input }) => ({ state: nextFailureState(input) })),
  saveCredential: protectedProcedure.input(z.object({ provider: z.string().min(1).max(80), secret: z.string().min(1), channelId: z.number().int().positive().nullable().optional(), scopes: z.array(z.string()).optional() })).mutation(({ ctx, input }) => saveProviderCredential({ userId: ctx.user.id, tenantId: ctx.user.id }, input)),
  credentialStatus: protectedProcedure.input(z.object({ provider: z.string().min(1).max(80) })).query(({ ctx, input }) => getProviderCredentialStatus({ userId: ctx.user.id, tenantId: ctx.user.id }, input.provider)),
  revokeCredential: protectedProcedure.input(z.object({ provider: z.string().min(1).max(80) })).mutation(({ ctx, input }) => revokeProviderCredential({ userId: ctx.user.id, tenantId: ctx.user.id }, input.provider)),
});
