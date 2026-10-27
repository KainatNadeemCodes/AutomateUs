# Project TODO

- [x] Define multi-tenant workspace model for users, channels, roles, permissions, and per-channel settings
- [x] Add encrypted provider credential storage and credential access auditing
- [x] Build signed-in multi-channel dashboard with overview metrics, active jobs, decision queue, calendar, activity feed, and channel configuration
- [x] Build channel strategy workspace for audience, content pillars, cadence, goals, format, brand voice, and editorial guardrails
- [x] Implement content pipeline from researched topic to script, thumbnail brief, SEO metadata, narration, visuals, and final video package
- [x] Implement approval-first Review Studio with editable content, quality checklist, provenance, rights confirmation, and approve-before-scheduling gate
- [x] Implement durable staged production jobs with checkpoints, retries, idempotency, resumable execution, failure visibility, and dead-letter/review path
- [x] Define MVP managed-cloud background task architecture using platform-managed scheduled callbacks; prohibit in-process timers
- [x] Define scale architecture with separate containerized media worker for FFmpeg-heavy rendering
- [x] Define cloud media storage, asset metadata, versioned outputs, captions, thumbnails, and lifecycle cleanup
- [x] Implement LLM structured outputs for research briefs, scripts, metadata, thumbnail briefs, quality checks, analytics insights, and reply drafts
- [x] Define secure YouTube OAuth channel connection, token refresh, channel selection, least-privilege scopes, upload, privacy, and scheduling controls
- [x] Enforce final operator confirmation before every YouTube upload or scheduling action
- [x] Define uncertain-upload reconciliation and quota/error visibility
- [x] Implement analytics snapshots, video comparisons, evidence-backed learning recommendations, and approval-gated feedback loop
- [x] Implement audience comment sync, question/sentiment organization, reply drafting, and approval-gated comment posting
- [x] Add audit logs for strategy changes, approvals, credential events, uploads, schedules, and comment actions
- [x] Add unit/integration tests for approval gates, idempotency, retry behavior, authorization, and external API adapters
- [x] Define observability for job traces, structured logs, metrics, alerts, and operator-facing failure reasons
- [x] Complete security/privacy review plan, YouTube policy review plan, launch checklist, and measurable success metrics
- [x] Capture final visual and functional verification before first delivery
- [x] Produce architecture, deployment comparison, roadmap, and launch planning document for team discussion

# Phase-one follow-up backlog

- [ ] Replace demo dashboard records with persisted, tenant-scoped tRPC queries and mutations
- [ ] Implement real Review Studio editing, version persistence, stale-check invalidation, and approval mutations
- [ ] Implement real durable job dispatcher, scheduled callbacks, checkpoint writes, retries, resume, cancellation, and dead-letter handling
- [ ] Integrate the selected LLM provider with schema-validated structured outputs and prompt/version tracking
- [ ] Implement object-storage upload/download lifecycle for source assets, generated media, captions, thumbnails, and final packages
- [ ] Implement real YouTube OAuth connection, channel selection, encrypted refresh-token refresh, least-privilege scopes, and channel health
- [ ] Implement confirmed YouTube upload and scheduling operations with idempotency, quota monitoring, and uncertain-upload reconciliation
- [ ] Implement real analytics snapshot collection, comparisons, evidence-backed recommendation generation, and approval workflow
- [ ] Implement real comment synchronization, classification, reply drafting, approval, confirmation, and posting safeguards
- [ ] Add full audit-event writes for strategy edits, approvals, credentials, jobs, media, YouTube actions, analytics, and comments
- [ ] Add production observability, alerts, dashboards, retention policies, incident runbooks, and security/policy sign-off
- [ ] Build and validate the containerized FFmpeg media worker for scale workloads
- [ ] Complete pilot launch testing with a private or unlisted channel and document go-live approval
