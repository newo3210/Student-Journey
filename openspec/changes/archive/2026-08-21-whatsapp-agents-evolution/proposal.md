## Why

The WhatsApp Agents hub already ships Meta Cloud API. The next engine in the agreed order is **Evolution API**, so demos can compare an unofficial gateway with Docker-friendly setup, interactive menus, media send, and a lightweight humanization layer (presence + delay) without Redis.

## What Changes

- Replace the `evolution-api/` stub with a runnable Level 1 template (Express + TypeScript + Zod + Vitest)
- Docker Compose: Evolution API service + bot app
- Humanization **C**: presence (`composing` / `recording`) + stochastic 20–45s delay before send; no BullMQ/Redis
- Same demo surface as Meta: webhook + text, interactive buttons/lists, PDF/image coupon, defense README
- Update hub README (Evolution → Implemented), root `ARCHITECTURE_SDD.md` and `STUDENT_DECISION_LOG.md`

## Capabilities

### New Capabilities

- `evolution-agent-template`: Runnable Evolution API Level 1 bot with Compose and simple anti-ban humanization

### Modified Capabilities

- `whatsapp-agents-catalog`: Evolution folder status becomes Implemented; note humanization scope for unofficial engines

## Impact

- Code under `WhatsApp-agents/evolution-api/`
- Docker images/network for local Evolution instance (documented env for API key / instance name)
- Does not implement Waha/Baileys/WhatsMeow or Level 2–4 AI/voice
