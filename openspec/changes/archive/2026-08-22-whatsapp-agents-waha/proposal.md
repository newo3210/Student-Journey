## Why

The WhatsApp Agents hub already ships Meta Cloud API and Evolution API. The next engine in the agreed order is **Waha** (WhatsApp HTTP API), so demos can compare a Docker-first unofficial gateway with the same Level 1 surface (webhook, menus, media) and humanization C (presence + delay, no Redis queues).

## What Changes

- Replace the `waha/` stub with a runnable Level 1 template (Express + TypeScript + Zod + Vitest)
- Docker Compose: Waha + bot (slim documented; extra deps if required)
- Humanization **C**: presence (`typing` / engine equivalent) + stochastic 20–45s delay; no BullMQ/Redis
- Same demo as Meta/Evolution: webhook + text, interactive buttons/lists (or documented fallback), PDF/image coupon, defense README
- Webhook shared secret when configured; process inbound only when not a self-message
- Production delay floor; unsigned public webhook documented as unsafe
- Update hub README (Waha → Implemented), root `ARCHITECTURE_SDD.md` and `STUDENT_DECISION_LOG.md`

## Capabilities

### New Capabilities

- `waha-agent-template`: Runnable Waha Level 1 bot with Compose and simple anti-ban humanization

### Modified Capabilities

- `whatsapp-agents-catalog`: Waha folder status becomes Implemented; remaining stubs Baileys and WhatsMeow

## Impact

- Code under `WhatsApp-agents/waha/`
- Docker image for Waha (document version); unofficial ToS disclaimer
- Does not implement Baileys/WhatsMeow or Level 2–4 AI/voice
