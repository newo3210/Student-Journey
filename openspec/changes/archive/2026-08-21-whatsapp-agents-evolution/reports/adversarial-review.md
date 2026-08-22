# Adversarial review — whatsapp-agents-evolution

**Date:** 2026-08-21  
**Reviewer:** independent session (did not implement this change)  
**Skill:** `adversarial-review` v1.0.0  
**Production code:** not modified

## Adversarial review

**Scope:** OpenSpec change `whatsapp-agents-evolution`  
**Worktree:** `.worktrees/whatsapp-agents-evolution`  
**Sources:**

- `openspec/changes/whatsapp-agents-evolution/proposal.md`
- `openspec/changes/whatsapp-agents-evolution/design.md`
- `openspec/changes/whatsapp-agents-evolution/tasks.md`
- `openspec/changes/whatsapp-agents-evolution/specs/evolution-agent-template/spec.md`
- `openspec/changes/whatsapp-agents-evolution/specs/whatsapp-agents-catalog/spec.md`
- `openspec/changes/whatsapp-agents-evolution/reports/verify-report.md`
- `openspec/changes/whatsapp-agents-evolution/reports/acceptance-matrix.md`
- Implementation: `WhatsApp-agents/evolution-api/` (`humanizedDispatch`, `evolutionClient`, webhook, compose, README)
- Hub: `WhatsApp-agents/README.md`, `WhatsApp-agents/docs/anti-ban-strategy.md`
- Root: `ARCHITECTURE_SDD.md`, `STUDENT_DECISION_LOG.md`
- Independent `npm test` in `WhatsApp-agents/evolution-api/`: **31/31 passed in ~702ms**

No PR URL was provided; review used worktree files + tests, not a GitHub diff.

### Spec and task alignment

Acceptance that **must** be true for “done”:

| Criterion | Spec / design | Independent check |
|---|---|---|
| Inbound webhook → Evolution text/interactive/media | `evolution-agent-template` | Unit tests + demo flow; **mocked HTTP only** |
| Presence `composing` then delay then send; no Redis/BullMQ in bot | Humanization C | `humanizedDispatch.ts` order proven; bot src has no Redis |
| Tests do not wait 20–45s wall-clock | Spec scenario | Confirmed: 31 tests / 702ms |
| Compose Evolution + bot, documented env | Spec + task 1.3 | File exists; **live `compose up` never run** (verify residual) |
| Thin presentation; HTTP in infrastructure | Spec | Routes ack + call services; client isolated |
| Startup fails on missing env | Spec | `parseEnv` tests; matrix claims `tsx` fail-fast |
| Hub Evolution = Implemented; humanization C visible | Catalog delta | Hub README + anti-ban docs |
| Unofficial ToS / ban disclaimer | Design non-goal + README | Present (README, `.env.example`, compose comments, anti-ban) |
| Secrets not committed | Design | `.env.example` placeholders only |

**Underspecified / tension:**

- Design: webhook “verify/secret **as applicable**”; spec never requires auth. Meta template has optional HMAC. Evolution stores `rawBody` “for future signature checks” and never implements a gate.
- Spec: delay **SHALL** be 20–45s. Design: `HUMANIZE_*` override “**in test only**”. Code allows `0` in any environment with no floor.
- Spec non-goal: Redis/BullMQ **for the bot**. Compose also sets `CACHE_REDIS_ENABLED=false` / `DATABASE_ENABLED=false` on the **gateway** image; official Evolution v2 Docker docs treat Postgres + Redis as install prerequisites. Live boot unproven.

Mechanical verify was **PASS** with WARNING (no live Evolution) and SUGGESTION (unsigned webhook). Acceptance matrix **12/12 PASS** on unit evidence. This review does **not** rubber-stamp that as archive-ready.

---

### Hunt notes (explicit threat list)

| Hunt | Result |
|---|---|
| Unsigned webhook abuse | **Confirmed.** POST `/webhook` always 200, no secret/HMAC/shared header. `to` comes from attacker-controlled `remoteJid`. README tells users to expose a public tunnel. |
| Delay bypass via env | **Confirmed.** `HUMANIZE_MIN_MS`/`MAX_MS` are nonnegative; `0`/`0` is valid in production Compose interpolation. Design said test-only; no `NODE_ENV` floor. |
| Graph-like false success on non-2xx | **Mostly mitigated.** Client returns `{ status, body }` without throwing; `humanizedSendAll` only increments `sent` on 2xx and logs otherwise. Test: inbound handler HTTP 500 → `sent === 0`. Residual: 2xx with error JSON still counted. |
| ToS disclaimer missing | **Not found.** Disclaimer is in README, `.env.example`, compose header, anti-ban, hub. |
| Redis accidentally enabled | **Not found** on the bot. Gateway explicitly `CACHE_REDIS_ENABLED: "false"`. Opposite risk: gateway may fail to run without Redis/Postgres (see Major). |
| Presence skipped | **Not found.** Dispatcher always `sendPresence(..., 'composing')` before sleep/send. Presence **failure** (non-2xx) still continues to send (spec does not require abort). |
| Wall-clock in tests | **Not found.** Injected sleep and/or 0 ms range; suite ~0.7s. |
| Thin presentation violations | **Not found** (routes are thin). Docs overclaim “parse” in routes (`ARCHITECTURE_SDD` §3.3); parse lives in `extractInboundEvent`. |

---

### Findings

| Severity | Area | Finding | Evidence | Suggested fix (code / spec / tests) |
|----------|------|---------|----------|--------------------------------------|
| **Major** | Security / webhook | Unsigned inbound webhook can drive the connected WhatsApp session. Any client that can reach the bot (Compose port `3001`, or documented ngrok/Cloudflare URL) can POST a `messages.upsert`-shaped body with an arbitrary `remoteJid` and trigger humanized outbound text/buttons/media. `fromMe` omitted is treated as inbound. Meta Level 1 at least supports optional HMAC; Evolution prepared `rawBody` and never gated. Mechanical verify already suggested this; with a **public tunnel** in the README it is abuse-ready, not a nit. | `webhookRoutes.ts` ack-then-handle; no header check; `extractInboundEvent` uses `data.key.remoteJid`; design.md decision 5 “webhook verify/secret as applicable”; `.env.example` has no webhook secret. | **Code:** optional shared secret / Evolution webhook header (fail closed when set), same pattern as Meta `WHATSAPP_APP_SECRET`. **Spec:** add scenario “unauthenticated POST does not send”. **Tests:** reject missing/invalid secret. **Docs:** warn that an open tunnel is a send-oracle. |
| **Major** | Reliability / loops | Echo / self-message loop if Evolution omits `fromMe` on outbound copies. Skip is only `fromMe === true`; optional boolean means missing ≠ outbound. Combined with unsigned POST, an attacker can also omit `fromMe`. | `webhook.ts` `fromMe: z.boolean().optional()`; `if (data.key.fromMe === true) return null`. | **Code:** treat missing `fromMe` conservatively (or require boolean); ignore events whose `key.id` matches last outbound. **Tests:** omit `fromMe` on echo-like payload → no send. |
| **Major** | Humanization / spec | Production can silently disable the advertised 20–45s delay. Spec SHALL wait 20–45s; design said env override is for tests only. `envSchema` accepts `0`. Compose passes `${HUMANIZE_MIN_MS:-20000}` so a `.env` with `0` ships a “humanized” bot with no delay while the catalog still claims C. | `env.ts` `.nonnegative().default(20_000)`; compose `HUMANIZE_MIN_MS: ${HUMANIZE_MIN_MS:-20000}`; design.md risk “test only”. | **Code:** if `NODE_ENV===production` (Dockerfile sets this), reject min/max below 20000/45000 **or** log a hard warning and clamp. Keep `0` only when `NODE_ENV!==production` or explicit `ALLOW_HUMANIZE_BYPASS=true`. **Spec/design:** resolve the SHALL vs test-override contradiction. **Tests:** production parse rejects `0`. |
| **Major** | Compose / runnable template | Spec requires a compose file that **runs** Evolution + bot. Official Evolution **v2.1.1** Docker docs list PostgreSQL and Redis as prerequisites and show `CACHE_REDIS_ENABLED=true`. This compose disables Redis and DB, does not set `CACHE_LOCAL_ENABLED`, has no healthcheck (`depends_on` only), and verify/acceptance never executed `docker compose up`. “Redis accidentally enabled” is false; “Evolution actually boots in this slim compose” is unproven and likely fragile. Default `AUTHENTICATION_API_KEY` fallback `change-me-evolution-apikey` is bound on host `:8080`. | `docker-compose.yml` `CACHE_REDIS_ENABLED: "false"`, `DATABASE_ENABLED: "false"`; verify-report WARNING; Evolution v2 Docker docs (atendai/evolutionfoundation). | **Ops/docs:** either add a documented local-cache mode that was **actually booted**, or add Redis/Postgres as optional profile with Redis **off** for the **bot** only. **Verify:** live smoke checklist item executed, not only `compose config`. |
| Minor | Docs vs routes | `ARCHITECTURE_SDD` §3.3 says webhook routes “ack + parse”. Routes do not parse; Zod parse is in contracts/services. Thinness is fine; the architecture file is wrong. §7 documents Meta non-2xx handling but not Evolution’s equivalent (code does log + not count 2xx-only). | `ARCHITECTURE_SDD.md` vs `webhookRoutes.ts` | **Docs:** fix flow table; add Evolution non-2xx note like Meta. |
| Minor | Client / false success residual | HTTP **2xx** with an error object in JSON still increments `sent`. Non-2xx is handled. No test for presence non-2xx still sending. | `humanizedSendAll` 2xx check; no test that presence 500 still calls `sendMessage` | **Tests:** document or abort-on-presence-failure if product intent is “presence then send” as a unit of success. |
| Minor | Demo vs catalog wording | Catalog/spec allow buttons **and/or** list; demo only **sends** buttons (list is parsed inbound + builder tested). Coupon is PDF only (spec allows image and/or). Fine, but oral demo should not claim live list **send**. | `demoFlow.ts` `buildMenuMessage` buttons only | **Docs:** “inbound list parse + builder; outbound buttons”. |
| Question | Evolution presence payload | `sendPresence` body `{ number, options: { delay: 0, presence } }` is unpinned against a live v2.1.1 instance. Wrong shape would look like “presence skipped” in the wild while unit tests still pass. | `evolutionClient.ts`; tests mock fetch | **Human:** one live presence call after QR; pin payload in README if the image differs. |

### What is **not** a finding (mitigations that actually bound risk)

- Bot source has no BullMQ/Redis; humanizer is in-process.
- Unofficial-gateway disclaimer is present where design required it.
- Unit suite does not sleep 20–45s wall-clock (re-run 2026-08-21: 31/31, 702ms).
- Thin routes: no Evolution `fetch` in presentation.
- Non-2xx Evolution send is not counted as `sent` (unlike a naive “fetch resolved ⇒ success” Graph bug).

---

### Verdict

**FAIL**

At least three **Major** issues (open webhook send-oracle, `fromMe` optional loop/abuse, production delay bypass vs spec SHALL, plus unproven slim Compose vs official Evolution prerequisites) should stop archive until addressed in **code and/or spec**.

Archiving is **not advisable** in the current state.

---

### Recommended next steps (before archive)

1. Add optional (prefer default-on in Compose) webhook shared secret; tests for reject/allow. Update spec scenario.
2. Tighten `fromMe` / echo handling; add a negative test without `fromMe`.
3. Clamp or reject `HUMANIZE_*` of `0` when `NODE_ENV=production`; align spec vs design.
4. Prove Compose: `docker compose up` until Evolution UI + bot `/health`, or change compose to a documented stack that actually starts (local cache vs Redis/Postgres). Record evidence in verify-report.
5. Re-run mechanical verify; new independent adversarial pass; human OK.

**Do not** treat `reports/verify-report.md` PASS or `acceptance-matrix.md` 12/12 as closing this change.
