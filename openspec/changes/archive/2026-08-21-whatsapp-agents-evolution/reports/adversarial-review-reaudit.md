# Adversarial re-audit — whatsapp-agents-evolution

**Date:** 2026-08-21  
**Reviewer:** independent session (did not implement original change or §6 fixes)  
**Skill:** `adversarial-review` v1.0.0  
**Production code:** not modified  
**Prior report:** `reports/adversarial-review.md` (**FAIL**, left intact)

## Adversarial review

**Scope:** OpenSpec change `whatsapp-agents-evolution` (post §6 adversarial fixes)  
**Worktree:** `.worktrees/whatsapp-agents-evolution`  
**Sources:**

- `openspec/changes/whatsapp-agents-evolution/proposal.md`
- `openspec/changes/whatsapp-agents-evolution/design.md`
- `openspec/changes/whatsapp-agents-evolution/tasks.md` (§6 marked complete)
- `openspec/changes/whatsapp-agents-evolution/specs/evolution-agent-template/spec.md` (incl. webhook secret, fromMe, delay floor, compose honesty)
- `openspec/changes/whatsapp-agents-evolution/specs/whatsapp-agents-catalog/spec.md`
- Prior FAIL: `reports/adversarial-review.md`
- Implementation: `WhatsApp-agents/evolution-api/`
- Hub / root: `WhatsApp-agents/README.md`, `docs/anti-ban-strategy.md`, `ARCHITECTURE_SDD.md`
- Independent `npm test`: **39/39 passed in ~918ms**

No PR URL was provided; review used worktree files + tests.

### Spec and task alignment

| Prior Major (FAIL report) | Spec / task | Independent check after §6 |
|---|---|---|
| 1. Webhook secret when `EVOLUTION_WEBHOOK_SECRET` set | Spec “Webhook shared secret when configured”; task 6.1 | **Closed.** Routes fail closed (401 missing / 403 mismatch) **before** ack/handle; tests prove no `sendMessage`. README + `.env.example` + startup warn if unset. |
| 2. `fromMe` only `false` | Spec “Ignore outbound and ambiguous fromMe”; task 6.2 | **Closed.** `extractInboundEvent` requires `fromMe !== false` → `null`; omitted-fromMe tests at contract, handler, and route layers. |
| 3. Production delay floor 20s/45s | Spec “Production delay floor”; task 6.3 | **Closed.** `envSchema` superRefine when `NODE_ENV === 'production'`; tests reject `0` in production and accept `0` in `test`. Compose bot sets `NODE_ENV: production`. |
| 4. Compose slim vs full | Spec “Compose stack documented honestly”; task 6.4 | **Closed as documented.** README + compose comments state slim live `up` is **unverified / may fail**; `full` overlay + profile documented; QR is manual smoke. Live `compose up` still not required if README is honest. |
| ARCHITECTURE wording (prior Minor) | Task 6.5 | **Closed.** §3.3 ack + secret then services parse; §7 Evolution non-2xx + 2xx-error-JSON residual. |

**Acceptance that remains true:** inbound → mocked Evolution send; presence then delay then send; tests do not wait 20–45s; thin presentation; missing env fail-fast; hub Evolution = Implemented; unofficial disclaimer; secrets not committed.

### Hunt notes (re-check of prior threats)

| Hunt | Result |
|---|---|
| Unsigned webhook when secret **set** | **Mitigated.** Missing header 401, mismatch 403, no send. Timing-safe compare after length check. |
| Unsigned webhook when secret **unset** | **Still open by design.** Documented send-oracle; `index.ts` warns at boot. Spec scenario “Unsigned public demo documented as unsafe” is met. |
| `fromMe` omitted / true | **Mitigated.** Only explicit `false` is processed. |
| Delay bypass in production | **Mitigated** at `parseEnv` (string `'production'`). Compose interpolates `HUMANIZE_*` but bot cannot start if floor fails. |
| 2xx + error JSON counted as `sent` | **Unchanged residual.** Documented in `ARCHITECTURE_SDD` §7. Non-2xx still not counted. |
| Slim Compose actually boots | **Unproven.** Honestly labeled; `full` file exists. Not re-raised as Major. |
| Presence skipped | **Not found.** Order still presence → sleep → send. Presence non-2xx still continues (spec does not abort). |
| Thin presentation | **Not found.** Secret check + ack only in routes. |

### Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Minor | Security / ops | Public `/webhook` without `EVOLUTION_WEBHOOK_SECRET` remains a send-oracle. Compose default interpolates empty secret. Fail-open is now **specified and documented**, not accidental. | README tunnel warning; `.env.example`; `index.ts` console.warn; spec “when configured” | **Docs/ops:** operators should set the secret before any public tunnel. Optional later: default-on secret in Compose. |
| Minor | Compose | Slim (and full) live `docker compose up` is still unverified. `--profile full` on the base file alone starts Redis/Postgres **without** enabling `CACHE_REDIS_ENABLED` unless the overlay is used. README shows the two-file command. | README “UNVERIFIED”; `docker-compose.yml` vs `docker-compose.full.yml` | **Docs:** keep overlay mandatory in examples (already). Live smoke remains a human checklist item. |
| Minor | Client / metrics | HTTP 2xx with error JSON still increments `sent`. Presence failure still sends. | `humanizedSendAll`; ARCHITECTURE §7 now states this | **Tests/docs:** residual is disclosed; product abort-on-presence remains optional. |
| Minor | Verify artifacts | Mechanical `verify-report.md` SUGGESTION still says webhook has no auth; acceptance matrix still cites 31 tests. Specs/code moved on (39 tests, secret gate). | `reports/verify-report.md`, `acceptance-matrix.md` | **Docs:** refresh those reports on next `/opsx:verify` — not a runtime bug. |
| Question | Env / NODE_ENV | Floor is exact string `production`. `NODE_ENV=Production` or unset local `npm run` can still parse `HUMANIZE_*=0`. Spec allows non-production bypass. | `env.ts` | **Human:** confirm local-without-NODE_ENV zero delay is acceptable. |
| Question | Evolution live payload | Presence body and v2.1.1 paths remain unpinned against a live instance (same as prior Question). | `evolutionClient.ts`; mocked tests | **Human:** one live presence/send after QR. |

### Prior Majors — disposition

1. **Closed** — secret header when env set; tests 401/403 + no send.  
2. **Closed** — omitted `fromMe` does not send.  
3. **Closed** — production rejects sub-floor delays.  
4. **Closed** (honesty, not live boot) — slim vs full documented; live `up` not claimed.

### What is not a finding

- Bot still has no Redis/BullMQ; humanizer is in-process.
- Unofficial-gateway disclaimer remains in README, `.env.example`, compose header, anti-ban, hub.
- Suite 39/39 in <1s (no wall-clock 20–45s).
- Thin routes; Evolution HTTP in infrastructure.
- Non-2xx Evolution send is not counted as `sent`.

---

### Verdict

**PASS WITH GAPS**

No remaining **Blocker** or **Major**. Prior FAIL Majors are closed in code, tests, spec, and docs. Tracked **Minors** / **Questions** are the documented residuals (unsigned-without-secret, unverified slim/full live boot, 2xx error JSON as `sent`) plus stale mechanical-verify files.

Archiving is **advisable** from an adversarial standpoint **if** the human accepts those documented residuals and does not treat live Compose/QR as a gate.

---

### Recommended next steps (before archive)

1. Human OK on fail-open webhook when secret is unset, and on “slim may fail / full unbooted.”
2. Optionally refresh `verify-report.md` / `acceptance-matrix.md` so they do not contradict §6 (stale 31 tests / “no webhook auth”).
3. Do **not** treat the original `adversarial-review.md` FAIL as current; this re-audit supersedes it for archive gating.
