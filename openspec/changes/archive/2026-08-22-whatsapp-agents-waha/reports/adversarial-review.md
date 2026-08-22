# Adversarial review — whatsapp-agents-waha

**Scope**: OpenSpec change `whatsapp-agents-waha`  
**Worktree**: `.worktrees/whatsapp-agents-waha`  
**Reviewer**: independent adversarial pass (did not implement)  
**Date:** 2026-08-22  
**Production code:** not modified

## Adversarial review

**Sources**:
- `openspec/changes/whatsapp-agents-waha/proposal.md`
- `openspec/changes/whatsapp-agents-waha/design.md`
- `openspec/changes/whatsapp-agents-waha/tasks.md`
- `openspec/changes/whatsapp-agents-waha/specs/waha-agent-template/spec.md`
- `openspec/changes/whatsapp-agents-waha/specs/whatsapp-agents-catalog/spec.md`
- `openspec/changes/whatsapp-agents-waha/reports/verify-report.md`
- `openspec/changes/whatsapp-agents-waha/reports/acceptance-matrix.md`
- Implementation: `WhatsApp-agents/waha/` (`wahaClient`, `humanizedDispatch`, webhook secret, fromMe, Compose, README)
- Hub: `WhatsApp-agents/README.md`, `WhatsApp-agents/docs/anti-ban-strategy.md`
- Root: `ARCHITECTURE_SDD.md`, `STUDENT_DECISION_LOG.md`

### Spec and task alignment

| Must be true | Observed |
|---|---|
| Runnable Level 1 bot, Clean Architecture folders | Present under `WhatsApp-agents/waha/src/{presentation,services,infrastructure,contracts}` |
| Compose Waha + bot, slim, no Redis/BullMQ | `docker-compose.yml` services `waha` + `bot`; `package.json` has no Redis/BullMQ deps |
| Humanization C: presence then 20–45s; injectable sleep | `humanizedDispatch` calls `sendPresence` → `sleep` → `sendMessage`; tests inject sleep |
| Webhook secret when set; unsigned tunnel documented | Fail-closed 401/403 when `WAHA_WEBHOOK_SECRET` set; README send-oracle warning + `index.ts` console.warn |
| fromMe / self skip | `extractInboundEvent` requires `payload.fromMe === false`; omitted and `true` skip send |
| Production delay floor | `envSchema` rejects min &lt; 20000 or max &lt; 45000 when `NODE_ENV === 'production'`; Compose/Dockerfile set production |
| Interactive **or** documented text fallback | Default `WAHA_MENU_MODE=text`; README/CORE vs PLUS noted |
| Unofficial ToS / ban disclaimer | README, `.env.example`, Compose comments, anti-ban doc |
| Thin presentation | Routes: secret check, 200 ack, delegate to `handleInboundWebhook`; HTTP in `wahaClient` |
| Hub catalog Waha Implemented | Hub table points to `waha/` |
| Live `compose up` not claimed | README + verify WARNING |

Mechanical verify (40 tests, `compose config`) is not treated as proof of live QR/webhook wiring.

### Hunt notes (requested)

| Hunt | Result |
|---|---|
| Unsigned webhook | **By design when secret unset.** Compose defaults secret empty and `WHATSAPP_HOOK_CUSTOM_HEADERS` empty. Documented send-oracle. Not a spec violation (requirement is fail-closed *when configured*). Residual demo risk. |
| Delay bypass | Production path gated. Bypass remains if `NODE_ENV` is not exactly `'production'` (case/alias) while `HUMANIZE_*` is 0. Compose/Dockerfile use lowercase `production`. Spec allows 0 outside production. |
| False `sent` on errors | HTTP **non-2xx** does not increment `sent` (`humanizedSendAll` + `inboundHandler.test.ts` 500 case). Thrown `fetch` is not counted (propagates; route already acked 200). **2xx with error JSON** still increments `sent`. |
| ToS disclaimer | Present in the places listed above. |
| Redis/BullMQ | Not in Compose or npm dependencies. Anti-ban matrix says No. |
| Presence skipped | Presence **call is not skipped**. Non-2xx / ignored `_presence` argument still proceeds to delay+send (typing may be absent; delay still applied). |
| Wall-clock tests | Humanizer sleep injected; webhook negative tests use ~50ms waits. Verify report ~951ms for 40 tests. |
| Fat routes | Webhook route is thin (secret + ack + service). |
| CORE claiming PLUS buttons | Template README/Compose do **not** claim PLUS `sendList` on the CORE image. Hub **complexity** row still lists “interactive buttons/lists” as Implemented in `waha/` (over-broad vs default text fallback). |
| Compose `latest` tag | `devlikeapro/waha:latest` — family documented, digest/version not pinned; live `up` UNVERIFIED. |

### Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| Minor | Security / webhook | Default Compose/local path is an unsigned POST `/webhook`. Anyone who can reach the bot can trigger outbound sends. Spec only requires protection when the secret is set; README warns. Easy to ship a public tunnel without setting both `WAHA_WEBHOOK_SECRET` *and* `WHATSAPP_HOOK_CUSTOM_HEADERS`. | `docker-compose.yml` empty secret/headers; `webhookRoutes.ts` skips check when unset; README “Tunnel / webhook notes” | **docs**: Compose comment or example that pairs both vars. Optional **code**: warn at startup is already there. |
| Minor | Humanization / delay | Production floor is exact-string `NODE_ENV === 'production'`. `Production` / `prod` plus `HUMANIZE_MIN_MS=0` would start with zero delay. Local `npm run dev` without NODE_ENV also allows 0 if `.env` is edited. | `contracts/env.ts` superRefine | **code**: treat common aliases; **tests**: `NODE_ENV=Production` rejected or documented. |
| Minor | Honesty / `sent` | 2xx Waha bodies that encode failure still count as `sent`. Network throws after the early 200 ack are lost (no retry). | `humanizedSendAll` status 200–299; `webhookRoutes.ts` ack-before-await | **docs**: already similar for Evolution in `ARCHITECTURE_SDD.md` §7; add the 2xx-JSON caveat for Waha. **tests**: optional throw-from-fetch case. |
| Minor | Humanization C | `startTyping` non-2xx does not gate send. Presence can fail silently; message still goes after delay. `_presence` argument is unused (always startTyping). | `humanizedDispatch.ts` no check on `presence.status`; `wahaClient.sendPresence` | **code** (optional): log non-2xx presence; **tests**: presence 500 still sends (document as accepted). |
| Minor | Catalog honesty | Hub Level 1 row says buttons/lists are Implemented in `waha/`. Shipped Compose is CORE + default text menu; `sendList` is PLUS-only per README. | `WhatsApp-agents/README.md` complexity table vs `waha/README.md` | **docs**: qualify hub row (“text menu; buttons/list optional / PLUS”). |
| Minor | Ops / pin | Image tag `latest` on an unofficial gateway with unverified live `up` is a reproducibility and API-churn risk. Design asked to pin image/version in README; family name is pinned, not a digest or dated tag. | `docker-compose.yml` `devlikeapro/waha:latest` | **docs/ops**: pin a known tag/digest when someone actually runs `compose up`. |
| Minor | Tests | Production floor test only uses `0/0`, not `19999` or max `&lt; 45000` with min 20000. | `env.test.ts` | **tests**: one extra case. |
| Minor | Tasks / README | Task 1.4 asked for “defense bullets”. Waha README has disclaimer, C path, and oracle warning, but no short oral-defense bullet list (that lives mainly in `STUDENT_DECISION_LOG.md`). | `tasks.md` 1.4 vs `waha/README.md` | **docs**: 3–5 defense bullets in the template README. |
| Question | Live webhook shape | Conservative `fromMe === false` is correct vs echo loops. If a CORE engine omitted `fromMe` on inbound `message` events, the bot would never reply. Waha docs usually include the field. Global `WHATSAPP_HOOK_URL` vs per-session dashboard webhooks was not live-tested. | `webhook.ts` `payload.fromMe !== false`; verify WARNING | Confirm with one live inbound after QR; no archive blocker if humans accept mocked-only Level 1. |

No **Blocker** or **Major** findings that contradict the written spec scenarios. Gaps above are residual risk, catalog precision, and unpinned/unverified ops.

### Verdict

**PASS WITH GAPS**

Archiving is **advisable** only if the human accepts: (1) mocked HTTP as sufficient (live QR/`compose up` still UNVERIFIED), and (2) the minor gaps stay tracked (unsigned default webhook, `latest` tag, hub buttons/list wording). Do not treat mechanical verify + 14/14 matrix as live engine proof.

### Recommended next steps (before archive)

1. Human OK on mocked-only verification and unofficial ToS/ban disclaimer.
2. Optional follow-ups (need not block archive if accepted): pair Compose secret+custom headers example; qualify hub Level 1 wording; pin Waha tag after a real `compose up`; log presence non-2xx.
3. Keep writer ≠ this reviewer: do not have the implementer “fix and re-review” in the same session.
