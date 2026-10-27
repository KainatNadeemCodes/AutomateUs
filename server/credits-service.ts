import { eq, sql } from "drizzle-orm";
import { creditBalances, creditTransactions } from "../drizzle/schema";
import { getDb } from "./db";

export const ACTION_COSTS = {
  SCRIPT_GENERATION: 5,
  THUMBNAIL_GENERATION: 10,
  TTS_NARRATION: 15,
  VIDEO_RENDER: 50,
  YOUTUBE_UPLOAD: 5,
} as const;

export const INITIAL_CREDITS = 150;

/**
 * Grants initial credits to a newly provisioned tenant.
 */
export async function provisionNewTenantCredits(tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    // Check if balance already exists
    const existing = await tx.select().from(creditBalances).where(eq(creditBalances.tenantId, tenantId)).limit(1);
    if (existing.length > 0) {
      return; // Already provisioned
    }

    await tx.insert(creditBalances).values({
      tenantId,
      balance: INITIAL_CREDITS,
    });

    await tx.insert(creditTransactions).values({
      tenantId,
      amount: INITIAL_CREDITS,
      reason: "Initial signup grant",
    });
  });
}

/**
 * Check if the tenant has enough credits for a given action.
 */
export async function hasSufficientCredits(tenantId: number, estimatedCost: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const balanceResult = await db.select({ balance: creditBalances.balance }).from(creditBalances).where(eq(creditBalances.tenantId, tenantId)).limit(1);

  if (balanceResult.length === 0) {
    return false;
  }

  return balanceResult[0].balance >= estimatedCost;
}

/**
 * Deduct credits for a billed action in a single atomic transaction.
 */
export async function deductCredits(
  tenantId: number,
  amount: number,
  reason: string,
  options?: { jobId?: number; contentItemId?: number }
) {
  if (amount <= 0) {
    throw new Error("Amount to deduct must be positive");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    // 1. Check current balance and update atomically
    const updateResult = await tx
      .update(creditBalances)
      .set({
        balance: sql`${creditBalances.balance} - ${amount}`,
        updatedAt: new Date()
      })
      .where(sql`${creditBalances.tenantId} = ${tenantId} AND ${creditBalances.balance} >= ${amount}`);
    
    if (updateResult[0].affectedRows === 0) {
      throw new Error(`Insufficient credits for tenant ${tenantId}. Requested: ${amount}`);
    }

    // 2. Write the transaction log
    await tx.insert(creditTransactions).values({
      tenantId,
      amount: -amount,
      reason,
      jobId: options?.jobId,
      contentItemId: options?.contentItemId,
    });
  });
}

/**
 * Manual top-up for admins
 */
export async function topUpCredits(tenantId: number, amount: number, reason: string) {
  if (amount <= 0) {
    throw new Error("Amount to top up must be positive");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    await tx
      .update(creditBalances)
      .set({
        balance: sql`${creditBalances.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(creditBalances.tenantId, tenantId));
    
    await tx.insert(creditTransactions).values({
      tenantId,
      amount: amount,
      reason,
    });
  });
}
