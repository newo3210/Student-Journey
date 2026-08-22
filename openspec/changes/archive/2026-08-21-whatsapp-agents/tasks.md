## 1. Hub catalog & placeholders

- [x] 1.1 Create `WhatsApp-agents/README.md` with engine comparison table, levels 1–4, folder map, and link to anti-ban docs
- [x] 1.2 Add `WhatsApp-agents/docs/anti-ban-strategy.md` (presence, 20–45s jitter, per-recipient queues) marked documentation-only / deferred
- [x] 1.3 Add stub READMEs in `evolution-api/`, `waha/`, `baileys/`, `whatsmeow/` stating planned / not implemented

## 2. Meta template scaffold (TDD prep)

- [x] 2.1 Scaffold `WhatsApp-agents/meta-cloud-api/` (Node + Express + TypeScript + Vitest + Zod + `.env.example`)
- [x] 2.2 Create Clean Architecture folders: `presentation/`, `services/`, `infrastructure/`, `contracts/`
- [x] 2.3 Define Zod env + webhook + outbound message contracts with failing tests first

## 3. Webhook & text reply

- [x] 3.1 Implement GET verify-token handler (tests for accept/reject) then wire route
- [x] 3.2 Implement POST webhook parse + text inbound → text outbound service (mock Graph client)
- [x] 3.3 Implement Meta Graph API HTTP client for `messages` send (token + phone number id)

## 4. Interactive + media demos

- [x] 4.1 Implement interactive buttons and/or list outbound builder + inbound interactive reply handling (TDD)
- [x] 4.2 Implement image/document (coupon/PDF) send path + fixture or URL placeholder (TDD)
- [x] 4.3 Wire a simple demo conversation flow (keyword or first message → menu → media/text)

## 5. Documentation & root artefacts

- [x] 5.1 Write `WhatsApp-agents/meta-cloud-api/README.md` (setup, tunnel, env, demo, defense bullets)
- [x] 5.2 Update `ARCHITECTURE_SDD.md` (English) for hub + Meta template flow and layers
- [x] 5.3 Update `STUDENT_DECISION_LOG.md` (Spanish) with WhatsApp Agents track rationale and data-flow map
- [x] 5.4 Note parallel Advanced WhatsApp track in `docs/LEARNING_ROADMAP.md` without demoting Academic priority

## 6. Verify

- [x] 6.1 Run unit tests green for meta-cloud-api
- [x] 6.2 Manual checklist: verify challenge, text round-trip (mocked or tunneled), interactive, media
- [x] 6.3 Author signature on all hand-written `.ts` files (line 1) + section comments on new modules

## 7. Adversarial fixes (post-review FAIL)

- [x] 7.1 Enforce `X-Hub-Signature-256` HMAC when `WHATSAPP_APP_SECRET` is set (raw body); reject forged POST; tests for accept/reject
- [x] 7.2 Document unsafe unsigned public tunnel in Meta README; align `.env.example` (secret recommended for tunnels)
- [x] 7.3 Treat Graph non-2xx as failed send (log + do not count as `sent`); tests for status 500 path
- [x] 7.4 Fix `ARCHITECTURE_SDD.md` §7 / error-handling notes to match real logging behavior
- [x] 7.5 Demo flow: do not open menu for non-text inbound types; add tests
- [x] 7.6 Verify-token compare via constant-time equality; re-run `npm test` green
