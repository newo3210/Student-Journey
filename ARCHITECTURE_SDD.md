# Architecture SDD

> **Language:** English (technical contract).  
> **Location:** repository root `ARCHITECTURE_SDD.md`.  
> **Last updated:** 2026-08-20  
> **Related OpenSpec change:** `openspec/changes/web3-login-eth/`

---

## 1. System overview

**Student Journey** is the documentation and OpenSpec hub for a Full Stack student portfolio.

**Priority track — Academic:** five traditional Full Stack Modern repositories (no AI / no blockchain). Repo **#1** `react-task-manager` is implemented at `apps/react-task-manager/`. Repos 2–5 remain profiled in `docs/ACADEMIC_PORTFOLIO.md`.

**Alternate track — Web3:** pedagogical Base wallet template `apps/web3-login-ETH/` (GitHub target `web3-login-ETH`): Thirdweb connect on Base mainnet, Basename/ENS + avatar, native + optional ERC-20 balances, SIWE session stub.

## 2. Layer mapping

### 2.1 `apps/react-task-manager` (academic #1)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/components/`, `src/App.tsx` | No localStorage in components |
| Application | `src/features/tasks/taskOperations.ts`, `useTasks.ts` | Mutations, filters, validation |
| Infrastructure | `src/features/tasks/tasksStorage.ts` | localStorage adapter |
| Contracts | `src/types/task.ts` | Zod schemas |

### 2.2 `apps/web3-login-ETH` (Web3 alternate)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/components/`, `src/App.tsx` | Connect, identity, balances, SIWE panel |
| Application | `src/features/session/`, `identity/`, `balance/` | Session orchestration, name merge, balance format |
| Infrastructure | `src/lib/chains.ts`, RPC/ENS clients, `server/authPlugin.ts` | Base chain, Thirdweb client, JWT stub |
| Contracts | `src/contracts/web3Auth.ts` | Zod address/token/auth schemas |

Author signature (line 1 on hand-written `.ts`/`.tsx`): `//Mariano Montini ('bosque', 'bosquestudio')`

### 2.3 Remaining academic apps (intended)

| Conceptual layer | Typical paths |
|---|---|
| Presentation | Express routes/controllers; Next `app/` |
| Application | `services/` |
| Infrastructure | `repositories/`, Prisma |
| Contracts | `schemas/` (Zod) |

## 3. Data & control flow

### Academic repo 1

```text
UI components → useTasks → taskOperations → tasksStorage → localStorage
```

### Web3 template

```text
ConnectButton (Thirdweb)
  → address
    → resolveWalletIdentity (Basename / ENS / avatar)
    → fetchWalletBalances (ETH + optional ERC-20)
  → Sign in
    → GET /api/auth/challenge
    → personal_sign
    → POST /api/auth/login
    → httpOnly session cookie
    → GET /api/auth/session
```

## 4. API routes

None in academic repo 1 (client-only).

| Method | Path | App | Auth | Notes |
|---|---|---|---|---|
| GET | `/api/auth/challenge` | web3-login-ETH | — | Challenge JWT in message |
| POST | `/api/auth/login` | web3-login-ETH | signature | Sets session cookie |
| GET | `/api/auth/session` | web3-login-ETH | cookie | Session probe |
| POST | `/api/auth/logout` | web3-login-ETH | cookie | Clears cookie |

| # | Path / name | Status |
|---|---|---|
| 1 | `apps/react-task-manager` | Implemented |
| Web3 | `apps/web3-login-ETH` | Implemented (alternate track) |
| 2–5 | see academic portfolio | Profiled only |

## 5. Schemas

### Academic repo 1

- `Task`: `{ id, title, completed, createdAt }`
- `taskTitleSchema`: trimmed non-empty string

### Web3 template

- `ethAddressSchema`, `tokenEnvSchema`, `loginBodySchema`, `sessionResponseSchema` in `src/contracts/web3Auth.ts`

## 6. AI / LLM boundaries

Not applicable on Academic or this Web3 login template.

## 7. Error handling

- Academic: invalid titles → inline UI; corrupt localStorage → `[]`
- Web3: wrong chain → NetworkGuard; SIWE reject → connected-unauthenticated; identity/balance failures → soft fallback / error text

## 8. Non-goals

- Academic repo 1: backend, auth, DB, AI
- Web3 template: transfers, contracts, production auth hardening, other L2s in UI (documented retarget only)

## 9. Milestones

| Order | Repo | Status |
|---|---|---|
| 1 | `react-task-manager` | Done |
| Alt | `web3-login-ETH` | Done (alternate) |
| 2 | `express-api-boilerplate` | Next (academic) |
| 3–5 | blog / auth / booking | Pending |

## 10. Change log

| Date | Change | OpenSpec |
|---|---|---|
| 2026-07-31 | Academic #1 task manager | `react-task-manager` |
| 2026-08-20 | Base Web3 login template | `web3-login-eth` |
