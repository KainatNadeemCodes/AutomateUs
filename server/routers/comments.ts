import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { comments, replyDrafts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const commentsRouter = router({
  list: protectedProcedure.input(z.object({
    channelId: z.number().int().positive()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(comments).where(
      and(
        eq(comments.tenantId, ctx.user.id),
        eq(comments.channelId, input.channelId)
      )
    );
  }),

  getReplyDrafts: protectedProcedure.input(z.object({
    commentId: z.number().int().positive()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(replyDrafts).where(
      and(
        eq(replyDrafts.tenantId, ctx.user.id),
        eq(replyDrafts.commentId, input.commentId)
      )
    );
  }),
});
