# Anti-ban / humanization strategy (documentation only)

> **Status:** Deferred. **No runtime code** ships in this change.  
> **Audience:** Future unofficial gateways (Evolution, Waha, Baileys, WhatsMeow).  
> **Disclaimer:** Educational risk notes only — not production advice. Unofficial WhatsApp clients can violate Meta terms and risk account bans.

## Why Meta Cloud API skips this module

Meta WhatsApp Cloud API is the **official** channel. Session spoofing, typing simulation, and stochastic send delays are **not required** for Cloud API demos. The `meta-cloud-api/` template therefore has **no** delay dispatcher, presence simulator, or per-recipient queue.

## Planned rules (unofficial engines — later changes)

When an unofficial engine folder is implemented, consider documenting and (only then) optionally implementing:

### 1. Presence simulation

- Emit `composing` / `recording` (or engine-equivalent) before long replies so the UX feels human.
- Cap presence duration; never leave presence stuck on forever.

### 2. Stochastic delay (20–45s jitter)

- Insert a random wait in the **20–45 second** range between outbound bursts to the same recipient when mimicking human chat cadence.
- Do **not** apply this blindly to transactional Cloud API flows; it belongs to unofficial “human session” patterns.

### 3. Per-recipient queues

- One outbound queue (or worker key) **per WhatsApp recipient** so messages to the same user stay ordered and paced.
- Shared global rate limits still apply at the process/gateway level.
- Candidate stacks later: BullMQ / Redis — **not** bundled in the Meta template.

## Explicit non-goals for `whatsapp-agents` (this change)

| Item | Status |
|---|---|
| Stochastic delay runtime | Not implemented |
| Presence `composing`/`recording` | Not implemented |
| BullMQ / Redis queues | Not implemented |
| Level 4 voice STT/TTS | Not implemented |

Follow-up OpenSpec changes may introduce these for unofficial engines only, after a dedicated design review.
