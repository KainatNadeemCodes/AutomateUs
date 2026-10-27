import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { productionJobs, jobCheckpoints } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const jobsRouter = router({
  list: protectedProcedure.input(z.object({
    channelId: z.number().int().positive()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(productionJobs).where(
      and(
        eq(productionJobs.tenantId, ctx.user.id),
        eq(productionJobs.channelId, input.channelId)
      )
    );
  }),
  
  getCheckpoints: protectedProcedure.input(z.object({
    jobId: z.number().int().positive()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Ideally we would verify the job belongs to the tenant here as well
    return await db.select().from(jobCheckpoints).where(eq(jobCheckpoints.jobId, input.jobId));
  }),
});
