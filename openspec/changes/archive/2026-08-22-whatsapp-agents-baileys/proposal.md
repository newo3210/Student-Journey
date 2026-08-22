## Why

Next engine after Waha is **Baileys** (WhatsApp Web multi-device in Node). The hub needs a Level 1 sample that shows socket-level presence (`sendPresenceUpdate`) plus the same demo surface, with honest notes that native buttons are unstable.

## What Changes

- Replace `baileys/` stub with Express+TS+Zod+Vitest Level 1 template
- Baileys socket in infrastructure (injectable for tests); presentation stays HTTP-thin for local webhook/simulator
- Humanization C: presence composing then 20–45s delay; no Redis/BullMQ
- Demo: text, numbered text menu (buttons optional/documented unstable), coupon media
- Webhook/simulator secret when configured; skip fromMe
- Production delay floor; unofficial disclaimer
- Hub README: Baileys Implemented; WhatsMeow remains stub
- Root ARCHITECTURE_SDD.md + STUDENT_DECISION_LOG.md

## Capabilities

### New Capabilities

- `baileys-agent-template`: Runnable Baileys Level 1 bot with humanization C and testable inbound adapter

### Modified Capabilities

- `whatsapp-agents-catalog`: Baileys Implemented; WhatsMeow stub only

## Impact

- Code under `WhatsApp-agents/baileys/`
- Auth creds/QR on disk (gitignored); unofficial ToS risk
- Optional Compose wrapping the Node process only (no separate gateway image required)
