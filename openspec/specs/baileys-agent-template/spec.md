# baileys-agent-template

## Purpose

Runnable Baileys Level 1 WhatsApp agent: HTTP simulator plus live socket (QR print + messages.upsert), numbered text menu, presence plus delay humanization.
## Requirements

### Requirement: Baileys Level 1 inbound and text reply
The template SHALL accept inbound text (HTTP simulator and/or socket adapter) and reply with text via the Baileys client adapter.

#### Scenario: Inbound text triggers outbound text
- **WHEN** a valid inbound text event arrives with fromMe false
- **THEN** the service sends a text reply through the Baileys adapter

### Requirement: Menu via text fallback
The template SHALL present a numbered text menu by default (native buttons documented as unstable) and handle keyword/numeric replies.

#### Scenario: Outbound text menu
- **WHEN** the demo flow presents a menu
- **THEN** the adapter sends a numbered text menu (or documented optional buttons)

### Requirement: Outbound coupon media
#### Scenario: Coupon media send
- **WHEN** the demo flow triggers coupon/media
- **THEN** the adapter sends document or image media

### Requirement: Humanization presence and delay
Before each user-facing send, emit composing presence then wait 20–45s without Redis/BullMQ. Tests inject sleep.

#### Scenario: Presence then delayed send
- **WHEN** the humanized dispatcher sends
- **THEN** it calls presence first, then delay, then send

#### Scenario: Tests do not wait wall-clock 20–45s
- **WHEN** `npm test` runs
- **THEN** the suite finishes without real multi-second waits

### Requirement: Simulator webhook secret and fromMe skip
When secret env is set, reject mismatch with 401/403. Skip fromMe true or omitted.

#### Scenario: Secret reject
- **WHEN** secret is set and header mismatches
- **THEN** no send is attempted

#### Scenario: Self message does not send
- **WHEN** fromMe is true or omitted
- **THEN** no send is attempted

### Requirement: Production delay floor
#### Scenario: Production rejects zero delay
- **WHEN** NODE_ENV=production and min delay is 0
- **THEN** env validation fails

### Requirement: Clean Architecture, README, tests, optional Compose
Presentation thin; Baileys HTTP/socket in infrastructure; `.env.example`; unofficial disclaimer; Vitest with fake socket.

#### Scenario: Suite green with mocks
- **WHEN** `npm test` runs in `WhatsApp-agents/baileys/`
- **THEN** all tests pass without a live WhatsApp session

### Requirement: Live socket QR and inbound upsert
When running the live socket (not Vitest), the template SHALL print or otherwise surface the pairing QR from `connection.update` and SHALL handle inbound WhatsApp messages via `messages.upsert`, reusing the same demo handler as the HTTP simulator (fromMe skip + humanized send). Unit tests SHALL cover the wiring with a fake event emitter, without `makeWASocket`.

#### Scenario: QR from connection.update is surfaced
- **WHEN** the live wiring receives a `connection.update` containing `qr`
- **THEN** the QR string is printed or rendered so a human can scan it (not silently discarded)

#### Scenario: messages.upsert drives demo replies
- **WHEN** the live wiring receives `messages.upsert` with an inbound user text (`fromMe` false)
- **THEN** the demo handler is invoked (same path as HTTP simulator)
