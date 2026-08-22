# Acceptance Matrix — whatsapp-agents-baileys

**Date:** 2026-08-22  
**Author:** director Phase 6a (apply by separate implementer)

Scenarios copied from specs.

### Inbound text triggers outbound text
**WHEN** a valid inbound text event arrives with fromMe false  
**THEN** the service sends a text reply through the Baileys adapter  
**Evidence:** inboundHandler tests + fake adapter. Result: PASS.

### Outbound text menu
**WHEN** the demo flow presents a menu  
**THEN** the adapter sends a numbered text menu (or documented optional buttons)  
**Evidence:** demoFlow/outboundBuilders; buttons fall back to text. Result: PASS.

### Coupon media send
**WHEN** the demo flow triggers coupon/media  
**THEN** the adapter sends document or image media  
**Evidence:** builders + inbound coupon path. Result: PASS.

### Presence then delayed send
**WHEN** the humanized dispatcher sends  
**THEN** it calls presence first, then delay, then send  
**Evidence:** humanizedDispatch.test.ts. Result: PASS.

### Tests do not wait wall-clock 20–45s
**WHEN** `npm test` runs  
**THEN** the suite finishes without real multi-second waits  
**Evidence:** 40 tests ~950ms. Result: PASS.

### Secret reject
**WHEN** secret is set and header mismatches  
**THEN** no send is attempted  
**Evidence:** webhookRoutes 401/403. Result: PASS.

### Self message does not send
**WHEN** fromMe is true or omitted  
**THEN** no send is attempted  
**Evidence:** webhook extract + handler tests. Result: PASS.

### Production rejects zero delay
**WHEN** NODE_ENV=production and min delay is 0  
**THEN** env validation fails  
**Evidence:** env.test.ts. Result: PASS.

### Suite green with mocks
**WHEN** `npm test` runs in `WhatsApp-agents/baileys/`  
**THEN** all tests pass without a live WhatsApp session  
**Evidence:** 47/47 (post-§6). Result: PASS.

### QR from connection.update is surfaced
**WHEN** the live wiring receives a `connection.update` containing `qr`  
**THEN** the QR string is printed or rendered so a human can scan it (not silently discarded)  
**Evidence:** `wireLiveBaileysEvents.test.ts` fake emitter + printQr inject. Result: PASS.

### messages.upsert drives demo replies
**WHEN** the live wiring receives `messages.upsert` with an inbound user text (`fromMe` false)  
**THEN** the demo handler is invoked (same path as HTTP simulator)  
**Evidence:** wireLiveBaileysEvents tests. Result: PASS.

### Reader finds Baileys implemented
**WHEN** a reader opens `WhatsApp-agents/README.md`  
**THEN** the Baileys row status is Implemented and points to `baileys/`  
**Evidence:** hub table. Result: PASS.

## Summary

| Total | Pass | Fail | Blocked |
|---|---|---|---|
| 12 | 12 | 0 | 0 |

**Verdict:** PASS (mocked socket; live QR not run)
