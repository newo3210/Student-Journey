# web3-login-ETH

Pedagogical **Base mainnet** template: wallet connect (Thirdweb v5), Basename/ENS + avatar, native ETH + optional ERC-20 balances, and **SIWE** session via a local Vite auth stub.

GitHub target name: **`web3-login-ETH`**. Hub path: `apps/web3-login-ETH/` inside Student Journey.

## Connect vs SIWE

| Step | What it proves | Gas? |
| --- | --- | --- |
| **Connect** | Browser ↔ wallet provider; you see an address on a chain | No |
| **SIWE** | Cryptographic proof of address ownership for your **HTTP API** (challenge → `personal_sign` → session JWT cookie) | No |

A connected wallet alone is **not** a server login. Anyone can display an address in the UI. The signature binds the session to a private key.

## Quick start

```bash
cp .env.example .env
# set VITE_THIRDWEB_CLIENT_ID + JWT_SECRET
npm install
npm run dev
```

Open `http://localhost:5173`.

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_THIRDWEB_CLIENT_ID` | Yes | [thirdweb dashboard](https://thirdweb.com/dashboard) |
| `JWT_SECRET` | Yes (local) | Long random string; never commit real values |
| `VITE_RPC_URL` | No | Defaults to public Base RPC |
| `VITE_TOKEN_ADDRESS` | No | Optional ERC-20 on Base |
| `VITE_TOKEN_SYMBOL` | No | Display symbol |
| `VITE_TOKEN_DECIMALS` | No | Defaults to 18 |

## Auth endpoints (Vite middleware)

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/api/auth/challenge?address=` | Message to sign |
| `POST` | `/api/auth/login` | Verify signature → httpOnly cookie |
| `GET` | `/api/auth/session` | Current session |
| `POST` | `/api/auth/logout` | Clear cookie |

Implementation: `server/authPlugin.ts`.

## Layers

| Layer | Path |
| --- | --- |
| Presentation | `src/components/`, `src/App.tsx` |
| Application | `src/features/session/`, `identity/`, `balance/` |
| Infrastructure | `src/lib/chains.ts`, `server/authPlugin.ts`, RPC/ENS I/O |
| Contracts | `src/contracts/web3Auth.ts` (Zod) |

## Retarget for another project

1. **Chain** — edit `src/lib/chains.ts` (`defineChain` id + RPC).
2. **Token** — set `VITE_TOKEN_*` for any ERC-20, or extend `fetchBalances.ts`.
3. **Auth branding** — change challenge message text in `server/authPlugin.ts`.
4. **Production** — replace the Vite stub with a real API (rate limits, durable secrets, HTTPS cookies).

## Scripts

```bash
npm test      # Vitest unit tests
npm run build # typecheck + production bundle
```

## Oral defense bullets

- Why Connect ≠ SIWE for APIs
- Why Base mainnet for this demo and how balances stay read-only
- Where Zod schemas sit at auth/token boundaries
- How Basename vs ENS resolution falls back to a truncated address

## License

MIT — use as a portfolio template.

## Warning

Base **mainnet** uses real funds. This app does **not** send transfers; still treat wallet prompts carefully.
