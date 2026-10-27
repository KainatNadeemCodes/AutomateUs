CREATE TABLE `analyticsSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int NOT NULL,
	`youtubeVideoId` varchar(128) NOT NULL,
	`window` enum('24h','7d','28d') NOT NULL,
	`metrics` json NOT NULL,
	`evidenceQuality` enum('real','partial','simulated') NOT NULL DEFAULT 'real',
	`collectedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsSnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_video_window_idx` UNIQUE(`youtubeVideoId`,`window`)
);
--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int NOT NULL,
	`contentItemId` int,
	`contentVersionId` int,
	`approvalType` enum('content','schedule','upload','comment_reply','learning') NOT NULL,
	`status` enum('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`notes` text,
	`payloadFingerprint` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`targetType` varchar(80),
	`targetId` varchar(128),
	`summary` text,
	`correlationId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channelSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`objective` text,
	`audience` text,
	`contentPillars` json,
	`cadencePerWeek` int NOT NULL DEFAULT 2,
	`defaultFormat` varchar(64) NOT NULL DEFAULT 'explainer',
	`defaultLength` varchar(32) NOT NULL DEFAULT 'medium',
	`primaryKpi` varchar(64) NOT NULL DEFAULT 'subscribers',
	`targetValue` varchar(64),
	`brandVoice` text,
	`editorialGuardrails` text,
	`defaultPrivacy` enum('private','unlisted','public') NOT NULL DEFAULT 'private',
	`requireFinalConfirmation` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channelSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `channelSettings_channelId_unique` UNIQUE(`channelId`)
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`youtubeChannelId` varchar(128) NOT NULL,
	`name` varchar(160) NOT NULL,
	`handle` varchar(160),
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`status` enum('connected','needs_reauth','disconnected') NOT NULL DEFAULT 'connected',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channels_id` PRIMARY KEY(`id`),
	CONSTRAINT `channels_youtube_idx` UNIQUE(`youtubeChannelId`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int NOT NULL,
	`youtubeCommentId` varchar(160) NOT NULL,
	`youtubeVideoId` varchar(128) NOT NULL,
	`authorName` varchar(160),
	`body` text NOT NULL,
	`sentiment` varchar(32),
	`theme` varchar(80),
	`riskState` enum('clear','needs_attention','quarantined') NOT NULL DEFAULT 'clear',
	`permalink` varchar(500),
	`publishedAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`),
	CONSTRAINT `comments_youtubeCommentId_unique` UNIQUE(`youtubeCommentId`)
);
--> statement-breakpoint
CREATE TABLE `contentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`status` enum('idea','research','draft','production','review','approved','scheduled','published','blocked','archived') NOT NULL DEFAULT 'idea',
	`currentVersionId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentItemId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`researchBrief` json,
	`script` text,
	`metadata` json,
	`thumbnailBrief` json,
	`qualityChecks` json,
	`provenance` json,
	`rightsState` enum('unreviewed','confirmed','blocked') NOT NULL DEFAULT 'unreviewed',
	`reviewState` enum('draft','needs_review','approved','rejected','stale') NOT NULL DEFAULT 'draft',
	`inputFingerprint` varchar(128),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_version_item_number_idx` UNIQUE(`contentItemId`,`versionNumber`)
);
--> statement-breakpoint
CREATE TABLE `jobCheckpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`stage` varchar(64) NOT NULL,
	`status` enum('started','completed','failed','skipped') NOT NULL,
	`attempt` int NOT NULL DEFAULT 1,
	`inputFingerprint` varchar(128),
	`outputFingerprint` varchar(128),
	`providerTaskId` varchar(180),
	`outputStorageKey` varchar(255),
	`errorCode` varchar(80),
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `jobCheckpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','editor','producer','analyst','viewer') NOT NULL DEFAULT 'viewer',
	`status` enum('active','invited','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `membership_tenant_user_idx` UNIQUE(`tenantId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `productionJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int NOT NULL,
	`contentItemId` int NOT NULL,
	`contentVersionId` int NOT NULL,
	`idempotencyKey` varchar(180) NOT NULL,
	`status` enum('queued','running','waiting_review','retryable_failure','failed','cancelled','completed','dead_letter') NOT NULL DEFAULT 'queued',
	`stage` varchar(64) NOT NULL DEFAULT 'research',
	`attemptCount` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`progress` int NOT NULL DEFAULT 0,
	`leaseExpiresAt` timestamp,
	`nextAttemptAt` timestamp,
	`providerTaskId` varchar(180),
	`errorCode` varchar(80),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productionJobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `production_job_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `providerCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int,
	`provider` varchar(80) NOT NULL,
	`encryptedSecretRef` varchar(255) NOT NULL,
	`keyVersion` varchar(32) NOT NULL DEFAULT 'v1',
	`scopes` json,
	`status` enum('active','invalid','revoked') NOT NULL DEFAULT 'active',
	`lastValidatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providerCredentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `replyDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`channelId` int NOT NULL,
	`commentId` int NOT NULL,
	`draftText` text NOT NULL,
	`status` enum('pending','approved','rejected','posted','blocked') NOT NULL DEFAULT 'pending',
	`riskFlags` json,
	`approvedBy` int,
	`approvedAt` timestamp,
	`postedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `replyDrafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `analytics_channel_idx` ON `analyticsSnapshots` (`channelId`);--> statement-breakpoint
CREATE INDEX `approval_channel_status_idx` ON `approvals` (`channelId`,`status`);--> statement-breakpoint
CREATE INDEX `audit_tenant_idx` ON `auditEvents` (`tenantId`);--> statement-breakpoint
CREATE INDEX `audit_target_idx` ON `auditEvents` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `channels_tenant_idx` ON `channels` (`tenantId`);--> statement-breakpoint
CREATE INDEX `comments_channel_idx` ON `comments` (`channelId`);--> statement-breakpoint
CREATE INDEX `comments_video_idx` ON `comments` (`youtubeVideoId`);--> statement-breakpoint
CREATE INDEX `content_channel_idx` ON `contentItems` (`channelId`);--> statement-breakpoint
CREATE INDEX `content_status_idx` ON `contentItems` (`status`);--> statement-breakpoint
CREATE INDEX `job_checkpoint_job_idx` ON `jobCheckpoints` (`jobId`);--> statement-breakpoint
CREATE INDEX `membership_user_idx` ON `memberships` (`userId`);--> statement-breakpoint
CREATE INDEX `production_job_channel_status_idx` ON `productionJobs` (`channelId`,`status`);--> statement-breakpoint
CREATE INDEX `provider_credentials_tenant_idx` ON `providerCredentials` (`tenantId`);--> statement-breakpoint
CREATE INDEX `provider_credentials_provider_idx` ON `providerCredentials` (`provider`);--> statement-breakpoint
CREATE INDEX `reply_draft_channel_status_idx` ON `replyDrafts` (`channelId`,`status`);