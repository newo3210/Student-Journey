# waha-agent-template

## Purpose

Runnable Waha Level 1 WhatsApp agent: webhook, text/media demo, text-menu fallback on CORE, presence plus delay humanization, Compose, optional webhook secret.
## Requirements

### Requirement: Waha Level 1 webhook and text reply
The Waha template SHALL accept inbound webhooks and reply with text via the Waha HTTP client using configured session and API key.

#### Scenario: Inbound text triggers outbound text
- **WHEN** a valid webhook POST contains an inbound text message
- **THEN** the service sends a text reply through the Waha client for the configured session

### Requirement: Interactive buttons or lists via Waha
The template SHALL send at least one interactive message type (buttons and/or list) when the Waha API supports it, or a documented text-menu fallback, and SHALL handle inbound interactive or keyword replies.

#### Scenario: Outbound interactive or fallback menu
- **WHEN** the demo flow presents a menu
- **THEN** the Waha client sends buttons/list **or** a clearly documented text fallback menu

#### Scenario: Inbound menu reply
- **WHEN** the user selects an option or sends a menu keyword
- **THEN** the handler responds with a deterministic follow-up (text and/or media)

### Requirement: Outbound coupon media
The template SHALL send image and/or PDF document media with optional caption for a coupon demo.

#### Scenario: Coupon media send
- **WHEN** the demo flow triggers coupon/media
- **THEN** the Waha client sends document or image media to the user

### Requirement: Simple humanization presence and delay
Before each outbound user-facing send, the template SHALL emit a presence update (`typing` or Waha equivalent) and wait a stochastic delay between 20 and 45 seconds, without Redis or BullMQ. Tests SHALL inject a fast/no-op sleep.

#### Scenario: Presence then delayed send
- **WHEN** the humanized dispatcher sends a message
- **THEN** it calls Waha presence first, then waits within the configured delay range, then calls the send endpoint

#### Scenario: Tests do not wait wall-clock 20–45s
- **WHEN** the unit test suite runs the humanizer
- **THEN** sleep is injected/mocked so tests complete without real multi-second waits

### Requirement: Docker Compose for Waha and bot
The template SHALL ship a `docker-compose.yml` that runs Waha and the bot service with documented env wiring.

#### Scenario: Compose file documents services
- **WHEN** a reader opens `WhatsApp-agents/waha/docker-compose.yml` and the README
- **THEN** they see Waha and bot services, required env vars, and how to point the bot at Waha

### Requirement: Webhook shared secret when configured
When a webhook secret env var is set, the template SHALL reject POST webhooks that omit or mismatch the documented header. README SHALL warn that a public tunnel without the secret is a send-oracle.

#### Scenario: Valid webhook secret accepted
- **WHEN** the secret is set and POST includes the matching header
- **THEN** the server acknowledges HTTP 200 and may process inbound events

#### Scenario: Missing or invalid webhook secret rejected
- **WHEN** the secret is set and POST omits or mismatches it
- **THEN** the server responds with HTTP 401 or 403 and does not call Waha send APIs

### Requirement: Ignore self / outbound echo events
The template SHALL not send replies for self-chat / fromMe-equivalent events.

#### Scenario: Self message does not send
- **WHEN** the webhook payload indicates the message is from the session itself
- **THEN** the handler does not call Waha send endpoints

### Requirement: Production delay floor
When `NODE_ENV` is `production`, min delay SHALL be at least 20000 ms and max at least 45000 ms. Zero delays are allowed only when not production.

#### Scenario: Production rejects zero delay
- **WHEN** `NODE_ENV=production` and min delay is 0
- **THEN** env validation fails at startup

### Requirement: Clean Architecture, README, tests
The template SHALL use presentation/services/infrastructure/contracts, `.env.example` without secrets, unofficial disclaimer, and Vitest with mocked Waha HTTP.

#### Scenario: Thin presentation
- **WHEN** a reviewer inspects webhook routes
- **THEN** routes only validate/parse and call services; Waha HTTP lives in infrastructure

#### Scenario: Suite green with mocks
- **WHEN** `npm test` runs in `WhatsApp-agents/waha/`
- **THEN** all unit tests pass without calling a real Waha server
