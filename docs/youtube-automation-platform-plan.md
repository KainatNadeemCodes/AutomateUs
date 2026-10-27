# YouTube Automation Platform
## Approval-First Cloud MVP and Scale Plan

**Status:** Team discussion draft  
**Prepared by:** Manus AI  
**Reference product:** [darkzOGx/youtube-automation-agent](https://github.com/darkzOGx/youtube-automation-agent)

## 1. Executive direction

We should build a multi-tenant YouTube operations workspace rather than a fully autonomous publishing bot. The product’s central promise is that AI can perform the high-volume preparation work—research, planning, scripting, packaging, production coordination, analytics interpretation, and reply drafting—while a human operator retains authority over every consequential action.

The reference repository demonstrates the right product decomposition: specialized agents for strategy, scripts, thumbnails, SEO, production, publishing, and analytics; a dashboard with a decision queue and calendar; durable production checkpoints; provenance and rights review; performance learning; and audience engagement. Our implementation should preserve that operating model while replacing its local-process assumptions with a cloud control plane, managed background callbacks for the MVP, and a separately deployable media worker for heavier rendering.

> **Non-negotiable policy:** No video may be scheduled or uploaded, and no comment reply may be posted, unless an authenticated operator performs an explicit confirmation action immediately before the external API call. Recommendations, generated drafts, and experiment results remain pending until approved.

## 2. Product principles

The platform should be designed around five principles. First, **human authority**: AI proposes; an operator approves. Second, **durable state**: every meaningful stage, decision, asset, and external task identity is persisted. Third, **evidence before learning**: analytics recommendations must cite the measurements and assumptions behind them. Fourth, **least privilege**: each user, service, channel connection, and worker receives only the access it needs. Fifth, **reversible operations**: failed jobs, uncertain uploads, bad assets, and incorrect recommendations must have a visible recovery path.

The first release should optimize for one reliable end-to-end workflow across a small number of channels, not for maximum provider coverage. More providers and advanced experimentation can be added after the approval, job, and reconciliation primitives are proven.

## 3. Recommended deployment options

We should support two deployment shapes. The first is the recommended MVP because it minimizes operational burden and validates the product quickly. The second becomes appropriate when production rendering volume, queue duration, concurrency, or media-tooling requirements exceed the managed application’s limits.

| Approach | What runs where | Cost profile | Operational trade-offs | Setup complexity | Recommended use |
|---|---|---|---|---|---|
| **Managed web application with scheduled background tasks** | React dashboard, authenticated API, relational database, object storage, short-lived scheduled handlers, and lightweight LLM/API orchestration | Low fixed infrastructure cost; generally usage-based for application requests, database, storage, LLM calls, and external APIs | Fastest to ship and easiest to operate. Background handlers must be idempotent and bounded; heavy FFmpeg work should be delegated or limited. No in-process timers. | Low to medium | **Approval-first MVP**, early pilots, low-to-moderate production volume, and workflows where rendering can be short or outsourced |
| **Managed control plane plus containerized media-worker service** | The web app remains the control plane; a queue dispatches jobs to one or more containers with FFmpeg, media adapters, and optional specialized runtimes | Additional worker compute, persistent queue, media storage, egress, logs, and possibly GPU/provider costs. Usually higher and more variable than the MVP shape. | Better isolation, concurrency, retry control, and long-running rendering. Requires queue operations, worker autoscaling, container security, artifact cleanup, and stronger observability. | Medium to high | **Scale phase**, high render volume, long videos, parallel channel operations, custom codecs/tools, or strict worker isolation |

The managed application should use platform-managed scheduled callbacks for recurring work such as analytics snapshots, comment synchronization, cleanup, and publishing-queue checks. It must not depend on `setInterval`, `node-cron`, or an in-process timer. Each scheduled callback should authenticate the scheduler, identify its owning business record by the scheduler task identifier, run idempotently, and return a bounded result.

The scale architecture should treat the web application as the **control plane** and the worker service as a **data-plane executor**. The control plane owns users, channels, approvals, job state, policies, credentials, and audit history. The worker receives a signed job lease, downloads only the required source assets, renders or generates the requested artifact, uploads the result to object storage, reports a checksum and metadata, and never decides whether content may publish.

## 4. Multi-tenant control plane

The system should be tenant-safe from the first schema migration. A tenant may initially map to a team or account, while a user may belong to one or more tenants. Each channel belongs to exactly one tenant. Every query and mutation must carry an ownership boundary derived from the authenticated session, never from an untrusted client-supplied tenant identifier.

| Domain object | Purpose | Important fields |
|---|---|---|
| **Tenant** | Team/account boundary | id, name, plan, status, createdAt |
| **User** | Authenticated person | id, identity, email, status, lastSignIn |
| **Membership** | User-to-tenant relationship | tenantId, userId, role, status |
| **Channel** | Connected YouTube workspace | tenantId, YouTube channel id, display name, timezone, status |
| **Channel settings** | Per-channel operating policy | cadence, format defaults, voice, guardrails, privacy default, approval policy |
| **Provider credential** | Encrypted reference to an AI or YouTube credential | tenantId/channelId, provider, encrypted secret, key version, status, lastValidatedAt |
| **Audit event** | Immutable operational record | actor, tenant, channel, action, target, before/after summary, timestamp, correlationId |

The initial roles should be **Owner**, **Admin**, **Editor**, **Producer**, **Analyst**, and **Viewer**. Owners and Admins manage connections and policy. Editors can change strategy and content. Producers can operate jobs and Review Studio. Analysts can inspect performance and propose learnings. Viewers have read-only access. Uploading, scheduling, and comment posting should require a distinct permission plus the final confirmation challenge, even for Owners.

Provider credentials must be encrypted at rest using a managed secret or envelope-encryption mechanism. The browser must never receive raw refresh tokens or provider API keys. The server should expose only provider status, masked identifiers, scopes, and validation results. Credential reads, rotations, failures, and deletions must create audit events.

## 5. Core approval-first workflow

The primary workflow is a state machine. Every transition should be explicit, validated server-side, and recorded in an audit log. A UI button is not an approval by itself; the server must verify the current actor, channel, content version, policy state, and confirmation token before executing an external side effect.

| Stage | AI/system responsibility | Human responsibility | Blocking rule |
|---|---|---|---|
| **Strategy** | Convert channel settings into planning constraints | Define audience, pillars, cadence, goals, voice, and boundaries | No autonomous run without an active strategy |
| **Research** | Produce a structured brief with claims, sources, angle, and risks | Verify relevance and acceptable sources | Unsupported high-risk claims block progress |
| **Idea** | Suggest topics and rationale | Approve, edit, defer, or reject | Only approved ideas enter production |
| **Script** | Draft hook, outline, narration, CTA, and factual claims | Edit and approve script version | Unreviewed or stale script cannot publish |
| **Packaging** | Suggest title options, description, tags, thumbnail brief, and disclosure flags | Select/edit final package | Metadata belongs to a specific content version |
| **Production** | Generate narration, visuals, captions, thumbnail, and MP4 | Review status and repair failures | Missing, stale, simulated, or failed assets block approval |
| **Review Studio** | Run quality checks and surface findings | Confirm facts, rights, edits, and final package | Explicit approval is required before scheduling |
| **Scheduling** | Validate privacy, time zone, and queue readiness | Confirm the exact channel, privacy, and publish time | Final operator confirmation immediately before API call |
| **Publishing** | Execute the approved, idempotent upload | Reconcile uncertain outcomes | Never retry blindly after ambiguous upload |
| **Learning** | Compare real snapshots and draft recommendations | Approve or reject each learning | Pending learning cannot affect future plans |
| **Engagement** | Classify comments and draft replies | Edit and approve each reply | Final confirmation immediately before posting |

A content record must be versioned. If an operator edits the script, metadata, thumbnail, or narration after a quality check, the relevant checks become stale and the content returns to review. Approved or scheduled content should be locked against silent mutation; edits create a new version or require an explicit unschedule/review path.

## 6. LLM orchestration

The LLM should be used through typed, schema-constrained procedures rather than free-form text pasted directly into production. Each call should include the channel strategy, approved topic context, content version, brand voice, editorial guardrails, and any required evidence. The response should be validated with a runtime schema before persistence.

| LLM capability | Structured output |
|---|---|
| Research brief | topic, audience need, angle, outline, source list, claim list, uncertainty, safety flags |
| Script | hook, scenes/sections, narration, on-screen text, CTA, factual claims, source links |
| Metadata | title variants, selected title, description, chapters, tags, category, disclosure recommendation |
| Thumbnail brief | visual concept, composition, text limits, contrast notes, generation prompt, rights notes |
| Quality check | check id, severity, evidence, explanation, blocking status, remediation |
| Analytics insight | observation window, compared cohort, metric deltas, confidence, recommendation, evidence references |
| Reply draft | comment id, intent, sentiment, draft text, risk flags, suggested escalation |

The LLM must not have a direct tool or permission to publish videos or comments. Its outputs are proposals stored as pending records. The application—not the model—enforces permissions, approvals, quotas, idempotency, policy rules, and external side effects.

## 7. Asynchronous job system

The job model should support both the MVP’s scheduled handlers and the scale worker without changing the product-facing contract. A job is created with an idempotency key derived from tenant, channel, content version, operation type, and request nonce. Every stage writes a checkpoint before and after meaningful external calls.

Recommended job states are `queued`, `running`, `waiting_review`, `retryable_failure`, `failed`, `cancel_requested`, `cancelled`, `completed`, and `dead_letter`. Each stage should store `attemptCount`, `maxAttempts`, `startedAt`, `completedAt`, `nextAttemptAt`, `providerTaskId`, `inputFingerprint`, `outputFingerprint`, `errorCode`, `errorMessage`, and a safe remediation message.

The execution contract should work as follows:

1. The dispatcher claims a queued or retryable job using a lease with an expiry time.
2. The executor verifies the idempotency key and current content version before doing work.
3. The executor persists the external task identity before polling or retrying whenever the provider exposes one.
4. The stage output is uploaded to object storage, checksummed, and recorded before the job advances.
5. A transient error returns the job to retryable failure with bounded exponential backoff.
6. A permanent error, exceeded retry limit, policy violation, or repeated schema mismatch moves the job to dead-letter/review.
7. A human can resume from the first incomplete stage or intentionally regenerate a selected stage and all dependent stages.

The dead-letter view should expose the exact stage, attempt history, provider, error category, input version, last log correlation id, and available actions. It should never hide failures behind a generic “processing” state.

## 8. Cloud media pipeline

Object storage is the source of truth for media bytes. The database stores metadata, ownership, content version, storage key, checksum, MIME type, dimensions, duration, rights state, and lifecycle status. Source assets, generated assets, captions, thumbnails, intermediate renders, final packages, and archived versions should use separate prefixes and retention policies.

The media pipeline should be adapter-based:

| Adapter | Responsibility |
|---|---|
| **Text-to-speech** | Generate narration per scene or complete track, return provider/model/task metadata and duration |
| **Image generation** | Produce scene art and thumbnails, record prompt, provider, model, and provenance |
| **Video generation** | Optionally create bounded clips for selected scenes, persist provider task ids and cost evidence |
| **Local assembly** | Combine approved narration, visuals, music, captions, and transitions into MP4 |
| **Captioning** | Generate and validate SRT/VTT plus burned-in or sidecar captions |
| **Thumbnail processing** | Validate dimensions, file type, readability, and selected package linkage |
| **Storage/lifecycle** | Upload artifacts, preserve versions, expire intermediates, and retain audit-relevant outputs |

For the MVP, the managed application can coordinate short or low-volume rendering, but the rendering contract should already be worker-compatible. At scale, FFmpeg belongs in a containerized media worker with CPU/memory limits, a queue lease, a temporary workspace, and an explicit cleanup finally-block. Workers should be stateless; all durable state and artifacts belong in the database and object storage.

Rights and provenance must be first-class metadata. An uploaded or generated asset should record its origin, license or operator attestation, evidence link, and review state. A final video package cannot be approved while required rights attestations or factual source links are unresolved.

## 9. YouTube integration and safety controls

The YouTube connector should use OAuth authorization per channel and store refresh tokens only on the server in encrypted form. The connection flow should show the requested scopes, the selected channel identity, granted scopes, token expiry, and validation status. Channel selection must be explicit when a Google account owns or manages multiple channels.

The connector should expose separate operations for reading channel data, uploading media, updating metadata, scheduling, and posting comments. Read-only analytics and comment sync should not require publish permissions when the provider allows narrower scopes. The product should request the minimum scopes required for the selected feature and explain why each scope is needed.

Publishing must use a two-step server flow. First, an operator opens a confirmation panel showing the exact channel, content version, title, thumbnail, privacy status, scheduled time in channel timezone, disclosure choice, and destination. Second, the operator confirms. The server issues a short-lived confirmation token bound to the user, channel, content version, action, and a hash of the displayed payload. The upload/schedule mutation must validate that token immediately before calling YouTube.

The same control applies to comment posting. Draft replies can be generated, edited, and approved in bulk, but each post operation must still require an explicit confirmation of the selected replies and target channel. A daily posting cap and risk flags should protect against accidental bursts. The system must not delete, hide, or mass-post comments automatically.

If an upload times out or returns an ambiguous response, the system must mark it `uncertain` and require reconciliation by querying the channel for a matching recent video or operator confirmation in YouTube Studio. It must not submit a blind second upload. Quota usage, provider errors, rate limits, scope failures, and refresh-token failures should be visible in the channel health panel and audit log.

## 10. Analytics and engagement services

Analytics collection should create immutable snapshots for each published video at configured windows such as 24 hours and 7 days. A snapshot should include the collection timestamp, source API response version, views, watch time, average view duration, retention or CTR when available, likes, comments, subscribers, traffic-source context, and an evidence-quality flag. Simulated or incomplete data must never enter the baseline used for recommendations.

The learning service should compare videos against the channel’s own comparable history rather than a universal performance target. Each recommendation should identify the cohort, time window, metrics considered, evidence coverage, confidence, and proposed action. Recommendations remain pending until an authorized operator approves them. Approval adds the recommendation as a future planning constraint; rejection records a reason and prevents it from influencing generation.

The engagement service should synchronize recent comments, classify themes and sentiment, detect questions and likely spam/toxicity, and preserve comment permalinks. It should draft replies in the configured channel voice, but never post them without approval and final confirmation. When repeated audience requests appear, the service may create a proposed content idea with comment evidence; it must remain pending.

## 11. Dashboard information architecture

The dashboard should use a persistent sidebar and a calm, high-contrast visual language. “Elegant” should mean disciplined hierarchy, generous spacing, restrained motion, strong typography, and clear decision states—not decoration that competes with operational data. The visual system should use a dark graphite or warm-neutral base, one confident accent color for action, semantic colors for status, and a readable sans-serif paired with a compact mono face for job ids and timestamps.

| Workspace | Primary user outcome |
|---|---|
| **Overview** | See what needs attention, what is actively running, what is scheduled, and what changed |
| **Channels** | Switch between channels and inspect connection health, strategy, cadence, and permissions |
| **Strategy** | Define audience, pillars, voice, goals, formats, cadence, budget, and guardrails |
| **Ideas & Research** | Review evidence-backed topics and approve ideas for production |
| **Pipeline** | Track every content item by stage, status, owner, and next action |
| **Review Studio** | Edit and approve scripts, metadata, assets, sources, rights, and final packages |
| **Calendar** | Inspect approved scheduled content and blocked publishing items |
| **Analytics** | Compare performance, inspect snapshots, and review pending learnings |
| **Engagement** | Sync comments, draft replies, triage risks, and approve posting batches |
| **Jobs & Operations** | Inspect retries, failures, provider tasks, worker health, and dead-letter records |
| **Settings & Audit** | Manage members, credentials, channel policies, notifications, and immutable audit history |

The Overview page should prioritize a decision queue and operational truth. A polished dashboard should never show an optimistic “complete” state when a video is missing narration, has stale review evidence, or is awaiting reconciliation.

## 12. MVP scope

The approval-first MVP should deliver one complete vertical slice:

| MVP area | Included |
|---|---|
| Authentication | Signed-in users, tenant membership, roles, protected routes |
| Channels | One or more channel workspaces, connection status, per-channel settings |
| Strategy | Audience, pillars, cadence, goals, format defaults, voice, guardrails |
| Content | Idea, research brief, script, metadata, thumbnail brief, production status |
| Review | Editable script/metadata, quality checklist, provenance, rights attestation, approval |
| Jobs | Durable stages, progress, retry, resume, failure reason, affected-stage regeneration |
| Publishing | OAuth-backed private/unlisted/public upload and scheduling with final confirmation |
| Analytics | Snapshot records, basic comparison, pending learning recommendations |
| Engagement | Recent comment sync, classification, draft replies, approval and confirmation |
| Operations | Audit logs, provider health, quota/error display, cleanup jobs |

The MVP should deliberately defer advanced A/B testing, multi-provider video generation, automatic winner adoption, sophisticated scene-retention mapping, and broad social-platform publishing until the core state machine is reliable.

## 13. MVP-to-scale roadmap

| Phase | Milestone | Exit criteria |
|---|---|---|
| **0. Foundation** | Schema, auth, tenant boundaries, roles, dashboard shell, audit events | Authorization tests pass; no cross-tenant reads; design review complete |
| **1. Strategy and ideas** | Channel strategy workspace and evidence-backed idea queue | An operator can configure a channel and approve an idea |
| **2. Content and review** | LLM structured outputs, content versions, Review Studio, quality/provenance/rights gates | A complete content package can reach approved state without publishing |
| **3. Jobs and media** | Durable staged jobs, object storage, narration/asset adapters, lightweight rendering | A failed job resumes correctly and regenerated stages invalidate dependents |
| **4. YouTube and calendar** | OAuth, channel selection, privacy/scheduling, confirmation token, reconciliation | Test uploads remain private or unlisted; uncertain uploads never duplicate |
| **5. Analytics and engagement** | Snapshot collection, comparisons, pending learnings, comment sync, reply drafts | No recommendation or reply posts without approval; evidence is traceable |
| **6. Scale worker** | Queue, containerized FFmpeg worker, leases, concurrency, cleanup, worker telemetry | Worker failures are isolated; retries are idempotent; artifacts are recoverable |
| **7. Controlled expansion** | Experiments, scene repair, Shorts repurposing, outcome/ROI views, more providers | Feature additions preserve approval and audit invariants |

## 14. Team responsibilities

A small team can deliver the MVP with clear ownership. The **product owner/operator** defines channel policy, acceptance criteria, and approval semantics. The **full-stack engineer** owns schema, tRPC procedures, dashboard, tenant authorization, and audit logging. The **AI/platform engineer** owns structured prompts, provider adapters, validation, cost controls, and evaluation datasets. The **media engineer** owns asset storage, FFmpeg packaging, captions, thumbnails, and worker contracts. The **integration engineer** owns OAuth, YouTube API behavior, quota handling, reconciliation, and provider error taxonomy. The **security/QA owner** leads threat modeling, permission tests, approval-gate tests, data retention, and launch sign-off.

## 15. Testing strategy

Testing should focus on invariants, not only screenshots. Unit tests should cover state transitions, schema validation, permission checks, confirmation-token binding, idempotency, retry classification, version invalidation, and recommendation status. Integration tests should exercise mocked LLM, storage, YouTube, TTS, and worker adapters. Contract tests should verify provider request shapes and normalized error responses. Browser tests should cover the operator’s critical path from sign-in through review and confirmation, while ensuring that canceling or closing a confirmation dialog makes no external call.

The test suite should include adversarial cases: a Viewer attempting to schedule; a confirmation token used for another content version; a duplicate retry after a successful provider task; an upload that times out after reaching YouTube; a stale quality check after a script edit; an expired OAuth refresh token; a comment batch over the daily cap; a cross-tenant identifier in a request; and a dead-letter job resumed after its source asset was deleted.

## 16. Observability and security

Every job and external operation should have a correlation id. Structured logs should record tenant, channel, job, stage, provider, attempt, latency, status, and safe error code without secrets, raw prompts containing sensitive information, or token values. Metrics should include queue age, stage duration, retry rate, dead-letter rate, render duration, storage failures, OAuth refresh failures, upload uncertainty, quota utilization, approval latency, and percentage of content reaching publish-ready state.

Security review should cover tenant isolation, role escalation, OAuth redirect validation, encrypted credential handling, signed worker leases, object-storage authorization, SSRF risks in source URLs, prompt injection in research content, unsafe HTML/metadata rendering, rate limits, CSRF/session protections, log redaction, data retention, and operator confirmation bypasses. The platform should treat research pages, comments, transcripts, and generated text as untrusted content; none may override system policy or grant publishing authority.

## 17. Launch criteria and success metrics

The MVP should launch only after the team can demonstrate that the full production path works with a private or unlisted test channel, all external side effects are auditable, and failure recovery is understandable to a non-engineering operator.

| Category | Initial success measure |
|---|---|
| Reliability | At least 95% of non-provider-failure jobs reach a terminal state without manual database repair |
| Recovery | 100% of tested interrupted jobs resume from a valid checkpoint without duplicating completed external work |
| Safety | Zero uploads, schedules, or comment posts without a valid operator confirmation event |
| Auditability | Every approval, credential event, external API action, and reconciliation has an audit record |
| Quality | Reviewers can identify and resolve all blocking quality, provenance, and rights findings in one workspace |
| Efficiency | Median time from approved idea to review-ready package is measurable and trends downward over pilot iterations |
| Learning | Every approved recommendation links to real snapshots and a visible comparison cohort |
| Usability | Pilot operators can locate the next required decision within one minute from Overview |

## 18. Implementation decision for this project

For the current project, we should build the **managed web application MVP first** using the initialized full-stack foundation: React, the provided dashboard layout components, tRPC procedures, Drizzle/MySQL persistence, managed authentication, and object storage. We should design the job and media interfaces so that a future containerized worker can implement the same contracts without changing Review Studio or the operator workflow.

The first engineering slice should be the control plane and approval model—not video rendering. Specifically, we should implement tenant/channel/schema boundaries, a dashboard shell, strategy records, content versions, approval states, audit events, and mocked provider adapters with strong tests. Once those invariants are stable, we can connect real LLM, storage, and YouTube adapters incrementally.

Before implementation begins, the team should confirm the target pilot size, whether the first release supports one or multiple channels per tenant, the first LLM provider, the desired default privacy state, the initial video formats, and whether the MVP needs real FFmpeg rendering or may use a worker-compatible stub until the control-plane workflow is validated.

## 19. Dedicated YouTube policy review checklist

Before enabling any real channel connection, the team should complete a policy review and record the reviewer, date, channel, and decision. The checklist must confirm that OAuth scopes are limited to the features enabled; tokens are encrypted, refreshable, revocable, and never exposed to the browser; channel ownership and selected destination are displayed before action; privacy and scheduling values are explicit; metadata and thumbnails do not contain deceptive or prohibited claims; synthetic or altered media disclosure is preserved when relevant; comment sync never deletes or hides comments; reply drafts remain pending until human approval; posting is rate-limited and auditable; quota and rate-limit responses are surfaced; and uncertain uploads enter reconciliation rather than blind retry. Test channels should use private or unlisted visibility until the entire flow is signed off.

## 20. Launch sign-off checklist

The release owner should collect a written sign-off for authentication and tenant isolation, role and permission tests, encrypted credential handling, object-storage access, approval-token binding, stale-content invalidation, durable job recovery, dead-letter handling, provider error visibility, audit-event completeness, scheduled callback idempotency, retention and cleanup behavior, YouTube policy review, operator usability, private-channel end-to-end testing, rollback readiness, and incident contacts. Launch is blocked if any external action can be triggered without a valid confirmation event or if an ambiguous upload can be retried without reconciliation.

## References

[1]: https://github.com/darkzOGx/youtube-automation-agent "youtube-automation-agent repository"
