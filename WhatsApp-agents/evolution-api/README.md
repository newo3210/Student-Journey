# Evolution API — WhatsApp agent template (Level 1)

Runnable Node.js + Express + TypeScript sample bot using **Evolution API** (unofficial WhatsApp gateway) with Docker Compose and simple humanization (presence + delay).

Hub catalog: [`../README.md`](../README.md)  
OpenSpec: `openspec/changes/whatsapp-agents-evolution/`

> **Disclaimer (educational):** Evolution API is an **unofficial** WhatsApp gateway. Using it may violate Meta Terms of Service and risk account bans. This template is for learning/demo only — not production compliance advice.

## Stack

- Node.js + Express + TypeScript
- Zod contracts at env / webhook / outbound boundaries
- Vitest unit tests (Evolution HTTP mocked; humanize sleep injected)
- Clean Architecture folders under `src/`
- Docker Compose: Evolution API + bot

| Layer | Path |
|---|---|
| Presentation | `src/presentation/` |
| Services | `src/services/` |
| Infrastructure | `src/infrastructure/` |
| Contracts | `src/contracts/` |

## Evolution HTTP paths (pinned v2-style)

Isolated in `src/infrastructure/evolutionClient.ts`. If your Evolution image uses different path names, change **only** that client.

| Action | Method + path |
|---|---|
| Text | `POST /message/sendText/{instance}` |
| Buttons | `POST /message/sendButtons/{instance}` |
| List | `POST /message/sendList/{instance}` |
| Media | `POST /message/sendMedia/{instance}` |
| Presence | `POST /chat/sendPresence/{instance}` |

Auth header: `apikey: <EVOLUTION_API_KEY>`  
Documented API style pin: `EVOLUTION_API_VERSION=v2` (default).

## Humanization (C only)

Before each user-facing send:

1. Send presence `composing`
2. Wait a stochastic delay **20–45 seconds** (in-process; **no Redis / BullMQ**)
3. Send the message

Tests inject `sleep` and/or set `HUMANIZE_MIN_MS=0` / `HUMANIZE_MAX_MS=0` so the suite does not wait wall-clock.

## Setup (local)

```bash
cd WhatsApp-agents/evolution-api
cp .env.example .env
# fill EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE
npm install
npm test
npm run dev
```

### Required env vars

| Variable | Purpose |
|---|---|
| `EVOLUTION_API_URL` | Evolution base URL (e.g. `http://localhost:8080` or Compose `http://evolution-api:8080`) |
| `EVOLUTION_API_KEY` | Must match Evolution `AUTHENTICATION_API_KEY` |
| `EVOLUTION_INSTANCE` | Instance name created/connected in Evolution |
| `PORT` | Bot listen port (default `3001`) |
| `COUPON_MEDIA_URL` | Public HTTPS URL for PDF/image coupon demo |
| `HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS` | Delay range (default 20000–45000). `0`/`0` allowed only when `NODE_ENV` is not `production` (Vitest). Production parse rejects below 20000 / 45000. |
| `EVOLUTION_API_VERSION` | Docs pin (default `v2`) |
| `EVOLUTION_WEBHOOK_SECRET` | Optional. When set, POST `/webhook` must send header `x-webhook-secret` matching this value or the bot returns 401/403 and does **not** call Evolution send. |

Never commit real secrets. Only `.env.example` ships with placeholders.

## Docker Compose

**Slim vs full:** default `docker-compose.yml` is a **slim demo** (Redis/Postgres **disabled** on the gateway). Official Evolution **v2** Docker docs treat Redis + Postgres as typical install prerequisites. Slim live boot is **unverified** in this change and **may fail**. The **`full` profile** plus `docker-compose.full.yml` wires Redis and Postgres (`CACHE_REDIS_ENABLED=true`, `DATABASE_*`). That path is closer to official docs; it is still **not** a recorded successful live `compose up` here.

```bash
cp .env.example .env
# set EVOLUTION_API_KEY; set EVOLUTION_WEBHOOK_SECRET if you expose a public tunnel

# Slim (unverified live / may fail)
docker compose up --build

# Full (closer-to-official deps) — config validate is the documented check
docker compose -f docker-compose.yml -f docker-compose.full.yml --profile full config
# docker compose -f docker-compose.yml -f docker-compose.full.yml --profile full up --build
```

Services:

| Service | Role | Ports | When |
|---|---|---|---|
| `evolution-api` | Unofficial Evolution gateway (`atendai/evolution-api:v2.1.1`) | `8080` | Always |
| `bot` | This Express Level 1 agent | `3001` | Always |
| `redis` | Cache for Evolution v2 | — | profile `full` |
| `postgres` | Database for Evolution v2 | — | profile `full` |

After Evolution is up:

1. Create/connect instance named like `EVOLUTION_INSTANCE`
2. Point Evolution webhook to `http://bot:3001/webhook` (Compose network) or `https://<tunnel>/webhook`
3. Scan QR / connect session in Evolution UI

### Compose smoke checklist

- [ ] `docker compose config` validates (slim)
- [ ] `docker compose -f docker-compose.yml -f docker-compose.full.yml --profile full config` validates (full)
- [ ] Manual: `compose up --build` until Evolution UI + bot `/health` (**not claimed done** in this repo pass)
- [ ] Evolution UI reachable on `:8080` (manual)
- [ ] Bot `GET /health` → `{ ok: true }` (manual)
- [ ] Webhook inbound text (`menu`) → interactive buttons (after presence+delay; `fromMe: false` required)
- [ ] Keyword `coupon` → document media
- [ ] `npm test` green (host, without waiting 20–45s)

> Evolution may need several hundred MB RAM. Prefer a machine with ≥2 GB free for local Compose. QR pairing is a **manual** smoke step.

## Tunnel / webhook notes

Evolution pushes events to your bot. For local demos behind NAT, expose the bot with ngrok / Cloudflare Tunnel and configure that HTTPS URL in the Evolution instance webhook settings.

**Warning:** exposing `/webhook` publicly **without** `EVOLUTION_WEBHOOK_SECRET` allows anyone who can POST a `messages.upsert`-shaped body (with `fromMe: false` and a `remoteJid`) to drive outbound sends on the connected WhatsApp session — a **send-oracle**. Set `EVOLUTION_WEBHOOK_SECRET` and send the same value as header `x-webhook-secret`. Missing header → **401**; mismatch → **403**; Evolution send is not called.

## Demo flow (keywords)

| User sends | Bot responds |
|---|---|
| `hi` / `hello` / `hola` / `menu` / `start` / `ayuda` | Interactive **buttons** menu (Info / Coupon PDF / Help) |
| `coupon` / `cupon` / `pdf` / `promo` | Document (PDF) media with caption |
| Button **Info** | Deterministic text about Level 1 demo |
| Button **Coupon PDF** | Short text + PDF document |
| Button **Help** | Keyword cheat-sheet |
| Any other text | Echo + hint to send `menu` or `coupon` |

## Defense bullets (oral)

- **Unofficial gateway:** ban/ToS risk — educational demo only
- **Humanization C:** presence `composing` + 20–45s delay; no queues
- **Layering:** routes ack (and optional secret check) then call services; Zod parse is in contracts (`extractInboundEvent`); Evolution HTTP lives in `infrastructure/`
- **Contracts:** Zod for env, inbound webhook, and outbound builders
- **TDD:** builders, webhook parse, humanizer (injected sleep), inbound handler with mocked Evolution HTTP

## Non-goals

- Redis / BullMQ / per-recipient persistent queues
- Waha / Baileys / WhatsMeow full templates
- Level 2–4 (LLM, RAG, voice)
