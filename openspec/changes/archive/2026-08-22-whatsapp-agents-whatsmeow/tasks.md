## 1. Scaffold

- [x] 1.1 Go module under `WhatsApp-agents/whatsmeow/` with layered packages
- [x] 1.2 Env example, gitignore session store, README (QR, disclaimer, defense)
- [x] 1.3 Optional Dockerfile for the Go binary

## 2. Domain (TDD)

- [x] 2.1 Env validation + inbound/outbound contracts with tests first
- [x] 2.2 Injectable client (presence, text, media); tests never open WhatsApp
- [x] 2.3 Humanized dispatch with injectable sleep
- [x] 2.4 HTTP simulator secret; fromMe skip; production delay floor

## 3. Demo + live wiring

- [x] 3.1 Thin HTTP routes + inbound handler + numbered menu + coupon
- [x] 3.2 Live QR print + inbound event wiring with fake event source tests
- [x] 3.3 All user-facing sends through humanized dispatch

## 4. Hub & root docs

- [x] 4.1 Hub README — WhatsMeow Implemented (catalog complete)
- [x] 4.2 Anti-ban docs — WhatsMeow presence+delay C
- [x] 4.3 ARCHITECTURE_SDD.md + STUDENT_DECISION_LOG.md

## 5. Verify

- [x] 5.1 `go test ./...` green

## 6. Adversarial fixes (live WhatsMeow)

- [x] 6.1 Add `go.mau.fi/whatsmeow` (and sqlite/store as required) to `go.mod`/`go.sum`; remove `//go:build live` so default `go run`/`go build` can pair
- [x] 6.2 Wire live adapter: presence + text + media send through the real client; `main` must not use FakeSocket for live session
- [x] 6.3 Dockerfile builds the default live-capable binary; README/ARCHITECTURE match (QR + send on default run; tests still fakes)
- [x] 6.4 Production env requires non-empty webhook secret
- [x] 6.5 `go test ./...` still green without Connect; optional compile check that live files are in default build

