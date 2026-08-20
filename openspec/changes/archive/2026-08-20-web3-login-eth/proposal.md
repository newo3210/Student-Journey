## Why

The academic portfolio track deliberately excludes blockchain, but the learner already uses wallet connect, identity resolution, and signed sessions in real Web3 work. A focused Base mainnet template published as GitHub `web3-login-ETH` proves that knowledge pedagogically and gives a reusable starter for other projects.

## What Changes

- Scaffold `apps/web3-login-ETH/` (Vite + React + TypeScript + Thirdweb v5)
- Pin connect UI to **Base mainnet** (`8453`) with NetworkGuard
- Implement SIWE-style auth stub: challenge → `personal_sign` → session JWT (httpOnly cookie)
- Resolve identity: ENS and/or Basename + avatar, with address fallback
- Display native ETH balance and optional ERC-20 balance from env config
- Document Connect vs SIWE, env setup, and how to retarget chain/token
- Update hub `ARCHITECTURE_SDD.md`, `STUDENT_DECISION_LOG.md`, and learning/portfolio docs for the Web3 alternate track
- Prepare publish path to GitHub repo `web3-login-ETH`

## Capabilities

### New Capabilities

- `web3-login-eth`: Base wallet connect, SIWE session, identity (ENS/Basename/avatar), and configurable token balances for a pedagogical template

### Modified Capabilities

- *(none)*

## Impact

- New app under `apps/web3-login-ETH/`
- Docs under `docs/` and root pedagogical/architecture files
- Does not modify academic repos 1–5 scope
- External deps: thirdweb, viem, jose (auth stub); Thirdweb client id + JWT secret via `.env` only
