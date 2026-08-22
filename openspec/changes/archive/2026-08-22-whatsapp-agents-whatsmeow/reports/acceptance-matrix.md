# Acceptance Matrix — whatsapp-agents-whatsmeow

**Date:** 2026-08-22  
**Author:** director Phase 6a

Scenarios from specs. Evidence: `go test ./...` + file reads.

### Inbound text triggers outbound text — PASS (`internal/services`)
### Outbound text menu — PASS
### Coupon media send — PASS
### Presence then delayed send — PASS (`humanized` tests)
### Tests do not wait wall-clock 20–45s — PASS (suite ~0.04s/pkg)
### Secret reject — PASS (`internal/presentation`)
### Self message does not send — PASS
### Production rejects zero delay — PASS (`internal/contracts`)
### QR is surfaced — PASS (fake wiring tests in infrastructure)
### Live inbound drives demo handler — PASS (fake event source)
### Suite green with mocks — PASS (`go test ./...`, no WhatsApp)
### Reader finds WhatsMeow implemented — PASS (hub README)

### Default build includes WhatsMeow module — PASS (`go.mod` requires `go.mau.fi/whatsmeow`)

### Process client is not a no-op fake when live starts — PASS (`LiveSendBridge` + `bindLiveSend` / `WhatsMeowSocket`; tests still FakeSocket)

### Production rejects empty webhook secret — PASS (`env_test.go`)

## Summary

| Total | Pass | Fail | Blocked |
|---|---|---|---|
| 15 | 15 | 0 | 0 |

**Verdict:** PASS (live QR not scanned in this session; re-audit pending)
