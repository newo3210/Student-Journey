# Architecture SDD

> **Language:** English (technical contract).  
> **Location:** repository root `ARCHITECTURE_SDD.md`.  
> **Last updated:** 2026-08-21  
> **Related OpenSpec changes:** `openspec/changes/react-task-manager/`, `openspec/changes/whatsapp-agents/`

---

## 1. System overview

**Student Journey** is the documentation and OpenSpec hub for a Full Stack student portfolio.

**Priority track — Academic:** five traditional Full Stack Modern repositories (no AI). Repo **#1** `react-task-manager` is implemented at `apps/react-task-manager/`. Repos 2–5 remain profiled in `docs/ACADEMIC_PORTFOLIO.md`.

**Parallel track — WhatsApp Agents:** hub at `WhatsApp-agents/` for demonstrable messaging bots. First engine **Meta Cloud API** is implemented at `WhatsApp-agents/meta-cloud-api/`. Other engines (Evolution, Waha, Baileys, WhatsMeow) are stub folders only. This track does **not** replace Academic priority.

## 2. Layer mapping

### 2.1 `apps/react-task-manager` (implemented)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/components/`, `src/App.tsx` | No localStorage in components |
| Application | `src/features/tasks/taskOperations.ts`, `useTasks.ts` | Mutations, filters, validation |
| Infrastructure | `src/features/tasks/tasksStorage.ts` | localStorage adapter |
| Contracts | `src/types/task.ts` | Zod schemas |

Author signature (line 1 on hand-written `.ts`/`.tsx`): `//Mariano Montini ('bosque', 'bosquestudio')`

### 2.2 `WhatsApp-agents/meta-cloud-api` (implemented)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/presentation/webhookRoutes.ts` | GET verify + POST inbound; thin |
| Application | `src/services/` | verify, demo flow, outbound builders, inbound handler |
| Infrastructure | `src/infrastructure/metaGraphClient.ts` | Graph API HTTP (`v21.0` default) |
| Contracts | `src/contracts/` | Zod env, webhook, outbound shapes |

Catalog / pedagogy: `WhatsApp-agents/README.md`, `WhatsApp-agents/docs/anti-ban-strategy.md` (documentation only — no delay/presence/queue runtime).

### 2.3 Remaining academic apps (intended)

| Conceptual layer | Typical paths |
|---|---|
| Presentation | Express routes/controllers; Next `app/` |
| Application | `services/` |
| Infrastructure | `repositories/`, Prisma |
| Contracts | `schemas/` (Zod) |

## 3. Data & control flow

### 3.1 Repo 1 (react-task-manager)

```text
UI components → useTasks → taskOperations → tasksStorage → localStorage
```

### 3.2 Meta Cloud API template

```text
Meta webhook GET/POST
  → presentation/webhookRoutes (validate)
    → services/verifyWebhook | inboundHandler + demoFlow
      → services/outboundBuilders (payload shapes)
        → infrastructure/metaGraphClient → Graph API /{version}/{phone-number-id}/messages
```

## 4. API routes

### 4.1 Academic repo 1

None (client-only).

| # | Path / name | Status |
|---|---|---|
| 1 | `apps/react-task-manager` | Implemented |
| 2–5 | see academic portfolio | Profiled only |

### 4.2 Meta Cloud API

| Method | Path | Purpose |
|---|---|---|
| GET | `/webhook` | Meta subscription verify (`hub.challenge`) |
| POST | `/webhook` | Inbound messages → demo replies |
| GET | `/health` | Liveness |

## 5. Schemas

### 5.1 Repo 1

- `Task`: `{ id, title, completed, createdAt }`
- `taskTitleSchema`: trimmed non-empty string

### 5.2 Meta Cloud API

- Env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, optional `WHATSAPP_APP_SECRET` (when set → `X-Hub-Signature-256` required on POST), `META_GRAPH_API_VERSION` (default `v21.0`), `COUPON_MEDIA_URL`
- Inbound: Meta webhook envelope → `InboundEvent` (`from`, `messageId`, `type`, text / interactive id)
- Outbound: text, interactive buttons/list, image/document Graph payloads

## 6. AI / LLM boundaries

Not applicable on the Academic track or Meta Level 1 template (no LLM). Levels 2–4 (AI / RAG / voice) are catalogued only.

## 7. Error handling

- Academic repo 1: invalid titles → inline UI errors; corrupt localStorage → `[]`
- Meta template: missing env fails startup with listed keys; verify mismatch → HTTP 403; when `WHATSAPP_APP_SECRET` is set, invalid/missing `X-Hub-Signature-256` → HTTP 401/403 (no Graph call); inbound parse miss → no Graph send; Graph non-2xx responses are logged after the 200 webhook ack and are **not** counted as successful `sent` (lost-message risk remains because Meta will not retry after early ack)

## 8. Non-goals

- Academic repo 1: backend, auth, DB, AI
- WhatsApp change: unofficial engine runtimes; anti-ban delays/presence/queues; Level 4 voice; production hardening beyond local/demo webhook

## 9. Milestones

| Order | Deliverable | Status |
|---|---|---|
| 1 | `react-task-manager` | Done |
| — | `WhatsApp-agents` hub + Meta Level 1 | Done (parallel) |
| 2 | `express-api-boilerplate` | Next (Academic) |
| 3–5 | blog / auth / booking | Pending |

## 10. Change log

| Date | Change | OpenSpec |
|---|---|---|
| 2026-07-31 | Learning + academic profiles | `study-roadmap-docs`, `academic-portfolio-5-repos` |
| 2026-07-31 | Task manager MVP + author signatures | `react-task-manager` |
| 2026-08-21 | WhatsApp Agents hub + Meta Cloud API Level 1 template | `whatsapp-agents` |
| 2026-08-21 | Adversarial fixes: HMAC when secret set, Graph non-2xx not counted as sent, text-only menu | `whatsapp-agents` |
