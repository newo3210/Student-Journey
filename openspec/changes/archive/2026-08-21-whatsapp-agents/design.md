## Context

Student Journey is a portfolio hub. Academic track continues separately. This change opens a **parallel WhatsApp Agents** track under `WhatsApp-agents/`, based on a technical research guide comparing Evolution API, Waha, Baileys, WhatsMeow, and Meta Cloud API across four complexity levels.

First implementation engine: **Meta Cloud API** (official, zero unofficial anti-ban requirement). Other engines get placeholder folders and catalog entries only.

## Goals / Non-Goals

**Goals:**

- Hub folder with clear catalog of engines and levels 1–4
- Document anti-ban humanization strategy **without implementing** delays/presence/queues
- Runnable Meta Cloud API template with: webhook verify + inbound text handling, outbound text, interactive buttons/lists, outbound document/image (coupon/PDF use case), defense README
- Clean Architecture paths declared and used in the Meta template
- Root architecture + decision-log updates

**Non-Goals:**

- Implementing Evolution / Waha / Baileys / WhatsMeow bots in this change
- Anti-ban stochastic delays, `composing`/`recording` presence, BullMQ/Redis
- Level 4 voice (STT/TTS) runtime
- LLM/RAG agents inside the first Meta template (Level 2+ can be profiled only)
- Production hardening beyond a local/demo webhook server

## Decisions

1. **Hub path `WhatsApp-agents/`** at monorepo root — user-requested product name; each engine is a sibling folder.
2. **Engine order:** Meta Cloud API → Evolution API → Waha → Baileys → WhatsMeow (one change/folder at a time after this).
3. **Meta stack:** Node.js + Express + TypeScript + Zod — aligns with Student Journey backend standards; easy webhook demo.
4. **Official API first** — Meta Cloud API avoids unofficial session risk; anti-ban module stays docs-only for unofficial engines later.
5. **Levels in catalog, not all coded:** Level 1 behaviors (menus/text/media) implemented in Meta template; Levels 2–4 described in hub README only.
6. **Secrets:** `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` (optional signature) via `.env.example`; never commit real values.
7. **Media:** send via Meta media upload or public HTTPS URL as documented; coupon demo can be a sample PDF/image under `fixtures/` or URL placeholder.
8. **Tests (TDD):** unit tests for webhook verification challenge, payload parsing, and outbound payload builders (mocked HTTP to Meta Graph API).
9. **Webhook signature (post-adversarial):** when `WHATSAPP_APP_SECRET` is set, validate `X-Hub-Signature-256` over the raw POST body before processing; README must warn that public tunnels without the secret are unsafe.
10. **Graph failure honesty:** non-2xx Graph responses are logged and not counted as successful sends; architecture docs must not claim logging that does not exist.

## Conceptual layer mapping

| Conceptual layer | Paths in this change | Notes |
|---|---|---|
| Presentation / HTTP thin | `WhatsApp-agents/meta-cloud-api/src/presentation/` | Express routes: webhook GET/POST only; validate + call services |
| Application / services | `WhatsApp-agents/meta-cloud-api/src/services/` | Reply orchestration, interactive builders, media send use-cases |
| Infrastructure / repositories | `WhatsApp-agents/meta-cloud-api/src/infrastructure/` | Meta Graph API HTTP client; optional file fixture loader |
| Contracts / schemas | `WhatsApp-agents/meta-cloud-api/src/contracts/` | Zod for webhook payloads and outbound message shapes |
| Catalog / pedagogy | `WhatsApp-agents/README.md`, `WhatsApp-agents/docs/` | Engine matrix, levels, anti-ban strategy (no runtime) |
| Engine placeholders | `WhatsApp-agents/evolution-api/`, `waha/`, `baileys/`, `whatsmeow/` | README stub “planned — not implemented” |

## Schema contracts

- **Webhook verify (GET):** `hub.mode`, `hub.verify_token`, `hub.challenge` — return challenge when token matches
- **Inbound webhook (POST):** Zod-parsed Meta change payload; extract `from`, `messageId`, `type`, text body or interactive reply id
- **Outbound text:** `{ to, body }` → Graph API `messages` text type
- **Outbound interactive:** button or list reply payloads per Meta Cloud API shape
- **Outbound media:** `{ to, type: 'image' \| 'document', link or mediaId, caption?, filename? }` for image/PDF coupon demos
- **Env config schema:** required tokens/ids validated at startup

## Risks / Trade-offs

- **Meta requires public HTTPS webhook** — local demo needs ngrok/cloudflare tunnel; document in README
- **Parallel to Academic** — risk of focus split; accepted by user for demo urgency
- **Unofficial engines later** — anti-ban docs may be misread as production advice; README must label educational / risk disclaimer
- **Graph API version pinning** — pin a documented API version in config to avoid silent breakage
