# Adversarial re-audit — whatsapp-agents-whatsmeow

**Scope:** OpenSpec change `whatsapp-agents-whatsmeow` (post §6 fixes)  
**Worktree:** `.worktrees/whatsapp-agents-whatsmeow`  
**Reviewer:** independent session (did not implement original change or §6)  
**Date:** 2026-08-22  
**Prior report:** `reports/adversarial-review.md` (**FAIL** — left unchanged)  
**Sources:** updated `specs/whatsmeow-agent-template/spec.md` (default binary + production secret), `specs/whatsapp-agents-catalog/spec.md`, `tasks.md` §6, `proposal.md`, `design.md`, `go.mod`/`go.sum`, `cmd/whatsmeow-agent/main.go`, `internal/infrastructure/live_whatsmeow.go`, `live_send_bridge.go`, `live_session.go`, `internal/contracts/env.go`, `Dockerfile`, `WhatsApp-agents/whatsmeow/README.md`, hub `WhatsApp-agents/README.md`, `ARCHITECTURE_SDD.md` §2.6 / §3.6 / §4.6

## Spec and task alignment

**Must be true after §6:**

1. Default `go run` / `go build` (no `//go:build live`) links WhatsMeow, can pair (QR), routes live inbound to the demo handler.
2. Live send/presence/media bound to the real client, not `FakeSocket`.
3. `go.mod` requires `go.mau.fi/whatsmeow`; Dockerfile builds that default binary.
4. Hub **Implemented** is honest if 1–3 hold.
5. Production (`GO_ENV`/`NODE_ENV=production`) rejects empty `WHATSMEOW_WEBHOOK_SECRET`.

**Non-goals (design):** Redis/BullMQ; other engines; Level 2–4; **live QR scanned in CI**.

**Tasks §6:** all `[x]` (6.1–6.5).

## Prior findings — close-out

| Prior | Status | Evidence |
|-------|--------|----------|
| Blocker: default binary cannot pair (`//go:build live`, `LiveLibraryStart == nil`) | **Closed** | `live_whatsmeow.go` has no build tag; `init` sets `LiveLibraryStart = startWhatsmeowLibrary`; `startWhatsmeowLibrary` calls `GetQRChannel` + `Connect` + `EmitQRFromChannel`. `TestDefaultBuildIncludesLiveWhatsmeowWithoutConnect` asserts no `//go:build live` and `LiveLibraryStart != nil`. Default `go test` compiles this file (package `ok`). |
| Blocker: live send uses `FakeSocket`; `bindLiveSend` no-op | **Closed** | `main.go` uses `LiveSendBridge` + `AdapterClient{Sock: send}`; `sock.SendBind = send.Bind`. `bindLiveSend` constructs `WhatsMeowSocket{Client: client}` and calls `SendBind`. `WhatsMeowSocket` implements `SendChatPresence` / `SendMessage` / `Upload`. `FakeSocket` remains test-only (`fake_socket.go`, `client_test.go`). |
| Blocker: `go.mod` / Docker omit live library | **Closed** | `go.mod` `require go.mau.fi/whatsmeow`; `go.sum` hashes that module. Dockerfile `go build -o /out/whatsmeow-agent ./cmd/whatsmeow-agent` (no extra tags); comment and README/ARCHITECTURE match live-capable binary. |
| Blocker: catalog Implemented overclaim | **Closed** | Given 1–3, hub row Implemented + `whatsmeow/` is consistent with a default runnable socket bot (QR interactive, not CI). |
| Major: production image / env no webhook secret | **Closed** | `ParseEnv` fails when `goEnv == "production"` and secret empty. Tests: `TestParseEnvProductionRejectsEmptyWebhookSecret`, `TestParseEnvProductionAcceptsSecret`. Dockerfile `ENV GO_ENV=production`; README Docker **must** pass `WHATSMEOW_WEBHOOK_SECRET`. Image does not start as an unsigned send-oracle. |
| Minor: zero delay outside production | **Still true, low risk** | Spec allows 0 in tests; `GO_ENV=development` in `.env.example`. |
| Minor: `go test` did not compile live tag | **Closed** | Live sources are in the default test compile graph. |
| Residual: live QR not in CI | **Accepted non-goal** | Design non-goal; README: scan locally. |
| Residual: unsigned webhook in development | **Documented** | Spec requires secret **in production**. README `.env.example` empty secret + send-oracle warning; ARCHITECTURE §3.6 / §4.6. |

## Adversarial pass (this round)

### Default pair path

`StartLiveSession` still has a nil-library wait branch, but production `init` in `live_whatsmeow.go` assigns the starter before `main`. Default tests prove the assignment without calling `Connect`. CI still does not scan QR — **not a spec violation**.

### Live outbound composition

HTTP simulator and live inbound share `LiveSendBridge`. After `bindLiveSend`, a forged `POST /webhook` in **development** (empty secret) can drive **real** WhatsApp sends. That is the documented send-oracle. Production parse refuses empty secret, so the Docker default env cannot boot without a secret. Race before bind: simulator send returns adapter error `"whatsmeow send not bound yet"` — fail-closed, not silent fake success.

### Module graph / Docker

`CGO_ENABLED=0` + `modernc.org/sqlite` is consistent with a static image. Pairing remains interactive (`-it`); not claimed as headless CI.

### Catalog

Five-engine Implemented holds relative to a default binary that links WhatsMeow and binds send to `whatsmeow.Client`.

### Production secret

`NODE_ENV=production` uses the same `goEnv` path as `GO_ENV`. Delay-floor tests still fail closed on 0/0 in production.

### Tests vs live

`go test ./...` (2026-08-22, this review): contracts / infrastructure / presentation / services **ok**; no `cmd` tests. Suite does not call `StartLiveSession` / `Connect`. Mechanical green still does not prove a human scanned QR — tracked as residual Minor.

## Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Minor | Live / CI | Pairing QR is not scanned or asserted in CI (expected). | Design non-goal; tests never `Connect()`. | **None for archive.** Optional local smoke after `go run`. |
| Minor | HTTP auth | Development allows empty `WHATSMEOW_WEBHOOK_SECRET`; after live bind, `/webhook` is a real send-oracle. | Spec: secret required only in production. README + `.env.example` document unsigned simulator. | **Docs already.** Do not tunnel `:3004` without a secret once paired. |
| Minor | Delay | Zero delay still allowed when env is not `production`. | `env.go`; `TestParseEnvTestAllowsZeroDelay` | Spec-allowed for tests. |
| Question | Ops | Docker `CMD` has no secret; container exits until `-e WHATSMEOW_WEBHOOK_SECRET` is set. | Dockerfile `GO_ENV=production` + parse fail-closed | Intended. Operators must pass the env (README). |

**Redis:** no finding. **Network in `go test`:** no finding (fakes / recording client). **fromMe skip / secret-when-set / production delay floor / humanization order:** hold. **Prior blockers and production-secret Major:** do not reproduce.

## Verdict

**PASS WITH GAPS**

Archive is **advisable** from an adversarial standpoint if the human accepts the tracked residuals (no live QR in CI; unsigned webhook only in non-production, documented). No remaining blockers or majors vs the updated spec and §6 close-out.

## Recommended next steps (before archive)

1. Human OK on residuals (QR interactive only; never expose development `/webhook` after pairing without a secret).
2. Keep `reports/adversarial-review.md` as the historical FAIL; this file is the re-audit.
3. Mechanical `/opsx:verify` remains complementary, not a substitute for this pass.
4. Independent archive gate still needs `acceptance-matrix.md` + human OK per project SDD rules.
