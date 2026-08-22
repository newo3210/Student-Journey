# Adversarial review — whatsapp-agents-baileys

**Scope:** OpenSpec change `whatsapp-agents-baileys`  
**Worktree:** `.worktrees/whatsapp-agents-baileys`  
**Reviewer:** independent session (did not implement)  
**Date:** 2026-08-22  
**Sources:** `proposal.md`, `design.md`, `tasks.md`, `specs/baileys-agent-template/spec.md`, `specs/whatsapp-agents-catalog/spec.md`, `reports/verify-report.md`, `reports/acceptance-matrix.md`, `WhatsApp-agents/baileys/` (adapter, live socket, webhook, humanizer, env, gitignore), hub README, `ARCHITECTURE_SDD.md`

## Spec and task alignment

Acceptance that **is** evidenced by tests (fake socket only):

- Inbound simulator text → outbound via adapter (`inboundHandler.test.ts`).
- Default numbered text menu; `buttons`/`list` kinds exist but adapter maps them to text (`demoFlow` + `BaileysClient.sendButtons`/`sendList`).
- Coupon document media via fake `sendMessage`.
- Humanization order: presence → sleep → send; injectable sleep (suite ~sub-second).
- Optional `BAILEYS_WEBHOOK_SECRET`: missing header 401, mismatch 403, no send.
- `fromMe !== false` (true or omitted) → no send (`extractInboundEvent`).
- `NODE_ENV=production` rejects delay floor `0`.
- Hub row **Implemented** + `baileys/`; WhatsMeow stub remains.
- No Redis/BullMQ in `package.json` or Compose.
- Auth dirs gitignored (`auth_info_baileys/`, plus aliases); no session folder in the tree.
- Presentation is thin: secret check, 200 ack, then `handleInboundWebhook`.
- Tests never import `createLiveBaileysSocket` / never construct `makeWASocket`.

Underspecified vs overclaimed:

- Spec inbound is **HTTP simulator and/or socket**. The SHALL is satisfied by HTTP alone. README, `index.ts` log, and `ARCHITECTURE_SDD.md` §3.5 still claim **live `messages.upsert`** as the real inbound path. That path is not implemented.
- Non-goal “live QR in CI” does **not** excuse a local pairing loop that cannot display a QR or consume WhatsApp messages.

## Hunt results (requested)

| Hunt | Result |
|------|--------|
| Tests opening a real Baileys socket | **Not found.** Vitest injects `{ sendPresenceUpdate, sendMessage }`. `createLiveSocket.ts` is only imported from `index.ts`. |
| Unsigned webhook | **By design when secret unset.** Documented send-oracle. When set, 401/403 before send. |
| Delay bypass | **Production floor works** (`HUMANIZE_MIN_MS < 20000` fails). Non-production `0/0` allowed (tests). Compose sets `NODE_ENV=production` so a `.env` with `0` would fail startup — good. |
| Auth folder committed | **Not found.** `.gitignore` at template + root `auth_info_baileys/`. |
| Native buttons claimed | **Not claimed as stable.** Adapter text-fallback; README/disclaimer honest. `BAILEYS_MENU_MODE=buttons` still **sends text**, not native templates. |
| Redis/BullMQ | **Absent.** |
| Fat routes | **Not found.** |

## Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Major | Live inbound | Boot creates a live socket for **outbound only**. No `sock.ev.on('messages.upsert', …)` (or equivalent) maps WhatsApp messages into `handleInboundWebhook`. A user who pairs still cannot drive the demo from WhatsApp. | `index.ts` logs “Live inbound is the Baileys socket”; `ARCHITECTURE_SDD.md` §3.5: “or live messages.upsert outside tests”; `createLiveSocket.ts` only handles `creds.update` + `connection.update`. | **Code:** subscribe to upsert, normalize proto → simulator-shaped event (or shared `InboundEvent`), skip `fromMe`. **Or docs/spec:** drop live-inbound claims and mark catalog as “simulator + outbound socket only.” |
| Major | Live pairing | QR is not printed or logged. On `qr`, the process logs a sentence and **discards** the payload. `printQRInTerminal` / `qrcode-terminal` are unused. README “scan QR when printed” cannot work. | `createLiveSocket.ts` lines 20–24: `if (qr) { console.log('Baileys QR received — …') }` — `qr` unused. | **Code:** log the QR string and/or render it (library or ASCII). **Tests:** unit-test a thin QR callback with a fake `ev.on` (still no live socket). |
| Minor | Spec vs catalog | Spec SHALL is simulator **and/or** socket, but hub **Implemented (Level 1)** plus “runnable” QR setup oversells a WhatsApp chat loop. | `proposal.md` / hub README vs `index.ts` | Align catalog wording if live inbound stays out of scope. |
| Minor | Tests | No regression test that the suite must not import `createLiveBaileysSocket`. fromMe **true** is tested on extract, not on the HTTP route. | File list; `webhookRoutes.test.ts` only omits `fromMe`. | **Tests:** forbid live factory import; route-level `fromMe: true`. |
| Minor | Humanizer | Presence HTTP-style 500 still proceeds to delay + send. | `humanizedDispatch.ts` ignores `presence.status` | **Code or spec:** define whether send is skipped on presence failure. |
| Minor | Image | Compose `PORT` map vs container always `3003`. | `docker-compose.yml` | Document or bind `${PORT}:${PORT}`. |
| Question | Scope | Verify + acceptance explicitly skip live QR. Is simulator-only Level 1 enough for archive? | `verify-report.md` WARNING; matrix “live QR not run” | Human call: if “Implemented” means WhatsApp chat, **do not archive** until Majors are fixed or claims are stripped. |

## Spec vs code (first-class)

| Spec / doc | Code |
|------------|------|
| Simulator **and/or** socket inbound | Simulator only |
| README / ARCHITECTURE live `messages.upsert` | No listener |
| Production delay floor | Implemented in `envSchema.superRefine` |
| Buttons optional/unstable | Text fallback — OK |
| Tests never open real socket | OK |
| Secret when configured | OK |
| Skip fromMe true or omitted | OK on extract path |
| No Redis/BullMQ | OK |

## Verdict

**FAIL**

Two **Majors**: the advertised live path cannot pair (QR discarded) and cannot ingest WhatsApp messages (no upsert handler). Mechanical verify (40 tests, fake socket) is **not** a substitute. Unsigned webhook and `0` delay in non-production are documented, not blockers.

Archiving is **not advisable** until either (1) live QR + inbound are implemented without tests opening a real socket, or (2) OpenSpec + hub + `index.ts` + `ARCHITECTURE_SDD.md` stop claiming a live inbound/QR demo.

## Recommended next steps (before archive)

1. Implement or honestly descope live socket inbound + QR rendering (code + spec/docs).
2. Re-run `npm test` only (still no live WA in CI).
3. New adversarial pass on the live-path diff only.
4. Human OK after Majors closed.
