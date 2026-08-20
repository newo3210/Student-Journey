# Acceptance matrix — web3-login-eth

**Date:** 2026-08-20 (updated after adversarial fix loop)  
**Executor:** director session (mechanical + unit evidence); wallet UI smoke requires human

| Spec scenario | How verified | Result | Evidence |
|---|---|---|---|
| Successful connect on Base | Human smoke 2026-08-20 | PASS_HUMAN | User confirmed smoke |
| Wrong network | NetworkGuard + Sign-in disabled off-Base | PASS_CODE | `NetworkGuard.tsx`, `SignInPanel.tsx` |
| Sign-in success | Human smoke 2026-08-20 | PASS_HUMAN | User confirmed Session OK |
| User rejects signature | `ensureWalletSession` returns error | PASS_CODE | `sessionClient.ts` |
| Logout | Clears httpOnly cookie only | PASS_CODE | `fetchLogout` |
| Name and avatar available | Basename then ENS + avatar | PASS_CODE | `resolveIdentity.ts` |
| Resolution failure | Truncated address + timeouts | PASS_UNIT | `truncateAddress`, `withTimeout` tests |
| Native balance | `getBalance` on Base | PASS_CODE | `fetchBalances.ts` |
| Optional ERC-20 | `VITE_TOKEN_*` + `balanceOf` | PASS_UNIT | tests + `fetchBalances.ts` |
| ERC-20 not configured / invalid / partial fail | `tokenConfigured` flag + error paths | PASS_CODE | `BalancePanel.tsx`, `snapshotWithErc20Failure` |
| New developer onboarding | README env table | PASS_DOC | app `README.md` |
| Hub documentation | Root docs + roadmap | PASS_DOC | `ARCHITECTURE_SDD.md`, `STUDENT_DECISION_LOG.md`, `LEARNING_ROADMAP.md` |

## Automated evidence

- `npm test` — 15+ passed (re-run after balance fix)
- `npm run build` — success
- Session model: **cookie-only** (client ignores JSON `access_token`)

## Human remaining (6.1b)

~~Pending~~ — **PASS_HUMAN** (2026-08-20): user confirmed connect + SIWE smoke on Base.
