## Context

Hub `WhatsApp-agents/` and Meta template are archived. This change implements the second engine: **Evolution API**, mirroring Meta’s Level 1 demo capabilities while adding Docker Compose and a **simple** humanization path suitable for unofficial gateways.

## Goals / Non-Goals

**Goals:**

- Runnable bot in `WhatsApp-agents/evolution-api/` with Clean Architecture
- Docker Compose: Evolution API + bot
- Webhook inbound + text reply, interactive buttons/lists, document/image coupon
- Humanization: send presence then wait random 20–45s, then send (in-process; injectable clock/sleep for tests)
- Hub catalog + root docs updated
- TDD with mocked Evolution HTTP

**Non-Goals:**

- Redis / BullMQ / per-recipient persistent queues
- Other engines’ full templates
- Level 2–4 (LLM, RAG, voice)
- Guaranteeing WhatsApp ToS compliance (educational disclaimer required)

## Decisions

1. **Mirror Meta layout** — `presentation/`, `services/`, `infrastructure/`, `contracts/` under `src/`.
2. **Evolution client** — REST calls for send text/media/presence and webhook receiver shaped to Evolution events (document pinned API paths in README; prefer current Evolution v2-style routes, note version in `.env.example`).
3. **Humanizer module** — `services/humanizedDispatch.ts` (or equivalent): presence → `sleep(random 20–45s)` → send; used by outbound path; tests fake timers / injected sleep.
4. **Compose** — `docker-compose.yml` with Evolution service + bot service; bot waits on Evolution health/URL via env `EVOLUTION_API_URL`.
5. **Secrets** — `EVOLUTION_API_KEY`, instance name, and optional `EVOLUTION_WEBHOOK_SECRET` (fail closed when set) via `.env.example`; never commit real values. Public tunnels without the secret are unsafe.
6. **fromMe** — process only explicit `fromMe === false`.
7. **Delay floor** — production (`NODE_ENV=production`) rejects humanize delays below 20s/45s; tests may use 0.
8. **Compose** — default slim demo plus documented `full` profile with Redis/Postgres for closer-to-official Evolution v2 boot.
6. **Disclaimer** — README states unofficial gateway risk / educational demo.
7. **Author signature** — line 1 on hand-written `.ts` files; section comments on new modules.

## Conceptual layer mapping

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `WhatsApp-agents/evolution-api/src/presentation/` | Webhook routes thin |
| Application / services | `.../src/services/` | Demo flow + humanized dispatch |
| Infrastructure | `.../src/infrastructure/` | Evolution HTTP client |
| Contracts | `.../src/contracts/` | Zod env, webhook, outbound |
| Ops | `WhatsApp-agents/evolution-api/docker-compose.yml` | Evolution + bot |

## Schema contracts

- Env: Evolution base URL, API key, instance name, port, coupon media URL, optional min/max delay override for tests
- Inbound webhook: parse sender + text / interactive id
- Outbound: text, interactive buttons/list, media document/image
- Presence payload before send (`composing` or `recording` for audio-like paths if demo uses PTT later; Level 1 uses `composing` for text/media)

## Risks / Trade-offs

- **ToS / ban risk** — unofficial; README disclaimer mandatory
- **20–45s delay** — slow demos; allow test overrides via env (e.g. `HUMANIZE_MIN_MS=0` in test only)
- **Evolution API churn** — pin documented version; client isolated in infrastructure
- **Compose resource use** — Evolution image may be heavy; document RAM needs
