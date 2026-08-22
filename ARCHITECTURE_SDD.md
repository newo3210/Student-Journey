# Architecture SDD

> **Language:** English (technical contract).  
> **Location:** repository root `ARCHITECTURE_SDD.md`.  
> **Last updated:** 2026-08-22  
> **Related OpenSpec changes:** `openspec/changes/react-task-manager/`, `openspec/changes/whatsapp-agents/`, `openspec/changes/whatsapp-agents-evolution/`, `openspec/changes/whatsapp-agents-waha/`

---

## 1. System overview

**Student Journey** is the documentation and OpenSpec hub for a Full Stack student portfolio.

**Priority track — Academic:** five traditional Full Stack Modern repositories (no AI). Repo **#1** `react-task-manager` is implemented at `apps/react-task-manager/`. Repos 2–5 remain profiled in `docs/ACADEMIC_PORTFOLIO.md`.

**Parallel track — WhatsApp Agents:** hub at `WhatsApp-agents/` for demonstrable messaging bots. Engines **Meta Cloud API** (`meta-cloud-api/`), **Evolution API** (`evolution-api/`), and **Waha** (`waha/`) are implemented at Level 1. Baileys and WhatsMeow remain stubs. This track does **not** replace Academic priority.

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

Catalog / pedagogy: `WhatsApp-agents/README.md`, `WhatsApp-agents/docs/anti-ban-strategy.md` (Meta: docs only; Evolution/Waha: presence+delay runtime C).

### 2.3 `WhatsApp-agents/evolution-api` (implemented)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/presentation/webhookRoutes.ts` | POST inbound; thin |
| Application | `src/services/` | demo flow, humanized dispatch, inbound handler, outbound builders |
| Infrastructure | `src/infrastructure/evolutionClient.ts` | Evolution HTTP (v2-style paths; injectable fetch) |
| Contracts | `src/contracts/` | Zod env, webhook, outbound shapes |
| Ops | `docker-compose.yml` (+ `docker-compose.full.yml` profile `full`) | slim Evolution + bot; full adds Redis/Postgres |

Humanization **C only:** presence `composing` → stochastic 20–45s delay → send (injectable sleep; no Redis/BullMQ).

### 2.4 `WhatsApp-agents/waha` (implemented)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/presentation/webhookRoutes.ts` | POST inbound; thin |
| Application | `src/services/` | demo, humanized dispatch, inbound handler, outbound builders |
| Infrastructure | `src/infrastructure/wahaClient.ts` | Waha REST paths; injectable fetch |
| Contracts | `src/contracts/` | Zod env, webhook, outbound shapes |
| Ops | `docker-compose.yml` | CORE `devlikeapro/waha:latest` + bot |

Humanization **C only:** `startTyping` → stochastic 20–45s delay → send (injectable sleep; no Redis/BullMQ). Default menu is numbered **text fallback** (`WAHA_MENU_MODE=text`); `sendButtons`/`sendList` optional for PLUS engines.

### 2.5 Remaining academic apps (intended)

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

### 3.3 Evolution API template

```text
Evolution webhook POST
  → presentation/webhookRoutes (optional x-webhook-secret, then HTTP ack)
    → services/inboundHandler
      → contracts extractInboundEvent (Zod parse; fromMe must be false)
        → demoFlow + humanizedDispatch (presence → delay → send)
          → infrastructure/evolutionClient
            → POST /chat/sendPresence/{instance}
            → POST /message/sendText|sendButtons|sendList|sendMedia/{instance}
```

### 3.4 Waha template

```text
Waha webhook POST
  → presentation/webhookRoutes (optional x-webhook-secret, then HTTP ack)
    → services/inboundHandler
      → contracts extractInboundEvent (Zod parse; fromMe must be false)
        → demoFlow + humanizedDispatch (startTyping → delay → send)
          → infrastructure/wahaClient
            → POST /api/startTyping
            → POST /api/sendText | sendFile | sendImage | sendButtons | sendList
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

### 4.3 Evolution API

| Method | Path | Purpose |
|---|---|---|
| POST | `/webhook` | Inbound Evolution events → humanized demo replies |
| GET | `/health` | Liveness |

Compose: slim `evolution-api` (gateway `:8080`) + `bot` (`:3001`). Profile `full` + `docker-compose.full.yml` adds Redis and Postgres (closer to official Evolution v2; live `up` not claimed).

### 4.4 Waha

| Method | Path | Purpose |
|---|---|---|
| POST | `/webhook` | Inbound Waha `message` events → humanized demo replies |
| GET | `/health` | Liveness |

Compose: slim `waha` (`devlikeapro/waha:latest` on `:3000`) + `bot` (`:3002`). Live `up` not claimed.

## 5. Schemas

### 5.1 Repo 1

- `Task`: `{ id, title, completed, createdAt }`
- `taskTitleSchema`: trimmed non-empty string

### 5.2 Meta Cloud API

- Env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, optional `WHATSAPP_APP_SECRET` (when set → `X-Hub-Signature-256` required on POST), `META_GRAPH_API_VERSION` (default `v21.0`), `COUPON_MEDIA_URL`
- Inbound: Meta webhook envelope → `InboundEvent` (`from`, `messageId`, `type`, text / interactive id)
- Outbound: text, interactive buttons/list, image/document Graph payloads

### 5.3 Evolution API

- Env: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `PORT`, `COUPON_MEDIA_URL`, `EVOLUTION_API_VERSION` (default `v2`), optional `EVOLUTION_WEBHOOK_SECRET` (when set → header `x-webhook-secret` required), `HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS` (default 20000–45000; production floor 20000/45000)
- Inbound: Evolution `messages.upsert` envelope → `InboundEvent` (`from`, `messageId`, `type`, text / interactive id)
- Outbound: text, buttons, list, media (+ presence before humanized send)

### 5.4 Waha

- Env: `WAHA_API_URL`, `WAHA_API_KEY`, `WAHA_SESSION`, `PORT`, `COUPON_MEDIA_URL`, `WAHA_MENU_MODE` (default `text`), optional `WAHA_WEBHOOK_SECRET` (when set → header `x-webhook-secret` required), `HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS` (default 20000–45000; production floor 20000/45000)
- Inbound: Waha `message` envelope → `InboundEvent` (`from`, `messageId`, `type`, text / interactive id)
- Outbound: text, optional buttons/list, media (+ `startTyping` before humanized send)

## 6. AI / LLM boundaries

Not applicable on the Academic track or Meta/Evolution Level 1 templates (no LLM). Levels 2–4 (AI / RAG / voice) are catalogued only.

## 7. Error handling

- Academic repo 1: invalid titles → inline UI errors; corrupt localStorage → `[]`
- Meta template: missing env fails startup with listed keys; verify mismatch → HTTP 403; when `WHATSAPP_APP_SECRET` is set, invalid/missing `X-Hub-Signature-256` → HTTP 401/403 (no Graph call); inbound parse miss → no Graph send; Graph non-2xx responses are logged after the 200 webhook ack and are **not** counted as successful `sent` (lost-message risk remains because Meta will not retry after early ack)
- Evolution template: missing env fails startup; when `EVOLUTION_WEBHOOK_SECRET` is set, missing `x-webhook-secret` → HTTP 401 and mismatch → HTTP 403 (no Evolution send); inbound is processed only if `fromMe === false`; Evolution **non-2xx** send responses are logged in `humanizedSendAll` and are **not** counted as `sent` (2xx with error JSON may still increment `sent`)
- Waha template: same secret/fromMe/delay-floor pattern with `WAHA_WEBHOOK_SECRET`; Waha **non-2xx** send responses are not counted as `sent`

## 8. Non-goals

- Academic repo 1: backend, auth, DB, AI
- WhatsApp Evolution/Waha changes: Redis/BullMQ queues; Baileys/WhatsMeow full templates; Level 2–4 AI/voice; guaranteeing ToS compliance

## 9. Milestones

| Order | Deliverable | Status |
|---|---|---|
| 1 | `react-task-manager` | Done |
| — | `WhatsApp-agents` hub + Meta Level 1 | Done (parallel) |
| — | Evolution API Level 1 + humanization C | Done (parallel) |
| — | Waha Level 1 + humanization C | Done (parallel) |
| 2 | `express-api-boilerplate` | Next (Academic) |
| 3–5 | blog / auth / booking | Pending |

## 10. Change log

| Date | Change | OpenSpec |
|---|---|---|
| 2026-07-31 | Learning + academic profiles | `study-roadmap-docs`, `academic-portfolio-5-repos` |
| 2026-07-31 | Task manager MVP + author signatures | `react-task-manager` |
| 2026-08-21 | WhatsApp Agents hub + Meta Cloud API Level 1 template | `whatsapp-agents` |
| 2026-08-21 | Adversarial fixes: HMAC when secret set, Graph non-2xx not counted as sent, text-only menu | `whatsapp-agents` |
| 2026-08-21 | Evolution API Level 1 template + Compose + humanization C | `whatsapp-agents-evolution` |
| 2026-08-21 | Adversarial fixes: webhook secret, fromMe false-only, production delay floor, slim vs full Compose | `whatsapp-agents-evolution` |
| 2026-08-22 | Waha Level 1 template + Compose + humanization C + text-menu fallback | `whatsapp-agents-waha` |
