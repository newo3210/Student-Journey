# Acceptance Matrix (independent verification)

Copy scenarios **literally** from `openspec/changes/whatsapp-agents-waha/specs/**/spec.md`.

**Change:** `whatsapp-agents-waha`  
**Date:** 2026-08-22  
**Author:** director Phase 6a (apply by separate implementer)

## Scenarios

### Scenario: Inbound text triggers outbound text
- **WHEN** a valid webhook POST contains an inbound text message
- **THEN** the service sends a text reply through the Waha client for the configured session  
**Evidence:** `inboundHandler.test.ts` mocked client. Result: PASS.

### Scenario: Outbound interactive or fallback menu
- **WHEN** the demo flow presents a menu
- **THEN** the Waha client sends buttons/list **or** a clearly documented text fallback menu  
**Evidence:** default `WAHA_MENU_MODE=text`; README documents CORE fallback; builders/demoFlow tests. Result: PASS.

### Scenario: Inbound menu reply
- **WHEN** the user selects an option or sends a menu keyword
- **THEN** the handler responds with a deterministic follow-up (text and/or media)  
**Evidence:** `demoFlow.test.ts`. Result: PASS.

### Scenario: Coupon media send
- **WHEN** the demo flow triggers coupon/media
- **THEN** the Waha client sends document or image media to the user  
**Evidence:** outbound builders + inbound coupon path. Result: PASS.

### Scenario: Presence then delayed send
- **WHEN** the humanized dispatcher sends a message
- **THEN** it calls Waha presence first, then waits within the configured delay range, then calls the send endpoint  
**Evidence:** `humanizedDispatch.test.ts` + `startTyping` URL test. Result: PASS.

### Scenario: Tests do not wait wall-clock 20–45s
- **WHEN** the unit test suite runs the humanizer
- **THEN** sleep is injected/mocked so tests complete without real multi-second waits  
**Evidence:** 40 tests ~951ms. Result: PASS.

### Scenario: Compose file documents services
- **WHEN** a reader opens `WhatsApp-agents/waha/docker-compose.yml` and the README
- **THEN** they see Waha and bot services, required env vars, and how to point the bot at Waha  
**Evidence:** compose `waha:3000` + `bot:3002`; README. Result: PASS.

### Scenario: Valid webhook secret accepted
- **WHEN** the secret is set and POST includes the matching header
- **THEN** the server acknowledges HTTP 200 and may process inbound events  
**Evidence:** `webhookRoutes.test.ts`. Result: PASS.

### Scenario: Missing or invalid webhook secret rejected
- **WHEN** the secret is set and POST omits or mismatches it
- **THEN** the server responds with HTTP 401 or 403 and does not call Waha send APIs  
**Evidence:** 401 omit / 403 mismatch. Result: PASS.

### Scenario: Self message does not send
- **WHEN** the webhook payload indicates the message is from the session itself
- **THEN** the handler does not call Waha send endpoints  
**Evidence:** `fromMe: true` and omitted → no send. Result: PASS.

### Scenario: Production rejects zero delay
- **WHEN** `NODE_ENV=production` and min delay is 0
- **THEN** env validation fails at startup  
**Evidence:** `env.test.ts`. Result: PASS.

### Scenario: Thin presentation
- **WHEN** a reviewer inspects webhook routes
- **THEN** routes only validate/parse and call services; Waha HTTP lives in infrastructure  
**Evidence:** `webhookRoutes.ts` vs `wahaClient.ts`. Result: PASS.

### Scenario: Suite green with mocks
- **WHEN** `npm test` runs in `WhatsApp-agents/waha/`
- **THEN** all unit tests pass without calling a real Waha server  
**Evidence:** 40/40. Result: PASS.

### Scenario: Reader finds Waha implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the Waha row status is Implemented and points to `waha/`  
**Evidence:** hub table. Result: PASS.

## Summary

| Total | Pass | Fail | Blocked |
|---|---|---|---|
| 14 | 14 | 0 | 0 |

**Verdict:** PASS (mocked HTTP; live QR not run)
