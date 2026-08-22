## Context

Four Node/HTTP engines exist. WhatsMeow is Go. Tests must not connect to WhatsApp: fake event source + fake send/presence.

## Goals / Non-Goals

**Goals:** Layered Go package (presentation HTTP, services, infrastructure adapter, contracts/validation); humanization C; text menu + coupon; secret; fromMe skip; QR + inbound event wiring with fakes; hub complete.

**Non-Goals:** Redis/BullMQ; rewriting other engines; Level 2–4; live QR in CI.

## Decisions

1. Go module `whatsmeow-agent` (or similar) under `WhatsApp-agents/whatsmeow/`.
2. Presentation: `POST /webhook` simulator (JSON like Baileys envelope).
3. Infrastructure: interface `Client` with SendText, SendMedia, SendPresence; live wrapper uses whatsmeow; tests inject fake.
4. Live: print QR from `GetQRChannel`; subscribe to message events → same handler as HTTP.
5. Default menu = numbered text.
6. Delay 20–45s in prod; 0 allowed in tests via env.
7. Optional Dockerfile; README pairing + disclaimer.
8. English identifiers; no JS author-signature rule on `.go` files.

## Layers

| Layer | Path |
|---|---|
| Presentation | `WhatsApp-agents/whatsmeow/internal/presentation/` (or `cmd/` + `internal/http`) |
| Services | `internal/services/` |
| Infrastructure | `internal/infrastructure/` |
| Contracts | `internal/contracts/` |

## Risks

Unofficial protocol; Go toolchain required; QR interactive only.
