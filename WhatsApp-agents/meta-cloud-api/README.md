# Meta Cloud API — WhatsApp agent template (Level 1)

Runnable Node.js + Express + TypeScript sample bot using the **official** WhatsApp Cloud API (Graph API pinned to `v21.0` by default).

Hub catalog: [`../README.md`](../README.md)  
OpenSpec: `openspec/changes/whatsapp-agents/`

## Stack

- Node.js + Express + TypeScript
- Zod contracts at env / webhook / outbound boundaries
- Vitest unit tests (Graph HTTP mocked)
- Clean Architecture folders under `src/`

| Layer | Path |
|---|---|
| Presentation | `src/presentation/` |
| Services | `src/services/` |
| Infrastructure | `src/infrastructure/` |
| Contracts | `src/contracts/` |

## Setup

```bash
cd WhatsApp-agents/meta-cloud-api
cp .env.example .env
# fill WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN
npm install
npm test
npm run dev
```

### Required env vars

| Variable | Purpose |
|---|---|
| `WHATSAPP_TOKEN` | Graph API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Cloud API phone number id |
| `WHATSAPP_VERIFY_TOKEN` | Shared secret for GET webhook verify |
| `WHATSAPP_APP_SECRET` | **Recommended for tunnels.** When set, validates `X-Hub-Signature-256` (HMAC-SHA256 of raw body). Omit only for local unsigned demos |
| `META_GRAPH_API_VERSION` | Default `v21.0` |
| `COUPON_MEDIA_URL` | Public HTTPS URL for PDF/image coupon demo |
| `PORT` | Default `3000` |

Never commit real secrets. Only `.env.example` ships with placeholders.

> **Security warning:** Exposing the webhook on a **public** tunnel (ngrok, Cloudflare, etc.) **without** `WHATSAPP_APP_SECRET` is **unsafe**. Anyone who discovers the URL can forge inbound POSTs and drive outbound Graph sends (menu / coupon / spam) using your access token. Set the app secret from Meta Developer Console and keep signature validation enabled for any publicly reachable demo.

## Expose the webhook (HTTPS tunnel)

Meta requires a **public HTTPS** callback:

1. Set `WHATSAPP_APP_SECRET` in `.env` (Meta App → App settings → Basic → App secret)
2. Start the server (`npm run dev`) → `http://localhost:3000/webhook`
3. Tunnel with ngrok / Cloudflare Tunnel, e.g. `ngrok http 3000`
4. In Meta Developer Console → WhatsApp → Configuration → Webhook:
   - Callback URL: `https://<tunnel>/webhook`
   - Verify token: same as `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to `messages`

Do **not** skip step 1 on a public tunnel — unsigned webhooks allow forged inbound and Graph token abuse.

## Demo flow (keywords)

| User sends | Bot responds |
|---|---|
| `hi` / `hello` / `hola` / `menu` / `start` / `ayuda` | Interactive **buttons** menu (Info / Coupon PDF / Help) |
| `coupon` / `cupon` / `pdf` / `promo` | Document (PDF) media with caption |
| Button **Info** | Deterministic text about Level 1 demo |
| Button **Coupon PDF** | Short text + PDF document |
| Button **Help** | Keyword cheat-sheet |
| Any other text | Echo + hint to send `menu` or `coupon` |

## Manual checklist

- [ ] GET verify challenge succeeds in Meta console
- [ ] Inbound text (`menu`) → interactive buttons
- [ ] Interactive button → text / media follow-up
- [ ] Keyword `coupon` → document send
- [ ] Unit tests green: `npm test`

## Defense bullets (oral)

- **Why Meta first:** official Cloud API — no unofficial session / anti-ban runtime needed for demos
- **Layering:** routes only validate + call services; Graph HTTP lives in `infrastructure/`
- **Contracts:** Zod for env, inbound webhook, and outbound builders
- **Anti-ban:** documented under hub `docs/anti-ban-strategy.md` for future unofficial engines — **not** executed here
- **TDD:** verify-token, signature HMAC, payload builders, Graph non-2xx, and inbound handler covered with mocked Graph API
- **Signature:** set `WHATSAPP_APP_SECRET` on public tunnels; unsigned mode is local-demo only

## Non-goals

- Evolution / Waha / Baileys / WhatsMeow (stubs only in sibling folders)
- Stochastic delays, presence, BullMQ queues
- LLM / RAG / Level 4 voice
