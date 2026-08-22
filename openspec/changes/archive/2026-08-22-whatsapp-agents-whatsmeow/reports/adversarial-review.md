# Adversarial review — whatsapp-agents-whatsmeow

**Scope:** OpenSpec change `whatsapp-agents-whatsmeow`  
**Worktree:** `.worktrees/whatsapp-agents-whatsmeow`  
**Reviewer:** independent session (did not implement this change)  
**Date:** 2026-08-22  
**Sources:** `proposal.md`, `design.md`, `tasks.md`, `specs/whatsmeow-agent-template/spec.md`, `specs/whatsapp-agents-catalog/spec.md`, `reports/verify-report.md`, `reports/acceptance-matrix.md`, implementation under `WhatsApp-agents/whatsmeow/`, hub `WhatsApp-agents/README.md`, `ARCHITECTURE_SDD.md`

## Spec and task alignment

**Must be true for “done” (from proposal/spec):**

- Runnable Go Level 1 bot: HTTP simulator **and/or** live event adapter; injectable client; replies via adapter.
- Live path SHALL surface pairing QR and route inbound user text to the same demo handler (unit tests may use fakes; CI must not connect).
- Humanization C: composing then 20–45s; no Redis/BullMQ; tests inject sleep / 0 delay.
- Simulator secret: when set, mismatch → 401/403 and no send; skip `fromMe` true or omitted.
- Production env rejects zero delay floor.
- Hub: all five engines Implemented; no remaining stubs.

**Non-goals:** Redis/BullMQ; rewriting other engines; Level 2–4; live QR in CI.

**Tasks:** all `[x]`, including 3.2 live QR + inbound wiring and 4.1 hub complete.

**Underspecified:** whether default `go run` (no build tags) must pair; whether live outbound must use the real WhatsMeow client vs a fake; whether webhook secret is required in Docker/production.

**Author verify artifacts:** mechanical PASS with WARNING that live library is behind `-tags live`. Acceptance matrix 12/12 including “QR is surfaced” and “Reader finds WhatsMeow implemented” — both proven only by fakes + README text, not by a default binary that can pair or send on WhatsApp.

## Adversarial pass (refute)

### Live QR / pairing (spec: Live QR and inbound events)

**Failure mode while author believed it passed:** tests emit `"qr"` on `LiveEventSock` and assert a print callback. Default `go run ./cmd/whatsmeow-agent` never compiles `live_whatsmeow.go` (`//go:build live`). `StartLiveSession` logs that the library is not linked and waits on cancel — **no QR, no Connect, no GetQRChannel**.

README documents `-tags live` and a separate `go get`. `go.mod` has **no** `require` for `go.mau.fi/whatsmeow` or sqlite. Even `go run -tags live` does not build until those modules are fetched; they are not part of the checked-in module graph.

Dockerfile: `go build` **without** `-tags live`. Image cannot pair. `ARCHITECTURE_SDD.md` §2.6 / §4.6 still describe interactive QR for the Docker binary.

### Live inbound + outbound (spec: inbound drives demo; reply through client)

**Failure mode:** `WireLiveEvents` + fake `Emit("message")` invoke `HandleInboundWebhook` in tests. In `cmd/whatsmeow-agent/main.go` the `Client` is **always** `AdapterClient{Sock: &FakeSocket{}}`. Live inbound (if it ever fired) would “send” into an in-memory fake, not WhatsApp.

`bindLiveSend` in `live_whatsmeow.go` is a no-op (`_ = client; _ = sock`). Real Message events can be mapped to the sock, but **presence/text/media never bind** to `whatsmeow.Client`. Live path is inbound-listen-only (and only with `-tags live`), not a runnable Level 1 bot on the socket.

### Catalog “all five Implemented”

Hub README, proposal, tasks 4.1, catalog spec, `ARCHITECTURE_SDD.md` §1 claim WhatsMeow Implemented at Level 1 and catalog complete. Default binary is an HTTP simulator + stub live session. That is **not** equivalent to Baileys-style live QR in default `npm run`/`go run`. Overclaim vs runnable engine.

### Unsigned webhook

Spec only requires reject **when secret is set**. Code matches: empty `WHATSMEOW_WEBHOOK_SECRET` → any POSTer can forge inbound and trigger humanized sends (send-oracle). `.env.example` leaves secret empty. Production Dockerfile sets `GO_ENV=production` (delay floor) but **does not** set a webhook secret. Documented in README; still a default-open simulator on `:3004`.

### Delay bypass

Production parse rejects min &lt; 20000 / max &lt; 45000 when `GO_ENV`/`NODE_ENV` is `production` — tests cover this. Bypass: any non-production env (`.env.example` uses `GO_ENV=development`) may set `HUMANIZE_MIN_MS=0`; `defaultSleep` returns immediately when `ms <= 0`. Spec explicitly allows 0 in tests. Not a production-floor bug; local/Docker-without-GO_ENV could skip delay. Docker does set production.

`main.go` does not inject `Sleep`; HTTP/live handlers use `defaultSleep` — good for prod delays. Live inbound handler in `main` also omits `Sleep` (same wall-clock path).

### Redis

No Redis/BullMQ in Go module, humanized dispatch, or Dockerfile. Anti-ban doc states No. Hunt item **does not reproduce**.

### Tests hitting network

Tests use `httptest`, fakes, and `RecordingClient`. Coupon URLs are recorded, not fetched. `go.mau.fi/whatsmeow` is not imported in default `go test`. Hunt item **does not reproduce**. `TestLiveWhatsmeowFileNotCompiledInDefaultTests` only greps source for `//go:build live` / `GetQRChannel` — does not compile `-tags live`.

### fromMe

`ExtractInboundEvent` skips `fromMe == nil` or true. `WireLiveEvents` skips before mapping. Tests cover HTTP omitted fromMe, extractor, and live skip. **Holds** for simulator/fake path.

### HTTP secret when set

Constant-time compare; 401 missing / 403 mismatch; tests assert no send. **Holds** when secret is configured.

## Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Blocker | Live pairing | Default `go run` cannot pair: live client is build-tagged out; `StartLiveSession` only logs and waits. Spec live QR is not met for the documented default setup command. | `live_whatsmeow.go` `//go:build live`; `live_session.go` `LiveLibraryStart == nil`; README `go run ./cmd/whatsmeow-agent` without tags | **Code:** link QR in the default binary *or* make default README/tasks fail closed until `-tags live` is the only documented run. **Tests:** compile/smoke `-tags live` without Connect. **Spec:** if tagged-out is intentional, change SHALL so default run is simulator-only (today it is not). |
| Blocker | Live outbound | Even `-tags live` cannot send on WhatsApp: process client is `FakeSocket`; `bindLiveSend` is empty. Live inbound would not produce real replies. | `cmd/whatsmeow-agent/main.go` `fake := &infrastructure.FakeSocket{}`; `live_whatsmeow.go` `bindLiveSend` no-op | **Code:** implement SocketLike on the live client; wire `main` to that adapter when live is linked. **Tests:** fake still for `go test`; contract test that live adapter methods are assigned. |
| Blocker | Module / Docker | `go.mod` has no whatsmeow deps; Docker `go build` omits `-tags live` while architecture claims interactive QR for that binary. | `go.mod` (module only); `Dockerfile` `go build -o ... ./cmd/whatsmeow-agent`; `ARCHITECTURE_SDD.md` §2.6 Ops / §4.6 | **Code:** `go get` into `go.mod`/`go.sum` for live tag; Dockerfile `-tags live` *or* stop claiming QR in Docker/docs. **OpenSpec/docs:** align ARCHITECTURE with tagged-out default. |
| Blocker | Catalog | Hub + architecture claim all five engines Implemented / catalog complete while WhatsMeow live path is incomplete. Acceptance matrix 12/12 rubber-stamps README + fakes. | `WhatsApp-agents/README.md` WhatsMeow Implemented; `acceptance-matrix.md`; catalog spec scenario | **OpenSpec + hub:** status “Implemented (simulator only)” or keep stub until live send+QR work. **Do not archive** as catalog-complete. |
| Major | HTTP auth | Unsigned webhook is the default: empty secret = forge inbound → send (to fake in default binary; to WA if live send is ever wired). Production image does not set secret. | `.env.example` `WHATSMEOW_WEBHOOK_SECRET=`; `http.go` skip check when empty; `Dockerfile` `GO_ENV=production` only | **Code:** require secret when exposing HTTP, or bind simulator to localhost. **Spec:** if optional is OK, say Docker must not publish `/webhook` without secret. |
| Minor | Delay | Zero delay allowed whenever env is not `production`; `defaultSleep(0)` is a no-op. | `env.go` floor only if `goEnv == "production"`; `sleep.go` `ms <= 0` | **Spec/docs:** already allowed for tests. Optional: treat unset GO_ENV as production for the floor. |
| Minor | Verify evidence | `go test` does not compile live tag; matrix treats fake QR as the live scenario. | `verify-report.md` WARNING; `wire_live_test.go`; `client_test.go` file grep | **Tests:** `go test -tags live` that must fail to compile until deps exist, then unit-test without Connect. |
| Question | Intent | Was tagged-out live + FakeSocket in `main` a deliberate CI isolation, or an unfinished apply? | `verify-report.md` CRITICAL: none vs this review | Human/author confirmation before re-apply. |

**Redis:** no finding. **Network in tests:** no finding. **fromMe skip / secret-when-set / production delay floor / humanization order / numbered menu / coupon via fake adapter:** hold on the simulator/fake path only.

## Verdict

**FAIL**

Archive is **not advisable**. Blockers: default binary cannot pair; live send is not wired; catalog/Implemented claim is false relative to a runnable WhatsMeow socket bot; Docker/module graph cannot deliver the live library as documented.

## Recommended next steps (before archive)

1. Do **not** `/opsx:archive` this change.
2. Fix live adapter + `main` wiring (or revert hub to non-Implemented) in a **new apply** after spec/tasks update — not a mid-flight patch on this branch if SDD mid-flight rules apply.
3. Put whatsmeow (+ sqlite) in `go.mod` if `-tags live` remains; document a single supported `go run` path.
4. Align Dockerfile with that path or drop QR claims.
5. Re-run independent adversarial review after code+spec match.
6. Keep webhook secret empty only if the HTTP port is not a public send-oracle once live send exists.

Mechanical `go test ./...` green does **not** refute the live-path blockers.
