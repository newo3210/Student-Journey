# Adversarial review — whatsapp-agents

**Scope:** OpenSpec change `whatsapp-agents`  
**Worktree:** `.worktrees/whatsapp-agents`  
**Reviewer role:** Independent adversarial reviewer (did not implement)  
**Date:** 2026-08-21  
**Sources:**
- `openspec/changes/whatsapp-agents/proposal.md`
- `openspec/changes/whatsapp-agents/design.md`
- `openspec/changes/whatsapp-agents/tasks.md`
- `openspec/changes/whatsapp-agents/specs/whatsapp-agents-catalog/spec.md`
- `openspec/changes/whatsapp-agents/specs/meta-cloud-agent-template/spec.md`
- `openspec/changes/whatsapp-agents/reports/acceptance-matrix.md`
- `openspec/changes/whatsapp-agents/reports/verify-report.md`
- Implementation under `WhatsApp-agents/` (focus `meta-cloud-api/`)
- Root `ARCHITECTURE_SDD.md`, `STUDENT_DECISION_LOG.md`, `docs/LEARNING_ROADMAP.md`

**Mechanical re-check:** `npm test` in `WhatsApp-agents/meta-cloud-api` → **24/24 passed**.

---

## Spec and task alignment

| Area | Assessment |
|---|---|
| Hub catalog (engines, levels 1–4, stubs, anti-ban docs-only) | Aligned — README, stubs, `docs/anti-ban-strategy.md` match `whatsapp-agents-catalog` |
| Root docs | Aligned — `ARCHITECTURE_SDD.md` / `STUDENT_DECISION_LOG.md` / `LEARNING_ROADMAP.md` describe the parallel track |
| Clean Architecture folders | Aligned — presentation / services / infrastructure / contracts; routes stay thin |
| GET verify accept/reject | Aligned — code + unit + live curl evidence in acceptance matrix |
| Outbound builders (text / interactive / media) | Aligned — builders + Vitest shapes; Graph HTTP mocked |
| Demo flow (keywords + buttons + coupon PDF) | Aligned for happy path |
| Signature / production hardening | Explicitly deferred in design non-goals and `.env.example`, but README still instructs public HTTPS tunnel with a real token — **tension** between non-goal and intended demo path |
| Acceptance matrix | 16/16 marked PASS; outbound Graph is mocked only; stub check was Evolution spot-check (siblings verified OK in this review) |
| Verify report | Mechanical PASS with WARNING: no live Meta E2E |

**Acceptance criteria that still fail under adversarial conditions** (even if authors believed green):

1. Spec: *inbound text → service sends text reply via Graph* — not true when Graph returns 4xx/5xx: handler still reports `sent: 1` and Meta will not retry because POST already returned 200.
2. Documented tunnel setup implies a publicly reachable webhook; without `X-Hub-Signature-256`, any caller can drive outbound sends using the configured token.

---

## Findings

| Severity | Area | Finding | Evidence | Suggested fix |
|----------|------|---------|----------|---------------|
| **Major** | Webhook security / token abuse | **Unsigned POST webhook enables forged inbound → outbound to arbitrary `from`.** `WHATSAPP_APP_SECRET` is accepted in env schema and advertised in `.env.example` / README as optional signature, but **never read or enforced**. No `X-Hub-Signature-256` check. Minimal forged body is enough to extract an event and bind recipient. README setup path requires public tunnel + real Graph token → anyone who discovers the URL can spam WhatsApp numbers the WABA can message (menu / coupon / echo). | `src/presentation/webhookRoutes.ts` (POST ack with no signature); `src/contracts/env.ts` (`WHATSAPP_APP_SECRET` optional, unused); `.env.example` (“not enforced in MVP”); adversarial probe: forged `{ entry:[{ changes:[{ value:{ messages:[{ from:'5499999999999', …, text:{ body:'coupon' }}]}}]}]` → `extractInboundEvent` succeeds → would send `document` **to** `5499999999999`. Design/non-goal defers hardening; does **not** remove the abuse path on the documented demo setup. | **Code:** validate HMAC when `WHATSAPP_APP_SECRET` is set (requires raw body); prefer fail-closed guidance for tunneled demos. **Docs:** security warning that unsigned public webhooks = token abuse. **Tests:** reject forged POST without valid signature when secret set. **OpenSpec:** scenario for signature-required-or-explicitly-unsafe-demo. |
| **Major** | Reliability / observability / spec honesty | **POST returns 200 before handle, and Graph non-2xx is treated as success.** Fire-and-forget is intentional (Meta latency), but: (1) `MetaGraphClient.sendMessage` returns `{ status, body }` without throwing on 4xx/5xx; (2) `handleInboundWebhook` ignores that status and returns `handled: true, sent: N`; (3) only thrown errors hit `console.error`. `ARCHITECTURE_SDD.md` §7 claims “Graph errors logged after 200 webhook ack” — **false for HTTP error statuses**. Spec scenario “THEN the service sends…” is not guaranteed and Meta will not retry after the early 200. | `webhookRoutes.ts` L46–57; `metaGraphClient.ts` L42–54; `inboundHandler.ts` L38–42; probe: Graph mock returning `status: 500` → `handled_on_graph_500 {"handled":true,"sent":1}`; `ARCHITECTURE_SDD.md` §7. Tests only mock Graph 200. | **Code:** check Graph status; log/metric failures; optionally queue/retry after ack. **Tests:** assert non-2xx is not counted as successful send. **Docs:** correct ARCHITECTURE claim; document lost-message risk of 200-before-handle. |
| **Minor** | Demo flow | **Non-text inbound types with empty `textBody` open the menu.** `resolveDemoAction` treats `text === ''` like a menu keyword, so `type: 'image' \| 'audio' \| 'sticker' | …` without text still sends interactive buttons. | `demoFlow.ts` L45–48; probe: `resolveDemoAction({ type: 'image' }, …)` → `interactive`. | **Code:** only open menu for `type === 'text'` (or explicit keywords). **Tests:** ignore media/status-like types. |
| **Minor** | Parsing | **Only `entry[0].changes[0].messages[0]` is processed.** Batched Meta deliveries drop sibling messages/changes. | `contracts/webhook.ts` `extractInboundEvent` | **Code** (loop) or **OpenSpec** (document single-message MVP limit). |
| **Minor** | Idempotency | **`messageId` is extracted but never used.** Duplicate Meta deliveries can produce duplicate outbound replies if processing runs more than once. | `InboundEvent.messageId` in `webhook.ts`; unused in `inboundHandler.ts` | **Code:** short-lived dedupe set; **Tests** for duplicate `wamid`. |
| **Minor** | Verify security hygiene | **Verify-token compare is not constant-time** (`!==`). Low risk for demo, but weak for a shared secret. | `verifyWebhook.ts` L24 | **Code:** `crypto.timingSafeEqual` on buffers. |
| **Minor** | Acceptance / verify process | Acceptance matrix marked all scenarios PASS while live Graph E2E was never run; stub honesty was Evolution-only spot-check (siblings are fine). Verify report WARNING understated for archive confidence. | `reports/acceptance-matrix.md` inbound/interactive/media notes; `reports/verify-report.md` WARNING | **Tests/docs:** either one live smoke or explicit “mocked-only” acceptance note per outbound scenario; check all stubs. |
| **Question** | Scope vs README | Is “no production hardening” still valid archive rationale when the defense README’s primary setup is **public ngrok + real token**? If yes, archive needs an explicit **unsafe-when-public** banner; if no, signature validation (or equivalent) is required before archive. | `design.md` Non-Goals; `meta-cloud-api/README.md` “Expose the webhook” | **Human decision** + **docs** and/or **code**. |

### Strengths that mitigate *documented* risks (only)

- GET verify accept/reject behaves correctly (unit + live curl in acceptance matrix).
- Stub READMEs honestly say “Not implemented” and link back to the hub (all four checked in this review).
- Anti-ban remains documentation-only (no delay/presence/queue runtime in `src/`).
- Presentation layer does not embed Graph HTTP; builders are Zod-gated and unit-tested.

These do **not** mitigate unsigned POST abuse or silent Graph HTTP failures.

---

## Verdict

**FAIL**

At least two **Major** findings remain: (1) unsigned public webhook → Graph token abuse via forged `from`, with dead `WHATSAPP_APP_SECRET`; (2) early HTTP 200 + ignored Graph status → false “sent” success and incorrect architecture claim about error logging.

Archiving is **not advisable** until Majors are fixed or the OpenSpec explicitly accepts them with matching README/ARCHITECTURE honesty and a human OK that documents the residual risk.

---

## Recommended next steps (before archive)

1. **Decide** on signature policy: enforce HMAC when `WHATSAPP_APP_SECRET` is set (and document fail-closed for tunnels), **or** remove the env knob and add a prominent unsafe-demo warning.
2. **Surface Graph failures:** treat non-2xx as errors (log + do not count as `sent`); align `ARCHITECTURE_SDD.md` §7 with reality.
3. **Tighten demoFlow** so non-text types do not open the menu.
4. **Add negative tests:** forged POST without signature (when secret set); Graph 500 path; non-text inbound.
5. Re-run acceptance matrix on those scenarios; then a fresh adversarial pass in a new session.

---

## Chat-facing summary

```markdown
## Adversarial review

**Scope**: whatsapp-agents (worktree `.worktrees/whatsapp-agents`)
**Sources**: OpenSpec proposal/design/tasks/specs + acceptance-matrix + verify-report + WhatsApp-agents/meta-cloud-api

### Spec and task alignment
- Catalog, stubs, anti-ban docs-only, root docs, GET verify, builders, and happy-path demo flow align.
- Intended public-tunnel demo vs deferred signature / silent Graph errors do not align with safe “THEN the service sends” claims.

### Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Major | Webhook security | Unsigned POST + unused APP_SECRET → forge inbound, spam arbitrary `from` via Graph token | webhookRoutes.ts, env.ts, .env.example, forge probe | code + docs + tests (+ OpenSpec scenario) |
| Major | Reliability / docs | 200-before-handle; Graph 4xx/5xx counted as sent; ARCHITECTURE claims logging that does not happen | inboundHandler.ts, metaGraphClient.ts, ARCHITECTURE §7, probe status 500 | code + tests + docs |
| Minor | Demo flow | Non-text types open menu | demoFlow.ts | code + tests |
| Minor | Parsing / idempotency / verify hygiene | First message only; messageId unused; non-constant-time token compare | webhook.ts, inboundHandler.ts, verifyWebhook.ts | code / OpenSpec |
| Question | Archive policy | Non-goal “no hardening” vs README public tunnel | design.md, README | human + docs/code |

### Verdict
FAIL

### Recommended next steps (before archive)
- Enforce or remove APP_SECRET; warn if unsigned public demo remains.
- Fail/log Graph non-2xx; fix ARCHITECTURE claim.
- Negative tests + re-acceptance; new adversarial session.
```
