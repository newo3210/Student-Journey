## 1. Scaffold and contracts

- [x] 1.1 Create `apps/web3-login-ETH/` Vite + React + TypeScript project with Tailwind (or minimal CSS consistent with pedagogical clarity)
- [x] 1.2 Add `.env.example` (`VITE_THIRDWEB_CLIENT_ID`, `JWT_SECRET`, optional `VITE_RPC_URL`, `VITE_TOKEN_ADDRESS`, `VITE_TOKEN_SYMBOL`, `VITE_TOKEN_DECIMALS`) and `.gitignore` for secrets
- [x] 1.3 Add Zod contracts for address, token env config, and auth challenge/login/session payloads under `src/contracts/`
- [x] 1.4 Add failing Vitest tests for: address truncate helper, token env parse, challenge JWT extraction / session wallet claim helpers (TDD)

## 2. Infrastructure — chain, client, auth stub

- [x] 2.1 Define Base mainnet chain (`8453`) + Thirdweb client in `src/lib/chains.ts` (pattern from Reveal/Etherlink demos)
- [x] 2.2 Implement `server/authPlugin.ts` Vite middleware: `GET/POST` challenge, login, session, logout (adapt Reveal `wallet-demo` to Base / `web3-login-ETH` cookie name)
- [x] 2.3 Wire auth plugin in `vite.config.ts`; fail clearly if `JWT_SECRET` missing in dev

## 3. Application features

- [x] 3.1 Session feature: `ensureSession` / logout client helpers calling auth endpoints with credentials
- [x] 3.2 Identity feature: resolve Basename and ENS + avatar with timeouts; merge display name rules (name > truncated address)
- [x] 3.3 Balance feature: read native ETH via RPC/Thirdweb; read ERC-20 `balanceOf` when env configured; format for UI

## 4. Presentation

- [x] 4.1 `Providers` with `ThirdwebProvider`
- [x] 4.2 `ConnectWallet` (MetaMask, Coinbase, Rabby, WalletConnect) pinned to Base
- [x] 4.3 `NetworkGuard` for non-Base warning
- [x] 4.4 `SignInPanel` (connect vs session status, sign-in / logout actions)
- [x] 4.5 `IdentityCard` (name, avatar, address)
- [x] 4.6 `BalancePanel` (native + optional ERC-20)
- [x] 4.7 Compose `App.tsx` as one clear pedagogical screen (not a product dashboard)

## 5. Documentation and hub updates

- [x] 5.1 Write app `README.md` (EN): Connect vs SIWE, setup, endpoints, retargeting chain/token, defense bullets
- [x] 5.2 Update Student Journey `ARCHITECTURE_SDD.md` for this alternate Web3 app
- [x] 5.3 Update `STUDENT_DECISION_LOG.md` (ES) with data-flow, layer justification, Connect vs SIWE explanation, glossary
- [x] 5.4 Link alternate track from `docs/LEARNING_ROADMAP.md` and hub `README.md` (do not fold into academic five-repo scope)
- [x] 5.5 Note publish steps for GitHub repo name `web3-login-ETH`

## 6. Verification gate (pre-archive)

- [x] 6.1a Run unit tests (`npm test`) and production build
- [x] 6.1b Human smoke: connect + SIWE on Base (read-only) — recorded PASS_HUMAN in acceptance-matrix
- [x] 6.2 Ensure author signature + section comments on new TS/TSX files
- [x] 6.3 Confirm no secrets committed

## 7. Adversarial fix-up (post FAIL audit)

- [x] 7.1 Gate Sign-in / Session OK on Base chain id `8453`
- [x] 7.2 Cookie-only session client (no JWT mirror in sessionStorage)
- [x] 7.3 Fail loud when `JWT_SECRET` missing for `npm run dev`
- [x] 7.4 Isolate native vs ERC-20 balance errors
- [x] 7.5 Add timeouts to Basename/ENS viem resolution
- [x] 7.6 Align spec env names to `VITE_TOKEN_*`; add negative unit tests for auth helpers / balance partial failure
- [x] 7.8 BalancePanel: safe token env + catch; distinguish configured vs absent ERC-20
- [x] 7.7 Re-audit after fixes — verdict **PASS WITH GAPS** at re-audit; human smoke **6.1b PASS_HUMAN** before archive
