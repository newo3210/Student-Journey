# Acceptance Matrix (independent verification)

Copy scenarios **literally** from `openspec/changes/whatsapp-agents-evolution/specs/**/spec.md`.

**Change:** `whatsapp-agents-evolution`  
**Date:** 2026-08-21  
**Author:** director Phase 6a (apply by separate implementer)

## Scenarios

### Scenario: Inbound text triggers outbound text

- **WHEN** a valid webhook POST contains an inbound text message
- **THEN** the service sends a text reply through the Evolution client for the configured instance

**Evidence:** unit tests `inboundHandler.test.ts` / `webhookRoutes.test.ts` — mocked Evolution client. Result: PASS. Notes: no live instance.

### Scenario: Outbound interactive menu

- **WHEN** the demo flow presents a menu (keyword or first text greeting)
- **THEN** the Evolution client sends an interactive buttons or list message

**Evidence:** `demoFlow.test.ts` + `outboundBuilders.test.ts`. Result: PASS.

### Scenario: Inbound interactive reply

- **WHEN** the user selects an interactive option
- **THEN** the handler parses the selected id and responds with a deterministic follow-up (text and/or media)

**Evidence:** `demoFlow.test.ts` / `inboundHandler.test.ts`. Result: PASS.

### Scenario: Coupon media send

- **WHEN** the demo flow triggers coupon/media (keyword or button)
- **THEN** the Evolution client sends document or image media to the user

**Evidence:** outbound builders + inbound handler coupon path. Result: PASS.

### Scenario: Presence then delayed send

- **WHEN** the humanized dispatcher sends a message
- **THEN** it calls Evolution presence first, then waits within the configured delay range, then calls the send endpoint

**Evidence:** `humanizedDispatch.test.ts` — `sendPresence` before `sendMessage`. Result: PASS.

### Scenario: Tests do not wait wall-clock 20–45s

- **WHEN** the unit test suite runs the humanizer
- **THEN** sleep is injected/mocked so tests complete without real multi-second waits

**Evidence:** `npm test` 31 tests in 698ms. Result: PASS.

### Scenario: Compose file documents services

- **WHEN** a reader opens `WhatsApp-agents/evolution-api/docker-compose.yml` and the README
- **THEN** they see Evolution and bot services, required env vars, and how to point the bot at Evolution

**Evidence:** compose lists `evolution-api` (8080) and `bot` (3001); README + comments document webhook URL. Result: PASS.

### Scenario: Thin presentation

- **WHEN** a reviewer inspects webhook routes
- **THEN** routes only validate/parse and call services; Evolution HTTP lives in infrastructure

**Evidence:** `webhookRoutes.ts` — no Evolution HTTP; client in `evolutionClient.ts`. Result: PASS.

### Scenario: Startup fails on missing env

- **WHEN** the bot starts without required Evolution env vars
- **THEN** startup validation fails listing missing keys

**Evidence:** `npx tsx src/index.ts` without env → Invalid environment configuration listing `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE`. Result: PASS.

### Scenario: Suite green with mocks

- **WHEN** `npm test` runs in `WhatsApp-agents/evolution-api/`
- **THEN** all unit tests pass without calling a real Evolution server

**Evidence:** 31/31 passed. Result: PASS.

### Scenario: Reader finds Evolution implemented

- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the Evolution row status is Implemented and points to `evolution-api/`

**Evidence:** hub table row **Implemented** (Level 1 + humanization C). Result: PASS.

### Scenario: Humanization scope visible in catalog

- **WHEN** a reader opens the hub README or linked anti-ban docs
- **THEN** they see that Evolution Level 1 uses presence + 20–45s delay only (no BullMQ/Redis yet)

**Evidence:** hub README + `docs/anti-ban-strategy.md`. Result: PASS.

### Scenario: Valid webhook secret accepted

- **WHEN** `EVOLUTION_WEBHOOK_SECRET` is set and POST includes the matching secret header
- **THEN** the server acknowledges HTTP 200 and may process inbound events

**Evidence:** `webhookRoutes.test.ts` after §6. Result: PASS. Notes: suite 39/39.

### Scenario: Missing or invalid webhook secret rejected

- **WHEN** `EVOLUTION_WEBHOOK_SECRET` is set and POST omits or mismatches the secret
- **THEN** the server responds with HTTP 401 or 403 and does not call Evolution send APIs

**Evidence:** omit → 401; mismatch → 403; send not called. Result: PASS.

### Scenario: Unsigned public demo documented as unsafe

- **WHEN** a reader opens the Evolution template README
- **THEN** they see an explicit warning that exposing `/webhook` publicly without `EVOLUTION_WEBHOOK_SECRET` allows forged inbound and outbound spam via the connected session

**Evidence:** README + startup warn. Result: PASS.

### Scenario: Missing fromMe does not send

- **WHEN** an otherwise valid webhook payload omits `fromMe`
- **THEN** the handler does not call Evolution send endpoints

**Evidence:** webhook extract + inboundHandler tests. Result: PASS.

### Scenario: Production rejects zero delay

- **WHEN** `NODE_ENV=production` and `HUMANIZE_MIN_MS` is 0
- **THEN** env validation fails at startup

**Evidence:** `env.test.ts` production parse. Result: PASS.

### Scenario: Non-production allows test bypass

- **WHEN** `NODE_ENV` is `test` (or unset/development) and delays are 0
- **THEN** env validation succeeds so the suite can inject/no-op sleep

**Evidence:** `env.test.ts` + vitest 39 tests ~0.9s. Result: PASS.

### Scenario: README states slim vs full

- **WHEN** a reader opens the Evolution README Compose section
- **THEN** they see slim-demo vs `full` (Redis/Postgres) guidance and that live QR pairing is a manual smoke step

**Evidence:** README + `docker-compose.full.yml`. Result: PASS. Notes: live `compose up` not run.

## Summary

| Total | Pass | Fail | Blocked |
|---|---|---|---|
| 19 | 19 | 0 | 0 |

**Verdict:** PASS (unit + docs). Re-audit pending.

**Residual:** live QR/session not executed; unsigned webhook if secret unset; slim compose unverified boot.
