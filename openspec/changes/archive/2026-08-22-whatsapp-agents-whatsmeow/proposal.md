## Why

Last hub engine: **WhatsMeow** (Go multi-device). Completes the five-engine catalog with a Level 1 sample that shows efficient Go sockets, presence + delay humanization, and an HTTP simulator for tests without a live WhatsApp session.

## What Changes

- Replace `whatsmeow/` stub with a Go module (stdlib HTTP or thin router) + tests
- Injectable WhatsMeow client adapter; live path prints QR and handles inbound events
- Humanization C: composing presence then 20–45s delay; no Redis/BullMQ
- Demo: text, numbered text menu, coupon media (document if send is URL/bytes)
- HTTP simulator secret; skip fromMe
- Production delay floor
- Hub: all five engines Implemented
- Root ARCHITECTURE_SDD.md + STUDENT_DECISION_LOG.md

## Capabilities

### New Capabilities

- `whatsmeow-agent-template`: Runnable WhatsMeow Level 1 bot (Go) with simulator + live QR/inbound wiring

### Modified Capabilities

- `whatsapp-agents-catalog`: WhatsMeow Implemented (no remaining engine stubs)

## Impact

- Go code under `WhatsApp-agents/whatsmeow/`
- Session store gitignored; unofficial ToS disclaimer
- Optional Dockerfile wrapping the Go binary
