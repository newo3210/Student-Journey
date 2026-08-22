# WhatsApp Agents Hub

Parallel portfolio track for demonstrable WhatsApp agent templates. **Does not replace** the Academic Full Stack pack (`docs/ACADEMIC_PORTFOLIO.md`); it runs beside it for client/demo urgency.

OpenSpec change: `openspec/changes/whatsapp-agents/`.

## Engine comparison

| Engine | Official API? | Folder | Status in this change |
|---|---|---|---|
| **Meta Cloud API** | Yes (WhatsApp Cloud API) | [`meta-cloud-api/`](./meta-cloud-api/) | **Implemented** (Level 1 MVP) |
| Evolution API | Unofficial gateway | [`evolution-api/`](./evolution-api/) | Planned — stub only |
| Waha | Unofficial gateway | [`waha/`](./waha/) | Planned — stub only |
| Baileys | Unofficial (WhatsApp Web) | [`baileys/`](./baileys/) | Planned — stub only |
| WhatsMeow | Unofficial (Go multi-device) | [`whatsmeow/`](./whatsmeow/) | Planned — stub only |

**Engine order for follow-up changes:** Meta → Evolution → Waha → Baileys → WhatsMeow (one folder per change).

## Complexity levels (1–4)

| Level | Focus | Meta template status |
|---|---|---|
| **1 — Menus & media** | Text reply, interactive buttons/lists, image/PDF coupon | **Implemented** in `meta-cloud-api/` |
| **2 — AI + memory** | LLM replies, simple history / DB | Documented only (not coded) |
| **3 — Tools + RAG** | Tool calling, retrieval, multi-step agents | Documented only (not coded) |
| **4 — Voice** | STT / TTS over WhatsApp | Documented only (not coded) |

## Folder map

```text
WhatsApp-agents/
├── README.md                 ← this catalog
├── docs/
│   └── anti-ban-strategy.md  ← documentation only (no runtime)
├── meta-cloud-api/           ← runnable Express + TypeScript template
├── evolution-api/            ← stub
├── waha/                     ← stub
├── baileys/                  ← stub
└── whatsmeow/                ← stub
```

## Anti-ban strategy

Humanization (presence, 20–45s jitter, per-recipient queues) is described in [`docs/anti-ban-strategy.md`](./docs/anti-ban-strategy.md) for **future unofficial engines**. The Meta Cloud API template does **not** ship delay/presence/queue runtime code — official API does not require session humanization.

## Getting started (Meta)

See [`meta-cloud-api/README.md`](./meta-cloud-api/README.md) for env vars, HTTPS tunnel, and the demo keyword flow.
