import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contentItems, contentVersions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const contentRouter = router({
  list: protectedProcedure.input(z.object({
    channelId: z.number().int().positive()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(contentItems).where(
      and(
        eq(contentItems.tenantId, ctx.user.id),
        eq(contentItems.channelId, input.channelId)
      )
    );
  }),
  
  create: protectedProcedure.input(z.object({
    channelId: z.number().int().positive(),
    topic: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const insertResult = await db.insert(contentItems).values({
      tenantId: ctx.user.id,
      channelId: input.channelId,
      topic: input.topic,
      createdBy: ctx.user.id,
    });

    return { success: true, contentItemId: insertResult[0].insertId };
  }),
});
