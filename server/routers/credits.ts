import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { deductCredits, hasSufficientCredits, topUpCredits, ACTION_COSTS } from "../credits-service";
import { getDb } from "../db";
import { creditBalances, creditTransactions } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const creditsRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Assume ctx.user.tenantId is the same as ctx.user.id for now based on automation router
    const tenantId = ctx.user.id; 

    const balanceResult = await db.select().from(creditBalances).where(eq(creditBalances.tenantId, tenantId)).limit(1);
    if (balanceResult.length === 0) {
      return { balance: 0 };
    }
    return { balance: balanceResult[0].balance };
  }),

  getTransactionHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tenantId = ctx.user.id;

    const history = await db.select()
      .from(creditTransactions)
      .where(eq(creditTransactions.tenantId, tenantId))
      .orderBy(desc(creditTransactions.timestamp))
      .limit(50);

    return history;
  }),

  adminTopUp: protectedProcedure.input(z.object({
    amount: z.number().int().positive(),
    reason: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can top up credits");
    }
    
    // For this milestone we assume topping up the current tenant
    // In a real system, admin would specify which tenantId
    const tenantId = ctx.user.id;
    await topUpCredits(tenantId, input.amount, input.reason);
    return { success: true, toppedUp: input.amount };
  }),

  // Helper route to simulate a billable action for testing
  simulateBillableAction: protectedProcedure.input(z.object({
    action: z.enum(["SCRIPT_GENERATION", "THUMBNAIL_GENERATION", "TTS_NARRATION", "VIDEO_RENDER", "YOUTUBE_UPLOAD"])
  })).mutation(async ({ ctx, input }) => {
    const tenantId = ctx.user.id;
    const cost = ACTION_COSTS[input.action];

    const hasCredits = await hasSufficientCredits(tenantId, cost);
    if (!hasCredits) {
      throw new Error(`Insufficient credits to perform ${input.action}`);
    }

    // Do the "mock" action here using our providers (skipping actual call in this route, just billing)
    await deductCredits(tenantId, cost, `Simulated ${input.action}`);
    
    return { success: true, costDeducted: cost };
  })
});
