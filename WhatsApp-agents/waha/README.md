# Waha — WhatsApp agent template (Level 1)

Runnable Node.js + Express + TypeScript sample bot using **[WAHA](https://waha.devlike.pro/)** (WhatsApp HTTP API) with Docker Compose and simple humanization (presence + delay).

Hub catalog: [`../README.md`](../README.md)  
OpenSpec: `openspec/changes/whatsapp-agents-waha/`

> **Disclaimer (educational):** Waha is an **unofficial** WhatsApp HTTP API / gateway. Using it may violate Meta Terms of Service and risk account bans. This template is for learning/demo only — not production compliance advice.

## Stack

- Node.js + Express + TypeScript
- Zod contracts at env / webhook / outbound boundaries
- Vitest unit tests (Waha HTTP mocked; humanize sleep injected)
- Clean Architecture folders under `src/`
- Docker Compose: Waha CORE + bot

| Layer | Path |
|---|---|
| Presentation | `src/presentation/` |
| Services | `src/services/` |
| Infrastructure | `src/infrastructure/` |
| Contracts | `src/contracts/` |

## Waha image / version

| Item | Value |
|---|---|
| Image | `devlikeapro/waha:latest` (CORE) |
| Docs | https://waha.devlike.pro/docs/overview/quick-start/ |
| Hub | https://hub.docker.com/r/devlikeapro/waha |

CORE is the public image. PLUS engines (GOWS / NOWEB) that support `sendList` are a **different** product image — not claimed in this Compose file.

## Waha HTTP paths (pinned)

Isolated in `src/infrastructure/wahaClient.ts`. If your Waha version uses different path names, change **only** that client.

| Action | Method + path | Notes |
|---|---|---|
| Text | `POST /api/sendText` | All engines |
| Buttons | `POST /api/sendButtons` | **Deprecated / fragile** on CORE |
| List | `POST /api/sendList` | GOWS / NOWEB PLUS — **not CORE** |
| Document | `POST /api/sendFile` | URL in `file.url` |
| Image | `POST /api/sendImage` | URL in `file.url` |
| Presence | `POST /api/startTyping` | Humanization C equivalent of typing |

Auth header: `X-Api-Key: <WAHA_API_KEY>`  
Body always includes `session` + `chatId` (`{phone}@c.us`).

## Buttons / list vs text fallback

Default `WAHA_MENU_MODE=text`: the demo sends a **numbered text menu** (reply `1` / `2` / `3` or keywords). This is the CORE-safe path.

Set `WAHA_MENU_MODE=list` or `buttons` only if your engine actually supports those endpoints. Waha documents list messages as fragile and buttons as deprecated.

## Humanization (C only)

Before each user-facing send:

1. Send presence via `startTyping`
2. Wait a stochastic delay **20–45 seconds** (in-process; **no Redis / BullMQ**)
3. Send the message

Tests inject `sleep` and/or set `HUMANIZE_MIN_MS=0` / `HUMANIZE_MAX_MS=0` so the suite does not wait wall-clock.

## Setup (local)

```bash
cd WhatsApp-agents/waha
cp .env.example .env
# fill WAHA_API_URL, WAHA_API_KEY, WAHA_SESSION
npm install
npm test
npm run dev
```

### Required env vars

| Variable | Purpose |
|---|---|
| `WAHA_API_URL` | Waha base URL (e.g. `http://localhost:3000` or Compose `http://waha:3000`) |
| `WAHA_API_KEY` | Must match Waha `WAHA_API_KEY` / dashboard API key |
| `WAHA_SESSION` | Session name created/connected in Waha (default `default`) |
| `PORT` | Bot listen port (default `3002`; Waha dashboard uses `3000`) |
| `COUPON_MEDIA_URL` | Public HTTPS URL for PDF/image coupon demo |
| `WAHA_MENU_MODE` | `text` (default fallback), `buttons`, or `list` |
| `HUMANIZE_MIN_MS` / `HUMANIZE_MAX_MS` | Delay range (default 20000–45000). `0`/`0` allowed only when `NODE_ENV` is not `production` (Vitest). Production parse rejects below 20000 / 45000. |
| `WAHA_WEBHOOK_SECRET` | Optional. When set, POST `/webhook` must send header `x-webhook-secret` matching this value or the bot returns 401/403 and does **not** call Waha send. |

Never commit real secrets. Only `.env.example` ships with placeholders.

## Docker Compose

Default `docker-compose.yml` is **slim**: CORE Waha + bot. No Redis. Sessions persist in volume `waha_sessions`. Live `compose up` is **unverified** in this change.

```bash
cp .env.example .env
# set WAHA_API_KEY; set WAHA_WEBHOOK_SECRET if you expose a public tunnel
# optional: WHATSAPP_HOOK_CUSTOM_HEADERS=x-webhook-secret:<same secret>

docker compose config
# docker compose up --build   # not claimed done
```

Services:

| Service | Role | Ports |
|---|---|---|
| `waha` | Unofficial Waha CORE (`devlikeapro/waha:latest`) | `3000` |
| `bot` | This Express Level 1 agent | `3002` |

After Waha is up:

1. Open dashboard at `http://localhost:3000` (default docs credentials may apply — rotate them)
2. Start/connect session named like `WAHA_SESSION` (QR scan is **manual**)
3. Global webhook is wired in Compose: `WHATSAPP_HOOK_URL=http://bot:3002/webhook`, events `message`
4. If `WAHA_WEBHOOK_SECRET` is set, configure `WHATSAPP_HOOK_CUSTOM_HEADERS=x-webhook-secret:<value>`

### Compose smoke checklist

- [ ] `docker compose config` validates
- [ ] Manual: `compose up --build` until Waha dashboard + bot `/health` (**not claimed done** in this repo pass)
- [ ] Waha UI reachable on `:3000` (manual)
- [ ] Bot `GET /health` → `{ ok: true }` (manual)
- [ ] Webhook inbound text (`menu`) → text fallback menu (after presence+delay; `fromMe: false` required)
- [ ] Keyword `coupon` → document media
- [ ] `npm test` green (host, without waiting 20–45s)

## Tunnel / webhook notes

A public tunnel **without** `WAHA_WEBHOOK_SECRET` is a **send-oracle**: anyone who can POST `/webhook` can trigger outbound Waha sends.

When the secret is set, missing header → **401**, mismatch → **403**.

Self / echo events: inbound is processed only if `payload.fromMe === false`. Omitted `fromMe` is skipped (conservative).

## Demo keywords

- `hi` / `hello` / `hola` / `menu` / `start` / `ayuda` → menu
- `coupon` / `cupon` / `pdf` / `promo` / `2` → coupon PDF
- `1` / `info` → info text
- `3` / `help` → help text
