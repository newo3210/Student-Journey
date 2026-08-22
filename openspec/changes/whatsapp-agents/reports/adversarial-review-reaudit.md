# Adversarial re-audit — whatsapp-agents

**Scope:** OpenSpec change `whatsapp-agents` (post-fix re-audit)  
**Worktree:** `.worktrees/whatsapp-agents`  
**Reviewer role:** Independent adversarial reviewer (did not implement original change or §7 fixes)  
**Date:** 2026-08-21  
**Prior review:** `reports/adversarial-review.md` — **FAIL** (2 Majors)  
**This report:** new file; does **not** overwrite the original FAIL report

**Sources:**
- `openspec/changes/whatsapp-agents/specs/meta-cloud-agent-template/spec.md` (incl. signature / Graph failure / text-only menu requirements)
- `openspec/changes/whatsapp-agents/tasks.md` §7 (all `[x]`)
- `openspec/changes/whatsapp-agents/reports/adversarial-review.md`
- `openspec/changes/whatsapp-agents/design.md` (decisions 9–10)
- Implementation under `WhatsApp-agents/meta-cloud-api/` (focus: webhookSignature, raw body, inboundHandler Graph status, demoFlow, verifyWebhook, README, `.env.example`)
- Root `ARCHITECTURE_SDD.md` §7 / §5 / changelog

**Mechanical re-check:** `npm test` in `WhatsApp-agents/meta-cloud-api` → **34/34 passed** (8 files).

---

## Spec and task alignment

| Area | Assessment |
|---|---|
| Tasks §7.1–7.6 | All checked `[x]`; code + tests present for each |
| Spec: HMAC when `WHATSAPP_APP_SECRET` set | **Met** — `validateHubSignature` + raw body via `express.json` verify; route rejects before Graph |
| Spec: missing/invalid signature → 401/403, no Graph | **Met** — route tests assert status ∈ {401,403} and `sendMessage` not called |
| Spec: unsigned public tunnel warning | **Met** — README banner + tunnel steps; `.env.example` recommends secret |
| Spec: Graph non-2xx not counted as `sent` | **Met** — `inboundHandler` only increments on 2xx; logs `console.error` on failure; unit test for HTTP 500 |
| Spec: ARCHITECTURE matches logging | **Met** — §7 states non-2xx logged after 200 ack, not counted as `sent`, lost-message risk explicit |
| Spec: menu text-only | **Met** — `demoFlow` returns empty payloads for non-text; tests for image/audio/sticker |
| Verify-token constant-time | **Met** — `timingSafeEqual` via `safeTokenEqual`; length-mismatch path covered |
| Catalog / stubs / anti-ban docs-only | Unchanged; still aligned (spot-check not re-run end-to-end; no regression signal in Meta path) |

**Prior Majors — closure status**

| Prior Major | Status | Evidence |
|---|---|---|
| 1. `X-Hub-Signature-256` when secret set; reject forged POST | **CLOSED** | `webhookSignature.ts`; `app.ts` rawBody; `webhookRoutes.ts` gate; unit + route tests (valid / missing / invalid) |
| 2. Graph non-2xx not counted as sent + honest ARCHITECTURE claim | **CLOSED** | `inboundHandler.ts` status check + log; test `does not count Graph HTTP 500…`; `ARCHITECTURE_SDD.md` §7 |

**Prior Minors targeted by §7**

| Prior Minor | Status |
|---|---|
| Non-text inbound opens menu | **CLOSED** |
| Verify-token not constant-time | **CLOSED** |

---

## Findings

| Severity | Area | Finding | Evidence | Suggested fix |
|----------|------|---------|----------|---------------|
| **Minor** | Residual risk (documented) | **Unsigned mode remains when `WHATSAPP_APP_SECRET` is unset.** Forged POST can still drive Graph sends. Honest and intentional for local demo; README / `.env.example` / tunnel steps warn strongly and recommend secret for public tunnels. Not re-Majored. | `webhookRoutes.ts` skips HMAC when `!appSecret`; README security warning; `.env.example` comments | **Docs/process:** keep warning; human OK at archive that public demos must set the secret. Optional later: fail-closed startup if `NODE_ENV=production` without secret. |
| **Minor** | Residual risk (documented) | **200-before-handle still acknowledges before Graph; failures after ack are not Meta-retried.** ARCHITECTURE §7 now states this honestly (log + not counted as `sent` + lost-message risk). Not re-Majored. | `webhookRoutes.ts` `res.status(200)` then `await handleInboundWebhook`; `ARCHITECTURE_SDD.md` §7 | **Docs:** residual accepted for MVP latency; optional queue/retry in a later change. |
| **Minor** | Parsing | **Only `entry[0].changes[0].messages[0]` is processed.** Batched Meta deliveries still drop siblings. Unchanged from prior review; not in §7 scope. | `contracts/webhook.ts` `extractInboundEvent` | **Code** (loop) or **OpenSpec** (document single-message MVP limit). |
| **Minor** | Idempotency | **`messageId` extracted but unused.** Duplicate deliveries can duplicate outbound replies. Unchanged; not in §7 scope. | `InboundEvent.messageId`; unused in `inboundHandler.ts` | **Code:** short-lived dedupe; **Tests** for duplicate `wamid`. |
| **Minor** | Process artifacts | **Acceptance matrix / verify-report are stale vs post-fix specs.** Matrix still 16 scenarios / “24/24”; does not record new signature / Graph-500 / text-only-menu scenarios. Verify-report still SUGGESTS “optional X-Hub-Signature-256 still deferred” — now false. | `reports/acceptance-matrix.md`; `reports/verify-report.md` | **Docs:** refresh matrix + verify notes for §7 scenarios (or note “pre-fix; see re-audit”). |
| **Minor** | Student decision log | **`STUDENT_DECISION_LOG.md` does not mention HMAC-when-secret or Graph non-2xx honesty** added after adversarial FAIL. Architecture English doc was updated; Spanish decision log lag. | `STUDENT_DECISION_LOG.md` control/error sections | **Docs:** short changelog / control-de-salida note before archive. |
| **Question** | Archive policy | Design non-goal still says “production hardening beyond local/demo”; §7 + design decisions 9–10 now require conditional HMAC + doc honesty. Residual unsigned path is accepted if human OK + README warning — confirm at archive. | `design.md` Non-Goals vs Decisions 9–10; README | **Human confirmation** |

### Strengths that close prior Majors (mitigations)

- HMAC gate uses **raw body** (`express.json` `verify` → `rawBody`), not re-serialized JSON — correct for Meta signatures.
- Forged / missing / wrong signatures return **401/403 and do not call Graph** (route tests with short delay assert no `sendMessage`).
- Graph **500 → `sent: 0` + `console.error`**; ARCHITECTURE §7 matches that behavior and documents early-ack loss risk.
- Demo menu is **text-scoped**; non-text types return empty payloads.

These close the prior FAIL grounds. They do **not** eliminate the documented residual risks above.

---

## Verdict

**PASS WITH GAPS**

No Blockers or Majors remain. Prior FAIL Majors are closed with matching specs, code, tests, and architecture honesty. Remaining items are **Minors** (documented residual risks, MVP parsing/idempotency limits, stale acceptance/verify artifacts, decision-log lag) plus one **Question** for human archive confirmation.

Archiving is **advisable** after human OK that acknowledges: (1) public tunnels must set `WHATSAPP_APP_SECRET`; (2) early 200 ack can lose messages on post-ack Graph failure. Prefer refreshing acceptance-matrix / verify-report notes and a short `STUDENT_DECISION_LOG` update before `/opsx:archive`, but those are not Major blockers.

---

## Recommended next steps (before archive)

1. Human OK on residual unsigned-without-secret + 200-before-handle risks.
2. Optionally refresh `acceptance-matrix.md` / `verify-report.md` for the three new signature scenarios + Graph 500 + non-text menu (or point to this re-audit).
3. Optionally note HMAC / Graph failure honesty in `STUDENT_DECISION_LOG.md`.
4. Follow-ups (non-blocking): multi-message extract loop; `messageId` dedupe.

---

## Chat-facing summary

```markdown
## Adversarial review (re-audit)

**Scope**: whatsapp-agents (worktree `.worktrees/whatsapp-agents`) after §7 fixes
**Sources**: updated meta-cloud-agent-template spec, tasks §7, prior FAIL report, meta-cloud-api implementation, ARCHITECTURE_SDD §7

### Spec and task alignment
- Prior Majors closed: HMAC when secret set (raw body) + Graph non-2xx not counted as sent with honest ARCHITECTURE §7.
- Prior §7 Minors closed: text-only menu; timingSafeEqual on verify token.
- `npm test` → 34/34 green.

### Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Minor | Residual | Unsigned without secret still abuseable; documented unsafe | README, .env.example, routes | human OK / docs |
| Minor | Residual | 200-before-handle message loss; documented | routes + ARCHITECTURE §7 | human OK / later retry |
| Minor | MVP limits | First message only; unused messageId | webhook.ts, inboundHandler | code / OpenSpec later |
| Minor | Process docs | Stale acceptance-matrix / verify-report; decision log lag | reports/*, STUDENT_DECISION_LOG | docs |
| Question | Archive | Non-goal vs conditional HMAC — confirm residual accepted | design.md | human |

### Verdict
PASS WITH GAPS

### Recommended next steps (before archive)
- Human OK on residual risks; optionally refresh matrix/verify + decision log; archive.
```
