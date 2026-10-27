import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { analyticsSnapshots } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const analyticsRouter = router({
  list: protectedProcedure.input(z.object({
    channelId: z.number().int().positive()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(analyticsSnapshots).where(
      and(
        eq(analyticsSnapshots.tenantId, ctx.user.id),
        eq(analyticsSnapshots.channelId, input.channelId)
      )
    );
  }),
});
