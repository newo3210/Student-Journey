# WhatsApp Agents Hub

Parallel portfolio track for demonstrable WhatsApp agent templates. **Does not replace** the Academic Full Stack pack (`docs/ACADEMIC_PORTFOLIO.md`); it runs beside it for client/demo urgency.

OpenSpec changes: `openspec/changes/whatsapp-agents/`, `openspec/changes/whatsapp-agents-evolution/`.

## Engine comparison

| Engine | Official API? | Folder | Status |
|---|---|---|---|
| **Meta Cloud API** | Yes (WhatsApp Cloud API) | [`meta-cloud-api/`](./meta-cloud-api/) | **Implemented** (Level 1 MVP) |
| **Evolution API** | Unofficial gateway | [`evolution-api/`](./evolution-api/) | **Implemented** (Level 1 + humanization C) |
| Waha | Unofficial gateway | [`waha/`](./waha/) | Planned — stub only |
| Baileys | Unofficial (WhatsApp Web) | [`baileys/`](./baileys/) | Planned — stub only |
| WhatsMeow | Unofficial (Go multi-device) | [`whatsmeow/`](./whatsmeow/) | Planned — stub only |

**Engine order for follow-up changes:** Meta → Evolution → Waha → Baileys → WhatsMeow (one folder per change).

## Complexity levels (1–4)

| Level | Focus | Status |
|---|---|---|
| **1 — Menus & media** | Text reply, interactive buttons/lists, image/PDF coupon | **Implemented** in `meta-cloud-api/` and `evolution-api/` |
| **2 — AI + memory** | LLM replies, simple history / DB | Documented only (not coded) |
| **3 — Tools + RAG** | Tool calling, retrieval, multi-step agents | Documented only (not coded) |
| **4 — Voice** | STT / TTS over WhatsApp | Documented only (not coded) |

## Folder map

```text
WhatsApp-agents/
├── README.md                 ← this catalog
├── docs/
│   └── anti-ban-strategy.md  ← humanization docs (+ Evolution C runtime note)
├── meta-cloud-api/           ← runnable Express + TypeScript (official API)
├── evolution-api/            ← runnable Express + TypeScript + Compose (unofficial)
├── waha/                     ← stub
├── baileys/                  ← stub
└── whatsmeow/                ← stub
```

## Anti-ban / humanization

- **Meta Cloud API:** no delay/presence/queue runtime (official API).
- **Evolution Level 1:** implements humanization **C only** — presence (`composing`) + stochastic **20–45s** delay before each user-facing send. **No Redis / BullMQ** in this change. Details: [`docs/anti-ban-strategy.md`](./docs/anti-ban-strategy.md) and [`evolution-api/README.md`](./evolution-api/README.md).

## Getting started

- Meta: [`meta-cloud-api/README.md`](./meta-cloud-api/README.md)
- Evolution: [`evolution-api/README.md`](./evolution-api/README.md) (includes Docker Compose)
