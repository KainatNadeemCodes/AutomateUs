import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { channels, oauthStates, providerCredentials } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export const channelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(channels).where(eq(channels.tenantId, ctx.user.id));
  }),

  create: protectedProcedure.input(z.object({
    name: z.string().min(1),
    youtubeChannelId: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const insertResult = await db.insert(channels).values({
      tenantId: ctx.user.id,
      name: input.name,
      youtubeChannelId: input.youtubeChannelId,
    });
    
    return { success: true, channelId: insertResult[0].insertId };
  }),

  // Generate OAuth state with replay protection
  generateOAuthState: protectedProcedure.input(z.object({
    redirectUri: z.string().url(),
    channelId: z.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const state = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await db.insert(oauthStates).values({
      state,
      tenantId: ctx.user.id,
      channelId: input.channelId,
      redirectUri: input.redirectUri,
      expiresAt,
    });

    return { state };
  }),

  // Validate and consume OAuth state to prevent replay attacks
  // In a real flow, this is called by the OAuth callback handler
  consumeOAuthState: protectedProcedure.input(z.object({
    state: z.string().min(1),
    code: z.string().min(1) // Authorization code from Google
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.transaction(async (tx) => {
      const stateRecords = await tx.select().from(oauthStates).where(eq(oauthStates.state, input.state)).limit(1);
      
      if (stateRecords.length === 0) {
        throw new Error("Invalid OAuth state");
      }
      
      const record = stateRecords[0];
      
      if (record.tenantId !== ctx.user.id) {
        throw new Error("State does not belong to this tenant");
      }
      
      if (record.consumedAt) {
        throw new Error("OAuth state has already been consumed (replay attempt detected)");
      }
      
      if (record.expiresAt < new Date()) {
        throw new Error("OAuth state has expired");
      }
      
      // Mark as consumed
      await tx.update(oauthStates).set({ consumedAt: new Date() }).where(eq(oauthStates.state, input.state));
      
      // Here you would typically exchange the code for tokens via Google API
      // Since this is a milestone, we mock storing a refresh token
      
      await tx.insert(providerCredentials).values({
        tenantId: ctx.user.id,
        channelId: record.channelId,
        provider: "google_oauth_platform",
        encryptedSecretRef: "mock_encrypted_refresh_token_ref", // Mocked
        scopes: ["https://www.googleapis.com/auth/youtube.upload"]
      });

      return { success: true };
    });
  }),
});
