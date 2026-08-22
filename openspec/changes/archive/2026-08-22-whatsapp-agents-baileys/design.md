## Context

Meta, Evolution, and Waha Level 1 exist. **Baileys** is an embedded Node socket, not an HTTP gateway. Tests must not require a live WhatsApp session: inject a fake socket.

## Goals / Non-Goals

**Goals:** Clean Architecture bot; humanization C; text + text-menu + coupon; secret on HTTP simulator; skip fromMe; production delay floor; docs + disclaimer.

**Non-Goals:** Redis/BullMQ; WhatsMeow; Level 2–4; claiming stable native buttons; live QR in CI.

## Decisions

1. Mirror Waha/Evolution folders.
2. `infrastructure/baileysSocket.ts` (or similar) wraps `@whiskeysockets/baileys`; tests inject a fake client with `sendPresenceUpdate` + `sendMessage`.
3. HTTP `/webhook` (or `/inbound`) simulator for TDD without WhatsApp — same secret pattern as Waha.
4. Real socket path documented in README (QR, auth folder gitignored).
5. Default menu = numbered text (Baileys buttons unstable).
6. Presence via `sendPresenceUpdate` (`composing`).
7. Optional `docker-compose.yml` running the Node bot only; document that pairing is interactive.
8. Author signature on `.ts`.

## Layer mapping

| Layer | Path |
|---|---|
| Presentation | `WhatsApp-agents/baileys/src/presentation/` |
| Services | `.../services/` demo + humanizedDispatch |
| Infrastructure | `.../infrastructure/` Baileys adapter |
| Contracts | `.../contracts/` |

## Risks

Unofficial protocol / ban; button API churn; QR cannot run in unit tests.
