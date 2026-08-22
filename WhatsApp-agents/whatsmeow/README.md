# WhatsMeow — WhatsApp agent template (Level 1)

Runnable **Go** sample bot using **[whatsmeow](https://github.com/tulir/whatsmeow)** as an **in-process multi-device client**, not a REST gateway.

Hub catalog: [`../README.md`](../README.md)  
OpenSpec: `openspec/changes/whatsapp-agents-whatsmeow/`

> **Disclaimer (educational):** WhatsMeow is an **unofficial** WhatsApp multi-device library. Using it may violate Meta Terms of Service and risk account bans. This template is for learning/demo only — not production compliance advice. Native **buttons/lists are unstable**; the default menu is **numbered text**.

## Stack

- Go module `whatsmeow-agent` + stdlib `net/http`
- Env / inbound / outbound contracts with tests
- Unit tests inject a **fake client**; they never connect to WhatsApp or require a device
- HTTP `POST /webhook` **simulator** for inbound TDD
- Live path: print pairing QR; inbound text events → the same demo handler as HTTP
- Clean Architecture folders under `internal/`
- Optional Dockerfile wrapping the Go binary

| Layer | Path |
|---|---|
| Presentation | `internal/presentation/` (thin HTTP simulator) |
| Services | `internal/services/` |
| Infrastructure | `internal/infrastructure/` (injectable client + live event wiring) |
| Contracts | `internal/contracts/` |
| Entrypoint | `cmd/whatsmeow-agent/` |

## WhatsMeow is a socket library

There is no Waha/Evolution-style HTTP API in front of WhatsApp. Outbound goes through an injectable `Client` (`SendPresence`, `SendMessage`). Tests inject a **fake** (`FakeSocket` / `RecordingClient`) and **never** call `Connect()`.

The default `go run` / `go build` (no extra tags) **links** `go.mau.fi/whatsmeow`. Live pairing store: `WHATSMEOW_STORE_DIR` (default `./whatsmeow_store`, **gitignored**). QR codes are printed as `WHATSMEOW_QR_PAYLOAD:…`. After pairing, inbound user text uses the **same demo handler** as the HTTP simulator (`fromMe` skip + humanized send through the **real** client). `POST /webhook` stays a **simulator** for TDD.

```bash
cd WhatsApp-agents/whatsmeow
cp .env.example .env
go test ./...
go run ./cmd/whatsmeow-agent
# scan the printed QR with WhatsApp → Linked devices
# do not commit whatsmeow_store/
```

## Humanization (C only)

Before each user-facing send:

1. `SendPresence(to, "composing")` via the adapter
2. Wait a stochastic delay **20–45 seconds** (in-process; **no Redis / BullMQ**)
3. `SendMessage`

Tests inject `Sleep` and/or set `HUMANIZE_MIN_MS=0` / `HUMANIZE_MAX_MS=0` so the suite does not wait wall-clock.

## Setup (local)

```bash
cd WhatsApp-agents/whatsmeow
cp .env.example .env
go test ./...
go run ./cmd/whatsmeow-agent
# do not commit whatsmeow_store/
```

### Env vars

| Variable | Purpose |
|---|---|
| `WHATSMEOW_STORE_DIR` | Session/store folder (gitignored). Default `./whatsmeow_store` |
| `PORT` | HTTP listen port (default `3004`) for `/health` + `/webhook` simulator |
| `COUPON_MEDIA_URL` | Public HTTPS URL for PDF/image coupon demo |
| `WHATSMEOW_MENU_MODE` | `text` (default), `buttons`, or `list` (adapter text fallback) |
| `HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS` | Delay range (default 20000–45000). `0`/`0` allowed only when `GO_ENV`/`NODE_ENV` is not `production`. Production parse rejects below 20000 / 45000. |
| `WHATSMEOW_WEBHOOK_SECRET` | Required when `GO_ENV`/`NODE_ENV` is `production`. When set, POST `/webhook` must send `x-webhook-secret` or the bot returns 401/403 and does **not** send. |

Never commit real secrets or session files.

## Docker (optional)

Wraps **this** Go binary (live-capable; no extra `-tags`). Pairing is **interactive**. Production image sets `GO_ENV=production`, so you **must** pass `WHATSMEOW_WEBHOOK_SECRET`.

```bash
docker build -t whatsmeow-agent .
docker run --rm -it -p 3004:3004 \
  -e WHATSMEOW_WEBHOOK_SECRET=change-me \
  -v whatsmeow_store:/app/whatsmeow_store \
  whatsmeow-agent
```

## Simulator webhook vs live chat

| Path | Role |
|---|---|
| Live events | Pairing QR in the terminal; inbound text → `HandleInboundWebhook` |
| `POST /webhook` | TDD / local forging **without** WhatsApp |

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

A public tunnel **without** `WHATSMEOW_WEBHOOK_SECRET` is a **send-oracle**.

## Demo keywords

- `hi` / `hello` / `hola` / `menu` / `start` / `ayuda` → numbered text menu
- `coupon` / `cupon` / `pdf` / `promo` / `2` → coupon PDF
- `1` / `info` → info text
- `3` / `help` → help text

## Defense bullets (oral)

- Socket library vs REST gateway: tests inject the adapter; CI never pairs QR
- HTTP `/webhook` is a simulator, not Meta Cloud API
- Humanization C without Redis
- Default numbered text
- Session store gitignored
