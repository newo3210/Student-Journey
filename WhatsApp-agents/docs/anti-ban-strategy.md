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

## Planned rules (later unofficial engines)

When Waha / Baileys / WhatsMeow folders are implemented, consider documenting and (only then) optionally implementing:

### 1. Presence simulation

- Emit `composing` / `recording` (or engine-equivalent) before long replies.
- Cap presence duration; never leave presence stuck on forever.

### 2. Stochastic delay (20–45s jitter)

- Random wait in the **20–45 second** range between outbound bursts to the same recipient when mimicking human chat cadence.

### 3. Per-recipient queues

- One outbound queue (or worker key) **per WhatsApp recipient**.
- Candidate stacks later: BullMQ / Redis — **not** bundled in Evolution Level 1.

## Status matrix

| Item | Meta | Evolution (this change) | Other engines |
|---|---|---|---|
| Stochastic delay runtime | Not implemented | **Yes (20–45s)** | Planned |
| Presence `composing` | Not implemented | **Yes** | Planned |
| BullMQ / Redis queues | Not implemented | **No** | Planned |
| Level 4 voice STT/TTS | Not implemented | Not implemented | Planned |
