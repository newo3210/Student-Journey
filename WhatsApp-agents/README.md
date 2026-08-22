# WhatsApp Agents Hub

Parallel portfolio track for demonstrable WhatsApp agent templates. **Does not replace** the Academic Full Stack pack (`docs/ACADEMIC_PORTFOLIO.md`); it runs beside it for client/demo urgency.

OpenSpec changes: `openspec/changes/whatsapp-agents/`, `openspec/changes/whatsapp-agents-evolution/`, `openspec/changes/whatsapp-agents-waha/`, `openspec/changes/whatsapp-agents-baileys/`, `openspec/changes/whatsapp-agents-whatsmeow/`.

## Engine comparison

| Engine | Official API? | Folder | Status |
|---|---|---|---|
| **Meta Cloud API** | Yes (WhatsApp Cloud API) | [`meta-cloud-api/`](./meta-cloud-api/) | **Implemented** (Level 1 MVP) |
| **Evolution API** | Unofficial gateway | [`evolution-api/`](./evolution-api/) | **Implemented** (Level 1 + humanization C) |
| **Waha** | Unofficial gateway | [`waha/`](./waha/) | **Implemented** (Level 1 + humanization C) |
| **Baileys** | Unofficial (WhatsApp Web socket) | [`baileys/`](./baileys/) | **Implemented** (Level 1 + humanization C; numbered text menu) |
| **WhatsMeow** | Unofficial (Go multi-device) | [`whatsmeow/`](./whatsmeow/) | **Implemented** (Level 1 + humanization C; numbered text menu) |

**Engine order:** Meta → Evolution → Waha → Baileys → WhatsMeow (catalog complete at Level 1).

## Complexity levels (1–4)

| Level | Focus | Status |
|---|---|---|
| **1 — Menus & media** | Text reply, interactive buttons/lists, image/PDF coupon | **Implemented:** Meta + Evolution (buttons/lists); Waha CORE + **Baileys** + **WhatsMeow** default is **numbered text menu** |
| **2 — AI + memory** | LLM replies, simple history / DB | Documented only (not coded) |
| **3 — Tools + RAG** | Tool calling, retrieval, multi-step agents | Documented only (not coded) |
| **4 — Voice** | STT / TTS over WhatsApp | Documented only (not coded) |

## Folder map

```text
WhatsApp-agents/
├── README.md                 ← this catalog
├── docs/
│   └── anti-ban-strategy.md  ← humanization docs (Evolution + Waha + Baileys + WhatsMeow C runtime)
├── meta-cloud-api/           ← runnable Express + TypeScript (official API)
├── evolution-api/            ← runnable Express + TypeScript + Compose (unofficial)
├── waha/                     ← runnable Express + TypeScript + Compose (unofficial)
├── baileys/                  ← runnable Express + TypeScript + optional Compose (socket)
└── whatsmeow/                ← runnable Go module + optional Dockerfile (socket)
```

## Anti-ban / humanization

- **Meta Cloud API:** no delay/presence/queue runtime (official API).
- **Evolution Level 1:** implements humanization **C only** — presence (`composing`) + stochastic **20–45s** delay before each user-facing send. **No Redis / BullMQ**.
- **Waha Level 1:** implements humanization **C only** — presence (`startTyping`) + stochastic **20–45s** delay. **No Redis / BullMQ**.
- **Baileys Level 1:** implements humanization **C only** — `sendPresenceUpdate('composing')` + stochastic **20–45s** delay. **No Redis / BullMQ**.
- **WhatsMeow Level 1:** implements humanization **C only** — `SendPresence(composing)` + stochastic **20–45s** delay. **No Redis / BullMQ**. Details: [`docs/anti-ban-strategy.md`](./docs/anti-ban-strategy.md) and [`whatsmeow/README.md`](./whatsmeow/README.md).

## Getting started

- Meta: [`meta-cloud-api/README.md`](./meta-cloud-api/README.md)
- Evolution: [`evolution-api/README.md`](./evolution-api/README.md) (includes Docker Compose)
- Waha: [`waha/README.md`](./waha/README.md) (includes Docker Compose)
- Baileys: [`baileys/README.md`](./baileys/README.md) (socket + optional Compose wrapping Node only)
- WhatsMeow: [`whatsmeow/README.md`](./whatsmeow/README.md) (Go module + optional Dockerfile)
