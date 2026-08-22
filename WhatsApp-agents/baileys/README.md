# Baileys — WhatsApp agent template (Level 1)

Runnable Node.js + Express + TypeScript sample bot using **[Baileys](https://github.com/WhiskeySockets/Baileys)** (`@whiskeysockets/baileys`) as an **in-process WhatsApp Web socket**, not a REST gateway.

Hub catalog: [`../README.md`](../README.md)  
OpenSpec: `openspec/changes/whatsapp-agents-baileys/`

> **Disclaimer (educational):** Baileys is an **unofficial** WhatsApp Web multi-device library. Using it may violate Meta Terms of Service and risk account bans. This template is for learning/demo only — not production compliance advice. Native **buttons/lists are unstable**; the default menu is **numbered text**.

## Stack

- Node.js + Express + TypeScript
- Zod contracts at env / inbound / outbound boundaries
- Vitest unit tests (**fake socket adapter**; never a live WhatsApp session)
- HTTP `POST /webhook` **simulator** for inbound TDD (not the live WhatsApp path)
- Live socket: terminal QR + `messages.upsert` → demo handler
- Clean Architecture folders under `src/`
- Optional Docker Compose wrapping **this Node bot only** (interactive QR)

| Layer | Path |
|---|---|
| Presentation | `src/presentation/` (thin HTTP simulator) |
| Services | `src/services/` |
| Infrastructure | `src/infrastructure/` (Baileys adapter + live socket factory) |
| Contracts | `src/contracts/` |

## Baileys is a socket library

There is no Waha/Evolution-style HTTP API in front of WhatsApp. Outbound goes through `sock.sendPresenceUpdate` and `sock.sendMessage`. Tests inject a **fake** object with those methods.

Live pairing writes multi-file auth under `BAILEYS_AUTH_DIR` (default `./auth_info_baileys`, **gitignored**). On `connection.update` with `qr`, the process **prints an ASCII QR** (plus `BAILEYS_QR_PAYLOAD:…`) in this terminal — scan it with WhatsApp Linked Devices. After pairing, **inbound WhatsApp text** arrives via `messages.upsert` and uses the **same demo handler** as the HTTP simulator (`fromMe` skip + humanized send). `POST /webhook` stays a **simulator** for TDD (no live WhatsApp). CI must not call `createLiveBaileysSocket` / `makeWASocket`.

## Humanization (C only)

Before each user-facing send:

1. `sendPresenceUpdate('composing', jid)` via the adapter
2. Wait a stochastic delay **20–45 seconds** (in-process; **no Redis / BullMQ**)
3. `sendMessage`

Tests inject `sleep` and/or set `HUMANIZE_MIN_MS=0` / `HUMANIZE_MAX_MS=0` so the suite does not wait wall-clock.

## Buttons vs numbered text

Default `BAILEYS_MENU_MODE=text`: numbered menu (`1` / `2` / `3` or keywords). Optional `buttons` / `list` kinds exist in contracts but the adapter **falls back to text** because native templates churn.

## Setup (local)

```bash
cd WhatsApp-agents/baileys
cp .env.example .env
npm install
npm test
npm run dev
# scan the ASCII QR printed in this terminal; do not commit auth_info_baileys/
```

### Env vars

| Variable | Purpose |
|---|---|
| `BAILEYS_AUTH_DIR` | Multi-file auth folder (gitignored). Default `./auth_info_baileys` |
| `PORT` | HTTP listen port (default `3003`) for `/health` + `/webhook` simulator |
| `COUPON_MEDIA_URL` | Public HTTPS URL for PDF/image coupon demo |
| `BAILEYS_MENU_MODE` | `text` (default), `buttons`, or `list` (unstable) |
| `HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS` | Delay range (default 20000–45000). `0`/`0` allowed only when `NODE_ENV` is not `production`. Production parse rejects below 20000 / 45000. |
| `BAILEYS_WEBHOOK_SECRET` | Optional. When set, POST `/webhook` must send `x-webhook-secret` or the bot returns 401/403 and does **not** send. |

Never commit real secrets or session creds.

## Docker Compose (optional)

Wraps **only** the Node bot. Pairing is **interactive** (`stdin_open` / `tty`; watch logs for QR). Live `compose up` is **unverified**.

```bash
cp .env.example .env
docker compose config
# docker compose up --build   # not claimed done; attach logs to scan QR
```

Auth persists in volume `baileys_auth`.

## Simulator webhook vs live chat

| Path | Role |
|---|---|
| Live socket | Pairing QR in the terminal; inbound `messages.upsert` → `handleInboundWebhook` |
| `POST /webhook` | TDD / local forging **without** WhatsApp |

`POST /webhook` does **not** replace live inbound.

Example:

```json
{
  "event": "message",
  "payload": {
    "id": "sim-1",
    "from": "54911@s.whatsapp.net",
    "fromMe": false,
    "body": "menu"
  }
}
```

Self / echo: processed only if `fromMe === false`. Omitted `fromMe` is skipped.

A public tunnel **without** `BAILEYS_WEBHOOK_SECRET` is a **send-oracle**.

## Demo keywords

- `hi` / `hello` / `hola` / `menu` / `start` / `ayuda` → numbered text menu
- `coupon` / `cupon` / `pdf` / `promo` / `2` → coupon PDF
- `1` / `info` → info text
- `3` / `help` → help text

## Defense bullets (oral)

- Socket library vs REST gateway: tests inject the adapter; CI never pairs QR
- HTTP `/webhook` is a simulator, not Meta Cloud API
- Humanization C without Redis
- Default numbered text because Baileys buttons are unstable
- Auth folder gitignored
