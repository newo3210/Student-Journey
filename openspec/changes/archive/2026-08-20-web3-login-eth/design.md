## Context

Student Journey is the academic Full Stack hub. Blockchain was deferred from the five traditional repos. The requester wants an **alternate portfolio project** now: a minimal, forkeable Web3 login template on **Base**, extracted from patterns already proven in Etherlink / Reveal (`ConnectWalletClient`, ENS resolve, `wallet-demo` SIWE stub), published as GitHub **`web3-login-ETH`**.

## Goals / Non-Goals

**Goals:**

- Teach and demonstrate: wallet connect on Base, SIWE session, identity (ENS + Basename + avatar), native + env-configurable ERC-20 balances
- Clean Architecture layout suitable as a template for other dapps
- English technical README + Spanish decision log updates for oral defense
- Runnable locally without production infrastructure

**Non-Goals:**

- On-chain product logic, contracts, transfers, swaps
- Production auth (rate limits, durable store, OAuth)
- Multi-chain UI beyond documenting how to change `defineChain`
- Replacing or delaying academic repo profiles (this is parallel)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Host path | `apps/web3-login-ETH/` then publish as `web3-login-ETH` | Matches hub pattern (`react-task-manager`) |
| Wallet SDK | Thirdweb v5 | Same stack as Etherlink/Reveal experience; faster transfer of knowledge |
| Chain | Base mainnet `8453` | Requester choice; real L2 used in market demos |
| Auth | Connect + SIWE stub | Connect alone is not login for APIs; signature proves key ownership |
| Balances | Native ETH + optional ERC-20 via env | Template-generic without hardcoding one token |
| Identity | ENS + Basename + avatar | Shows L1 naming + Base naming; avatar for richer UX |
| Auth transport | Vite middleware stub (like Reveal `wallet-demo`) | Keeps monorepo-simple; no separate Express deploy for MVP |
| Verify | `viem` `verifyMessage` | Standard, vendor-agnostic crypto check |

## Conceptual layer mapping (concrete paths)

| Conceptual layer | Paths in this app | Notes |
|---|---|---|
| Presentation | `apps/web3-login-ETH/src/components/`, `src/App.tsx` | Thin UI: connect, sign-in panel, identity card, balances |
| Application / services | `apps/web3-login-ETH/src/features/session/`, `src/features/identity/`, `src/features/balance/` | Session orchestration, identity merge rules, balance formatting |
| Infrastructure | `apps/web3-login-ETH/src/lib/chains.ts`, RPC/Thirdweb client, ENS/Basename fetchers, `server/authPlugin.ts` | Chain config, HTTP/RPC I/O, JWT stub |
| Contracts / schemas | `apps/web3-login-ETH/src/contracts/` (Zod) | Address, env token config, auth request/response shapes |

## Connect vs SIWE (pedagogy — must appear in README)

1. **Connect** — The browser talks to a wallet provider and obtains an address + ability to request signatures/txs on a chain. Anyone can *display* an address in the UI without proving ownership.
2. **SIWE (Sign-In With Ethereum pattern)** — The server issues a short-lived **challenge**; the user **signs** it with `personal_sign` (no gas); the server **verifies** the signature and issues a **session** (JWT cookie). That session is what protects APIs.

Template implements both so learners see why product apps need the second step.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Base mainnet = real funds | README warns; no transfer UI; balances are read-only |
| Basename / ENS APIs flaky | Timeouts + graceful fallback to truncated address |
| Thirdweb client id required | `.env.example` + fail-visible setup copy |
| Auth stub not production-grade | Document explicitly; link to hardening follow-ups |
| Mixing academic vs Web3 tracks | Label as alternate track in LEARNING_ROADMAP / ACADEMIC docs cross-link |

## Migration / publish plan

1. Implement and verify inside Student Journey hub.
2. Publish folder (or subtree) to GitHub repo `web3-login-ETH` with MIT README.
3. Hub README links the alternate Web3 work.

## Open questions (resolved)

All enrich questions answered 2026-08-20 — see `tmp/web3-login-eth-enriched-us.md`.
