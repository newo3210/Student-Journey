## 1. Scaffold & Compose

- [x] 1.1 Replace stub with Node + Express + TS + Zod + Vitest under `WhatsApp-agents/waha/`
- [x] 1.2 Clean Architecture folders: presentation / services / infrastructure / contracts
- [x] 1.3 `docker-compose.yml` (Waha + bot) and `.env.example`
- [x] 1.4 README: setup, Compose, session/API key, webhook secret, unofficial disclaimer, defense bullets, button-support note

## 2. Contracts & Waha client (TDD)

- [x] 2.1 Zod env + inbound webhook + outbound contracts with failing tests first
- [x] 2.2 Waha HTTP client (text, interactive or fallback, media, presence) with injectable fetch
- [x] 2.3 Humanized dispatch (presence → delay 20–45s → send) with injectable sleep
- [x] 2.4 Webhook secret when set; skip self/fromMe-equivalent; production delay floor

## 3. Demo flow

- [x] 3.1 Thin webhook routes + inbound handler
- [x] 3.2 Menu (buttons/list or documented text fallback) + coupon media
- [x] 3.3 All user-facing sends go through humanized dispatch

## 4. Hub & root docs

- [x] 4.1 Update hub README — Waha Implemented
- [x] 4.2 Update anti-ban docs — Waha uses presence+delay C
- [x] 4.3 Update ARCHITECTURE_SDD.md (EN) and STUDENT_DECISION_LOG.md (ES)

## 5. Verify

- [x] 5.1 `npm test` green
- [x] 5.2 `docker compose config` OK; do not claim live up unless run
- [x] 5.3 Author signature + section comments on hand-written `.ts` files
