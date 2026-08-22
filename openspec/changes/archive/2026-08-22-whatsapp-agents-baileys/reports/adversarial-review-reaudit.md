# Adversarial re-audit — whatsapp-agents-baileys

**Scope:** OpenSpec change `whatsapp-agents-baileys` (post-§6 live QR + `messages.upsert`)  
**Worktree:** `.worktrees/whatsapp-agents-baileys`  
**Reviewer:** independent session (did not implement original change or §6 fixes)  
**Date:** 2026-08-22  
**Prior verdict:** FAIL (`reports/adversarial-review.md` — left unchanged)  
**Sources:** updated `specs/baileys-agent-template/spec.md` (live QR + upsert), `tasks.md` §6, prior FAIL report, `wireLiveBaileysEvents.ts`, `createLiveSocket.ts`, `index.ts`, `wireLiveBaileysEvents.test.ts`, `contracts/webhook.ts`, `inboundHandler.ts`, `webhookRoutes.ts`, README / `ARCHITECTURE_SDD.md` / `STUDENT_DECISION_LOG.md`, `npm test` (47/47)

## Spec and task alignment

Updated SHALL (live socket, not Vitest): print/surface pairing QR from `connection.update`; handle inbound via `messages.upsert` using the same demo handler as the HTTP simulator (`fromMe` skip + humanized send). Unit tests: fake `ev.on`, no `makeWASocket`.

| Prior Major (FAIL) | Re-audit |
|--------------------|----------|
| QR from `connection.update` discarded (log sentence only; `qr` unused) | **Closed.** `wireLiveBaileysEvents` calls `printQr` (default `printBaileysQrToTerminal`: ASCII via `qrcode-terminal` + `BAILEYS_QR_PAYLOAD:`). `index.ts` does not override `printQr`. Tests fire fake `connection.update` with `qr: 'TESTQR'` and assert the callback is invoked once with that string. |
| No `messages.upsert` → demo handler | **Closed.** `index.ts` wires `onInbound` → `handleInboundWebhook` (same function as `webhookRoutes.ts`). Mapper builds `{ event: 'messages.upsert', payload }` accepted by `extractInboundEvent`. Tests invoke `handleInboundWebhook` through the wiring and assert presence + send. `fromMe: true` never calls `onInbound`. |

§6 tasks 6.1–6.4 marked done; README + `ARCHITECTURE_SDD.md` §2.5 / §3.5 now describe terminal QR + upsert → inboundHandler. Catalog still **Implemented**.

Mechanical: `npm test` in `WhatsApp-agents/baileys/` → **47 passed**, ~947ms, no live session. `wireLiveBaileysEvents.ts` does not import `@whiskeysockets/baileys` / `createLiveBaileysSocket` (asserted in test). `createLiveSocket.ts` only `creds.update` + `makeWASocket`; QR/upsert live in the wiring module.

## Hunt results (this pass)

| Hunt | Result |
|------|--------|
| QR still discarded in factory | **Not found.** Factory no longer handles `connection.update`. |
| Upsert not sharing HTTP handler | **Not found.** Both paths call `handleInboundWebhook`. |
| Tests opening real socket | **Not found.** Fake `ev.on` only. |
| Unsigned HTTP webhook | **By design when secret unset.** README + boot `console.warn` send-oracle. When set, 401/403 before send. Live inbound is the socket (not that POST). |
| Text-only proto mapping | **Confirmed.** `conversation` then `extendedTextMessage.text` only. Spec scenario is inbound **text**. README: “inbound WhatsApp text”. Image/audio/ephemeral not mapped. |
| Live WhatsApp in CI | **Still absent** (design non-goal). |

## Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Minor | Mapping | Live upsert ignores non-text proto (`imageMessage`, captions, `ephemeralMessage` wrappers). Demo will not reply to those chats. | `mapBaileysMessageToWebhookBody`; README/spec already scoped to text | **Docs:** one explicit “text-only mapping” bullet if oral defense needs it. Optional later: unwrap ephemeral. |
| Minor | Security | HTTP `/webhook` remains unsigned unless `BAILEYS_WEBHOOK_SECRET` is set (send-oracle on a public tunnel). Live chat does not use that header. | README; `index.ts` warn; `webhookRoutes.ts` | Already documented. Keep optional secret; do not treat as archive blocker. |
| Minor | CI / verify | No live QR scan in CI (non-goal). `verify-report.md` still says 40/40; matrix now 47/47 post-§6. | `design.md` non-goal; `verify-report.md` vs this run | **Docs:** refresh verify-report counts or mark “pre-§6; see re-audit”. |
| Minor | Timing | `wireLiveBaileysEvents` runs **after** `createLiveBaileysSocket` returns. A theoretically early `connection.update` during `makeWASocket` would be missed. Typical Baileys QR is async after WS connect. | `index.ts` order | **Code (follow-up):** attach `connection.update` immediately after `makeWASocket` if pairing flakes in the field. |
| Minor | Tests | Default `printBaileysQrToTerminal` is not unit-tested (suite injects `printQr`). Wiring + default implementation in source close the old no-op. | `wireLiveBaileysEvents.test.ts` | Optional spy on default printer; not required for archive. |
| Minor | Humanizer | Presence non-200 still proceeds to delay + send (unchanged from first review). | `humanizedDispatch.ts` | Spec or skip-send — follow-up. |

No **Blocker** or **Major** remaining against the updated spec.

## Spec vs code (first-class)

| Spec / doc | Code (post-§6) |
|------------|----------------|
| QR from `connection.update` surfaced | Default printer + injectable; tests prove callback not a no-op |
| `messages.upsert` → same demo handler | `index.ts` + shared `handleInboundWebhook` |
| fromMe skip | Wiring skip + `extractInboundEvent` (`fromMe !== false`) |
| Tests fake emitter, no `makeWASocket` | Proven |
| Simulator and/or socket inbound | Both wired |
| Live QR not in CI | Documented non-goal |

## Verdict

**PASS WITH GAPS**

Prior Majors are closed with code + fake-emitter tests. Residuals (no live WhatsApp in CI; text-only upsert mapping; unsigned webhook without secret) are **Minor** and documented. Archiving is **advisable** after human OK; do not treat mechanical verify as a live pairing proof.

## Recommended next steps (before archive)

1. Human OK on this re-audit (writer ≠ this reviewer).
2. Optional: refresh `verify-report.md` test counts; optional text-only mapping one-liner in README.
3. Do not overwrite `reports/adversarial-review.md` (historical FAIL).
