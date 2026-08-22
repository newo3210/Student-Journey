## ADDED Requirements

### Requirement: WhatsMeow Level 1 inbound and text reply
The template SHALL accept inbound text via HTTP simulator and/or live event adapter and reply with text through an injectable client.

#### Scenario: Inbound text triggers outbound text
- **WHEN** a valid inbound text event arrives with fromMe false
- **THEN** the service sends a text reply through the client adapter

### Requirement: Numbered text menu and coupon media
#### Scenario: Outbound text menu
- **WHEN** the demo flow presents a menu
- **THEN** the adapter sends a numbered text menu

#### Scenario: Coupon media send
- **WHEN** the demo flow triggers coupon/media
- **THEN** the adapter sends document or image media

### Requirement: Humanization presence and delay
Before each user-facing send, emit composing (or WhatsMeow equivalent) then wait 20–45s without Redis/BullMQ. Tests inject a no-op/fast sleep.

#### Scenario: Presence then delayed send
- **WHEN** the humanized dispatcher sends
- **THEN** it calls presence first, then delay, then send

#### Scenario: Tests do not wait wall-clock 20–45s
- **WHEN** `go test` runs
- **THEN** the suite finishes without real multi-second waits

### Requirement: Simulator secret and fromMe skip
When webhook secret env is set, reject mismatch with 401/403. Skip fromMe true or omitted.

#### Scenario: Secret reject
- **WHEN** secret is set and header mismatches
- **THEN** no send is attempted

#### Scenario: Self message does not send
- **WHEN** fromMe is true or omitted
- **THEN** no send is attempted

### Requirement: Production delay floor
#### Scenario: Production rejects zero delay
- **WHEN** production mode env is set and min delay is 0
- **THEN** env validation fails

### Requirement: Live QR and inbound events
Live path SHALL surface pairing QR and SHALL route inbound user text events to the same demo handler. Unit tests cover wiring with fakes (no real WhatsApp).

#### Scenario: QR is surfaced
- **WHEN** the live wiring receives a QR code string
- **THEN** it is printed or rendered for scanning

#### Scenario: Live inbound drives demo handler
- **WHEN** a fake event source emits inbound user text
- **THEN** the demo handler is invoked

### Requirement: README, tests, hub complete
`.env.example` or documented env; unofficial disclaimer; `go test` green without live session; hub marks WhatsMeow Implemented.

#### Scenario: Suite green with mocks
- **WHEN** `go test ./...` runs in `WhatsApp-agents/whatsmeow/`
- **THEN** all tests pass without a live WhatsApp session

#### Scenario: Reader finds WhatsMeow implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the WhatsMeow row status is Implemented and points to `whatsmeow/`

### Requirement: Default binary uses real WhatsMeow for pairing and send
The default `go run` / `go build` (no extra build tags required) SHALL link `go.mau.fi/whatsmeow`, surface pairing QR, route live inbound text to the demo handler, and send replies/presence/media through the real client adapter. Unit tests SHALL keep using fakes and SHALL NOT Connect to WhatsApp. `go.mod` SHALL require the WhatsMeow module. Dockerfile SHALL build that same default (live-capable) binary.

#### Scenario: Default build includes WhatsMeow module
- **WHEN** a reviewer inspects `go.mod`
- **THEN** `go.mau.fi/whatsmeow` is a required dependency

#### Scenario: Process client is not a no-op fake when live starts
- **WHEN** live session start succeeds in production code
- **THEN** send/presence methods are bound to the WhatsMeow client, not an in-memory FakeSocket

### Requirement: Production webhook secret required
When `GO_ENV` or `NODE_ENV` is `production`, `WHATSMEOW_WEBHOOK_SECRET` SHALL be non-empty so the HTTP simulator is not a default send-oracle.

#### Scenario: Production rejects empty webhook secret
- **WHEN** production mode is set and the webhook secret is empty
- **THEN** env validation fails at startup
