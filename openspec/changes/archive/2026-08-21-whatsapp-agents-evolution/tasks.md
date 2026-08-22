## 1. Scaffold & Compose

- [x] 1.1 Replace stub with Node + Express + TS + Zod + Vitest scaffold under `WhatsApp-agents/evolution-api/`
- [x] 1.2 Add Clean Architecture folders: `presentation/`, `services/`, `infrastructure/`, `contracts/`
- [x] 1.3 Add `docker-compose.yml` (Evolution API + bot) and `.env.example` with documented keys
- [x] 1.4 Write README: setup, Compose, instance/API key, tunnel/webhook notes, unofficial disclaimer, defense bullets

## 2. Contracts & Evolution client (TDD)

- [x] 2.1 Zod env + inbound webhook + outbound payload contracts with failing tests first
- [x] 2.2 Implement Evolution HTTP client (text, interactive, media, presence) with injectable fetch
- [x] 2.3 Implement humanized dispatch (presence → delay 20–45s → send) with injectable sleep; tests mock delay

## 3. Demo flow

- [x] 3.1 Webhook routes (thin) + inbound handler wired to demo flow
- [x] 3.2 Interactive menu + inbound button/list handling (same keywords spirit as Meta)
- [x] 3.3 Coupon PDF/image send path
- [x] 3.4 Ensure all outbound user sends go through humanized dispatch

## 4. Hub & root docs

- [x] 4.1 Update `WhatsApp-agents/README.md` — Evolution Implemented; note humanization C
- [x] 4.2 Update `docs/anti-ban-strategy.md` — Evolution implements presence+delay only
- [x] 4.3 Update `ARCHITECTURE_SDD.md` (EN) and `STUDENT_DECISION_LOG.md` (ES)

## 5. Verify

- [x] 5.1 `npm test` green
- [x] 5.2 Manual Compose smoke checklist documented (or dry-run compose config validate)
- [x] 5.3 Author signature + section comments on hand-written `.ts` files

## 6. Adversarial fixes (post-review FAIL)

- [x] 6.1 Enforce `EVOLUTION_WEBHOOK_SECRET` when set (header check); tests accept/reject; README tunnel warning
- [x] 6.2 Process inbound only if `fromMe === false`; test omitted fromMe → no send
- [x] 6.3 Clamp/reject sub-20s delays when `NODE_ENV=production`; keep 0 allowed in test; tests for both
- [x] 6.4 Document slim vs official Compose; add Redis (and Postgres if needed) as `full` profile; honest README about live boot
- [x] 6.5 Fix ARCHITECTURE_SDD route-parse wording + Evolution non-2xx note
- [x] 6.6 `npm test` green; mark this section complete
