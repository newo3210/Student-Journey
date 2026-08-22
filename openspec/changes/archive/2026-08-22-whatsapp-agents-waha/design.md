## Context

Hub already has Meta and Evolution Level 1. This change implements **Waha** with Evolution-parity: Compose, humanization C, webhook secret, self-message skip, production delay floor.

## Goals / Non-Goals

**Goals:**

- Runnable bot in `WhatsApp-agents/waha/` with Clean Architecture
- Docker Compose: Waha + bot
- Webhook inbound + text, interactive buttons/lists (document if Waha version only emulates buttons via text)
- Coupon PDF/image send
- Humanization C: presence then 20–45s delay (injectable sleep in tests)
- Hub catalog + root docs
- TDD with mocked Waha HTTP

**Non-Goals:**

- Redis / BullMQ
- Baileys / WhatsMeow full templates
- Level 2–4
- Guaranteeing ToS compliance

## Decisions

1. **Mirror Evolution layout** — `presentation/`, `services/`, `infrastructure/`, `contracts/`.
2. **Waha client** — REST + webhooks; pin image/version in README (e.g. `devlikeapro/waha`); isolate paths in infrastructure.
3. **Humanizer** — presence (`typing` or Waha `setPresence`) → sleep 20–45s → send.
4. **Webhook secret** — `WAHA_WEBHOOK_SECRET` (or equivalent) fail-closed when set; header documented.
5. **Self messages** — skip events that are fromMe / fromMe-equivalent; missing self-flag conservative skip if the payload shape allows; if Waha always marks inbound clearly, require explicit inbound.
6. **Delay floor** — `NODE_ENV=production` rejects delays below 20s/45s; tests may use 0.
7. **Compose honesty** — document slim vs any required extras; do not claim live `up` unless executed.
8. **Disclaimer** — unofficial gateway / ban risk.
9. **Author signature** on hand-written `.ts`.

## Conceptual layer mapping

| Layer | Path |
|---|---|
| Presentation | `WhatsApp-agents/waha/src/presentation/` |
| Services | `.../src/services/` (demo + humanized dispatch) |
| Infrastructure | `.../src/infrastructure/` (Waha HTTP) |
| Contracts | `.../src/contracts/` |
| Ops | `docker-compose.yml` (+ extra file/profile if needed) |

## Risks

- Unofficial ToS / ban risk
- Button support varies by Waha edition — document fallback
- API churn — isolate in client
