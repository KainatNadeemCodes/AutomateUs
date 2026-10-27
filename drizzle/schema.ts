import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "editor", "producer", "analyst", "viewer"]).default("viewer").notNull(),
  status: mysqlEnum("status", ["active", "invited", "revoked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ tenantUser: uniqueIndex("membership_tenant_user_idx").on(table.tenantId, table.userId), userIdx: index("membership_user_idx").on(table.userId) }));

export const channels = mysqlTable("channels", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  youtubeChannelId: varchar("youtubeChannelId", { length: 128 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  handle: varchar("handle", { length: 160 }),
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
  status: mysqlEnum("status", ["connected", "needs_reauth", "disconnected"]).default("connected").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ tenantIdx: index("channels_tenant_idx").on(table.tenantId), youtubeIdx: uniqueIndex("channels_youtube_idx").on(table.youtubeChannelId) }));

export const channelSettings = mysqlTable("channelSettings", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull().unique(),
  objective: text("objective"),
  audience: text("audience"),
  contentPillars: json("contentPillars"),
  cadencePerWeek: int("cadencePerWeek").default(2).notNull(),
  defaultFormat: varchar("defaultFormat", { length: 64 }).default("explainer").notNull(),
  defaultLength: varchar("defaultLength", { length: 32 }).default("medium").notNull(),
  primaryKpi: varchar("primaryKpi", { length: 64 }).default("subscribers").notNull(),
  targetValue: varchar("targetValue", { length: 64 }),
  brandVoice: text("brandVoice"),
  editorialGuardrails: text("editorialGuardrails"),
  defaultPrivacy: mysqlEnum("defaultPrivacy", ["private", "unlisted", "public"]).default("private").notNull(),
  requireFinalConfirmation: int("requireFinalConfirmation").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const providerCredentials = mysqlTable("providerCredentials", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId"),
  provider: varchar("provider", { length: 80 }).notNull(),
  encryptedSecretRef: varchar("encryptedSecretRef", { length: 255 }).notNull(),
  keyVersion: varchar("keyVersion", { length: 32 }).default("v1").notNull(),
  scopes: json("scopes"),
  status: mysqlEnum("status", ["active", "invalid", "revoked"]).default("active").notNull(),
  lastValidatedAt: timestamp("lastValidatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ tenantIdx: index("provider_credentials_tenant_idx").on(table.tenantId), providerIdx: index("provider_credentials_provider_idx").on(table.provider) }));

export const contentItems = mysqlTable("contentItems", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["idea", "research", "draft", "production", "review", "approved", "scheduled", "published", "blocked", "archived"]).default("idea").notNull(),
  currentVersionId: int("currentVersionId"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ channelIdx: index("content_channel_idx").on(table.channelId), statusIdx: index("content_status_idx").on(table.status) }));

export const contentVersions = mysqlTable("contentVersions", {
  id: int("id").autoincrement().primaryKey(),
  contentItemId: int("contentItemId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  researchBrief: json("researchBrief"),
  script: text("script"),
  metadata: json("metadata"),
  thumbnailBrief: json("thumbnailBrief"),
  qualityChecks: json("qualityChecks"),
  provenance: json("provenance"),
  rightsState: mysqlEnum("rightsState", ["unreviewed", "confirmed", "blocked"]).default("unreviewed").notNull(),
  reviewState: mysqlEnum("reviewState", ["draft", "needs_review", "approved", "rejected", "stale"]).default("draft").notNull(),
  inputFingerprint: varchar("inputFingerprint", { length: 128 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ itemVersion: uniqueIndex("content_version_item_number_idx").on(table.contentItemId, table.versionNumber) }));

export const productionJobs = mysqlTable("productionJobs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId").notNull(),
  contentItemId: int("contentItemId").notNull(),
  contentVersionId: int("contentVersionId").notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["queued", "running", "waiting_review", "retryable_failure", "failed", "cancelled", "completed", "dead_letter"]).default("queued").notNull(),
  stage: varchar("stage", { length: 64 }).default("research").notNull(),
  attemptCount: int("attemptCount").default(0).notNull(),
  maxAttempts: int("maxAttempts").default(3).notNull(),
  progress: int("progress").default(0).notNull(),
  leaseExpiresAt: timestamp("leaseExpiresAt"),
  nextAttemptAt: timestamp("nextAttemptAt"),
  providerTaskId: varchar("providerTaskId", { length: 180 }),
  errorCode: varchar("errorCode", { length: 80 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ idemIdx: uniqueIndex("production_job_idempotency_idx").on(table.idempotencyKey), channelStatusIdx: index("production_job_channel_status_idx").on(table.channelId, table.status) }));

export const jobCheckpoints = mysqlTable("jobCheckpoints", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  stage: varchar("stage", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["started", "completed", "failed", "skipped"]).notNull(),
  attempt: int("attempt").default(1).notNull(),
  inputFingerprint: varchar("inputFingerprint", { length: 128 }),
  outputFingerprint: varchar("outputFingerprint", { length: 128 }),
  providerTaskId: varchar("providerTaskId", { length: 180 }),
  outputStorageKey: varchar("outputStorageKey", { length: 255 }),
  errorCode: varchar("errorCode", { length: 80 }),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({ jobIdx: index("job_checkpoint_job_idx").on(table.jobId) }));

export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId").notNull(),
  contentItemId: int("contentItemId"),
  contentVersionId: int("contentVersionId"),
  approvalType: mysqlEnum("approvalType", ["content", "schedule", "upload", "comment_reply", "learning"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "expired"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  notes: text("notes"),
  payloadFingerprint: varchar("payloadFingerprint", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ approvalIdx: index("approval_channel_status_idx").on(table.channelId, table.status) }));

export const analyticsSnapshots = mysqlTable("analyticsSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId").notNull(),
  youtubeVideoId: varchar("youtubeVideoId", { length: 128 }).notNull(),
  window: mysqlEnum("window", ["24h", "7d", "28d"]).notNull(),
  metrics: json("metrics").notNull(),
  evidenceQuality: mysqlEnum("evidenceQuality", ["real", "partial", "simulated"]).default("real").notNull(),
  collectedAt: timestamp("collectedAt").defaultNow().notNull(),
}, (table) => ({ videoWindowIdx: uniqueIndex("analytics_video_window_idx").on(table.youtubeVideoId, table.window), channelIdx: index("analytics_channel_idx").on(table.channelId) }));

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId").notNull(),
  youtubeCommentId: varchar("youtubeCommentId", { length: 160 }).notNull().unique(),
  youtubeVideoId: varchar("youtubeVideoId", { length: 128 }).notNull(),
  authorName: varchar("authorName", { length: 160 }),
  body: text("body").notNull(),
  sentiment: varchar("sentiment", { length: 32 }),
  theme: varchar("theme", { length: 80 }),
  riskState: mysqlEnum("riskState", ["clear", "needs_attention", "quarantined"]).default("clear").notNull(),
  permalink: varchar("permalink", { length: 500 }),
  publishedAt: timestamp("publishedAt"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
}, (table) => ({ channelIdx: index("comments_channel_idx").on(table.channelId), videoIdx: index("comments_video_idx").on(table.youtubeVideoId) }));

export const replyDrafts = mysqlTable("replyDrafts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId").notNull(),
  commentId: int("commentId").notNull(),
  draftText: text("draftText").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "posted", "blocked"]).default("pending").notNull(),
  riskFlags: json("riskFlags"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  postedAt: timestamp("postedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ channelStatusIdx: index("reply_draft_channel_status_idx").on(table.channelId, table.status) }));

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId"),
  actorUserId: int("actorUserId"),
  action: varchar("action", { length: 120 }).notNull(),
  targetType: varchar("targetType", { length: 80 }),
  targetId: varchar("targetId", { length: 128 }),
  summary: text("summary"),
  correlationId: varchar("correlationId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ tenantIdx: index("audit_tenant_idx").on(table.tenantId), targetIdx: index("audit_target_idx").on(table.targetType, table.targetId) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type ContentItem = typeof contentItems.$inferSelect;
export type ProductionJob = typeof productionJobs.$inferSelect;

export const creditBalances = mysqlTable("creditBalances", {
  tenantId: int("tenantId").primaryKey(),
  balance: int("balance").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 120 }).notNull(),
  jobId: int("jobId"),
  contentItemId: int("contentItemId"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("credit_tx_tenant_idx").on(table.tenantId)
}));

export const oauthStates = mysqlTable("oauthStates", {
  state: varchar("state", { length: 128 }).primaryKey(),
  tenantId: int("tenantId").notNull(),
  channelId: int("channelId"),
  redirectUri: varchar("redirectUri", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
});

export type CreditBalance = typeof creditBalances.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type OauthState = typeof oauthStates.$inferSelect;
