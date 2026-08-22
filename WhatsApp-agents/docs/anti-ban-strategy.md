# Anti-ban / humanization strategy

> **Audience:** Unofficial gateways (Evolution, Waha, Baileys, WhatsMeow).  
> **Disclaimer:** Educational risk notes only — not production advice. Unofficial WhatsApp clients can violate Meta terms and risk account bans.

## Why Meta Cloud API skips this module

Meta WhatsApp Cloud API is the **official** channel. Session spoofing, typing simulation, and stochastic send delays are **not required** for Cloud API demos. The `meta-cloud-api/` template therefore has **no** delay dispatcher, presence simulator, or per-recipient queue.

## Evolution Level 1 — implemented (humanization C only)

The `evolution-api/` template implements a **simple in-process** path:

1. Emit presence `composing` via Evolution `chat/sendPresence`
2. Wait a stochastic delay in the **20–45 second** range (`HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS`)
3. Send the outbound message

**Explicitly not included for Evolution in this change:**

- Redis / BullMQ
- Per-recipient persistent queues
- Recording presence (reserved for future PTT/voice demos)

Tests inject sleep and/or set delays to `0` so CI does not wait wall-clock.

## Waha Level 1 — implemented (humanization C only)

The `waha/` template uses the same **C** pattern:

1. Emit typing via Waha `POST /api/startTyping`
2. Wait a stochastic delay in the **20–45 second** range (`HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS`)
3. Send the outbound message (`sendText` / `sendFile` / optional `sendButtons` / `sendList`)

**Explicitly not included for Waha in this change:**

- Redis / BullMQ
- Per-recipient persistent queues

Tests inject sleep and/or set delays to `0` so CI does not wait wall-clock.

## Baileys Level 1 — implemented (humanization C only)

The `baileys/` template uses the same **C** pattern on a **socket adapter** (not a REST gateway):

1. Emit presence via `sendPresenceUpdate('composing', jid)`
2. Wait a stochastic delay in the **20–45 second** range (`HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS`)
3. Send via `sendMessage`

**Explicitly not included for Baileys in this change:**

- Redis / BullMQ
- Per-recipient persistent queues
- Claiming stable native buttons (default menu is numbered text)

Tests inject a fake adapter + sleep and/or set delays to `0`. They never open a live WhatsApp socket.

## WhatsMeow Level 1 — implemented (humanization C only)

The `whatsmeow/` Go template uses the same **C** pattern on a **socket adapter** (not a REST gateway):

1. Emit presence via `SendPresence(to, "composing")`
2. Wait a stochastic delay in the **20–45 second** range (`HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS`)
3. Send via `SendMessage`

**Explicitly not included for WhatsMeow in this change:**

- Redis / BullMQ
- Per-recipient persistent queues
- Claiming stable native buttons (default menu is numbered text)

Tests inject a fake client + sleep and/or set delays to `0`. They never connect to WhatsApp or require a device.

## Later unofficial engines (queues / voice)

Per-recipient Redis/BullMQ queues and Level 4 voice remain **out of scope** for all unofficial Level 1 templates.

## Status matrix

| Item | Meta | Evolution | Waha | Baileys | WhatsMeow |
|---|---|---|---|---|---|
| Stochastic delay runtime | Not implemented | **Yes (20–45s)** | **Yes (20–45s)** | **Yes (20–45s)** | **Yes (20–45s)** |
| Presence typing | Not implemented | **Yes (`composing`)** | **Yes (`startTyping`)** | **Yes (`sendPresenceUpdate`)** | **Yes (`SendPresence` composing)** |
| BullMQ / Redis queues | Not implemented | **No** | **No** | **No** | **No** |
| Level 4 voice STT/TTS | Not implemented | Not implemented | Not implemented | Not implemented | Not implemented |
