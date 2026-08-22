## Why

Demonstrable WhatsApp agent templates are needed now for client/portfolio demos, independent of the Academic Full Stack pack. A dedicated hub folder lets us compare engines (Meta Cloud API first, then Evolution, Waha, Baileys, WhatsMeow) one template at a time, with a progressive complexity model (levels 1–4) and a documented anti-ban strategy deferred until specified.

## What Changes

- Create hub `WhatsApp-agents/` with catalog README (engine matrix, levels 1–4, anti-ban docs-only)
- Scaffold planned engine folders; implement **Meta Cloud API** template first
- Meta template MVP: webhook receiver + text reply, interactive buttons/lists, PDF/image/coupon media send, defense README
- Clean Architecture layout (presentation / services / repositories / contracts)
- Update root `ARCHITECTURE_SDD.md` and `STUDENT_DECISION_LOG.md`
- Note Advanced WhatsApp track as parallel to Academic (does not replace academic repos)

## Capabilities

### New Capabilities

- `whatsapp-agents-catalog`: Hub structure, level/engine documentation, and anti-ban strategy as documentation only
- `meta-cloud-agent-template`: Runnable Meta Cloud API sample bot (webhook, text, interactive, media)

### Modified Capabilities

- *(none)*

## Impact

- New tree under `WhatsApp-agents/` (code + docs); no changes to Academic `apps/react-task-manager`
- Requires Meta WhatsApp Cloud API credentials via `.env` (never committed)
- Follow-up changes will add other engines one folder at a time
- Anti-ban / queues / voice remain non-goals until separate changes
