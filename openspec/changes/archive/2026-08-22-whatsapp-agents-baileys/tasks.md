## 1. Scaffold

- [x] 1.1 Replace stub with Node + Express + TS + Zod + Vitest under `WhatsApp-agents/baileys/`
- [x] 1.2 Clean Architecture folders + `.env.example` + gitignore auth/QR
- [x] 1.3 README: QR pairing, unofficial disclaimer, buttons unstable, defense bullets
- [x] 1.4 Optional docker-compose.yml wrapping the Node bot only (document interactive QR)

## 2. Contracts & adapter (TDD)

- [x] 2.1 Zod env, inbound event, outbound payloads with failing tests first
- [x] 2.2 Injectable Baileys adapter (presence + send text/media); tests never open a real socket
- [x] 2.3 Humanized dispatch (composing → delay → send) with injectable sleep
- [x] 2.4 Simulator HTTP secret; fromMe skip; production delay floor

## 3. Demo flow

- [x] 3.1 Thin routes + inbound handler
- [x] 3.2 Numbered text menu + coupon media
- [x] 3.3 All user-facing sends through humanized dispatch

## 4. Hub & root docs

- [x] 4.1 Hub README — Baileys Implemented
- [x] 4.2 Anti-ban docs — Baileys presence+delay C
- [x] 4.3 ARCHITECTURE_SDD.md + STUDENT_DECISION_LOG.md

## 5. Verify

- [x] 5.1 `npm test` green
- [x] 5.2 Author signature + section comments

## 6. Adversarial fixes (live QR + upsert)

- [x] 6.1 Wire `messages.upsert` to the same inbound handler as `/webhook` (fromMe skip); tests with fake `ev.on`
- [x] 6.2 Surface pairing QR from `connection.update` (print/render `qr` string); tests assert QR callback is not a no-op
- [x] 6.3 Align README + ARCHITECTURE_SDD with actual live loop
- [x] 6.4 `npm test` green

