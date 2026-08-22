# evolution-agent-template

## Purpose

Runnable Evolution API Level 1 WhatsApp agent: webhook, text/interactive/media demo, presence plus delay humanization, Docker Compose (slim + full), optional webhook secret, and Clean Architecture layout.

## Requirements

### Requirement: Evolution Level 1 webhook and text reply
The Evolution template SHALL accept inbound webhooks and reply with text via the Evolution API HTTP client using configured instance and API key.

#### Scenario: Inbound text triggers outbound text
- **WHEN** a valid webhook POST contains an inbound text message
- **THEN** the service sends a text reply through the Evolution client for the configured instance

### Requirement: Interactive buttons or lists via Evolution
The template SHALL send at least one interactive message type (buttons and/or list) and handle the inbound interactive reply.

#### Scenario: Outbound interactive menu
- **WHEN** the demo flow presents a menu (keyword or first text greeting)
- **THEN** the Evolution client sends an interactive buttons or list message

#### Scenario: Inbound interactive reply
- **WHEN** the user selects an interactive option
- **THEN** the handler parses the selected id and responds with a deterministic follow-up (text and/or media)

### Requirement: Outbound coupon media
The template SHALL send image and/or PDF document media with optional caption for a coupon demo.

#### Scenario: Coupon media send
- **WHEN** the demo flow triggers coupon/media (keyword or button)
- **THEN** the Evolution client sends document or image media to the user

### Requirement: Simple humanization presence and delay
Before each outbound user-facing send, the template SHALL emit a presence update (`composing` for text/media) and wait a stochastic delay between 20 and 45 seconds, without Redis or BullMQ. Tests SHALL inject a fast/no-op sleep.

#### Scenario: Presence then delayed send
- **WHEN** the humanized dispatcher sends a message
- **THEN** it calls Evolution presence first, then waits within the configured delay range, then calls the send endpoint

#### Scenario: Tests do not wait wall-clock 20–45s
- **WHEN** the unit test suite runs the humanizer
- **THEN** sleep is injected/mocked so tests complete without real multi-second waits

### Requirement: Docker Compose for Evolution and bot
The template SHALL ship a `docker-compose.yml` that runs Evolution API and the bot service with documented env wiring.

#### Scenario: Compose file documents services
- **WHEN** a reader opens `WhatsApp-agents/evolution-api/docker-compose.yml` and the README
- **THEN** they see Evolution and bot services, required env vars, and how to point the bot at Evolution

### Requirement: Clean Architecture defense README and secrets safety
The template SHALL use presentation/services/infrastructure/contracts folders, ship `.env.example` without secrets, and include a defense README with unofficial-gateway disclaimer.

#### Scenario: Thin presentation
- **WHEN** a reviewer inspects webhook routes
- **THEN** routes only validate/parse and call services; Evolution HTTP lives in infrastructure

#### Scenario: Startup fails on missing env
- **WHEN** the bot starts without required Evolution env vars
- **THEN** startup validation fails listing missing keys

### Requirement: Automated tests for builders and humanizer
The template SHALL include Vitest coverage for outbound payload builders, webhook parsing, and humanized dispatch (mocked Evolution HTTP).

#### Scenario: Suite green with mocks
- **WHEN** `npm test` runs in `WhatsApp-agents/evolution-api/`
- **THEN** all unit tests pass without calling a real Evolution server

### Requirement: Webhook shared secret when configured
When `EVOLUTION_WEBHOOK_SECRET` is set, the template SHALL reject POST webhooks that omit or mismatch the shared secret header (`x-webhook-secret` or equivalent documented header). README SHALL warn that a public tunnel without the secret is a send-oracle.

#### Scenario: Valid webhook secret accepted
- **WHEN** `EVOLUTION_WEBHOOK_SECRET` is set and POST includes the matching secret header
- **THEN** the server acknowledges HTTP 200 and may process inbound events

#### Scenario: Missing or invalid webhook secret rejected
- **WHEN** `EVOLUTION_WEBHOOK_SECRET` is set and POST omits or mismatches the secret
- **THEN** the server responds with HTTP 401 or 403 and does not call Evolution send APIs

#### Scenario: Unsigned public demo documented as unsafe
- **WHEN** a reader opens the Evolution template README
- **THEN** they see an explicit warning that exposing `/webhook` publicly without `EVOLUTION_WEBHOOK_SECRET` allows forged inbound and outbound spam via the connected session

### Requirement: Ignore outbound and ambiguous fromMe events
The template SHALL process inbound messages only when `fromMe` is explicitly `false`. Missing or `true` SHALL not trigger outbound sends.

#### Scenario: Missing fromMe does not send
- **WHEN** an otherwise valid webhook payload omits `fromMe`
- **THEN** the handler does not call Evolution send endpoints

### Requirement: Production delay floor
When `NODE_ENV` is `production`, `HUMANIZE_MIN_MS` SHALL be at least 20000 and `HUMANIZE_MAX_MS` at least 45000 (and max >= min). Values of 0 are allowed only when `NODE_ENV` is not `production` (tests/local).

#### Scenario: Production rejects zero delay
- **WHEN** `NODE_ENV=production` and `HUMANIZE_MIN_MS` is 0
- **THEN** env validation fails at startup

#### Scenario: Non-production allows test bypass
- **WHEN** `NODE_ENV` is `test` (or unset/development) and delays are 0
- **THEN** env validation succeeds so the suite can inject/no-op sleep

### Requirement: Compose stack documented honestly
The Compose file SHALL document whether the Evolution gateway uses slim (no Redis/Postgres) vs official-style dependencies. README SHALL state that live `compose up` against unofficial images may require Redis/Postgres, and SHALL provide a documented `full` profile or extra compose file with Redis (and Postgres if needed) for closer-to-official boot.

#### Scenario: README states slim vs full
- **WHEN** a reader opens the Evolution README Compose section
- **THEN** they see slim-demo vs `full` (Redis/Postgres) guidance and that live QR pairing is a manual smoke step
