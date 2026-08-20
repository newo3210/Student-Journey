## ADDED Requirements

### Requirement: Base wallet connect
The application SHALL allow a user to connect a supported wallet (MetaMask, Coinbase Wallet, Rabby, WalletConnect) pinned to Base mainnet (chain id `8453`) using Thirdweb v5.

#### Scenario: Successful connect on Base
- **WHEN** the user connects a wallet while on Base mainnet (or switches to Base when prompted)
- **THEN** the UI shows the connected address (truncated when no display name) and the app treats Base as the active chain

#### Scenario: Wrong network
- **WHEN** the connected wallet is on a chain other than Base mainnet
- **THEN** the UI shows a clear network warning and does not present a successful authenticated session for Base-gated actions

### Requirement: SIWE session
The application SHALL provide a local auth stub that issues a challenge message embedding a short-lived JWT, accepts `personal_sign`, verifies the signature with viem, and establishes an httpOnly session cookie with session/logout endpoints.

#### Scenario: Sign-in success
- **WHEN** a connected user requests sign-in and signs the challenge message with the matching address
- **THEN** `GET /api/auth/session` reports an authenticated session for that wallet and the UI shows Session OK

#### Scenario: User rejects signature
- **WHEN** the user rejects the signature prompt
- **THEN** no session cookie is established and the UI remains in connected-but-unauthenticated state

#### Scenario: Logout
- **WHEN** an authenticated user logs out
- **THEN** the session cookie is cleared and `GET /api/auth/session` reports unauthenticated

### Requirement: Identity resolution with avatar
The application SHALL resolve a display name from Basename and/or ENS when available, prefer a human-readable name over a truncated address, and show an avatar when the resolution source provides one.

#### Scenario: Name and avatar available
- **WHEN** the connected address resolves to a Basename or ENS name with an avatar
- **THEN** the identity panel shows that name and avatar

#### Scenario: Resolution failure
- **WHEN** Basename and ENS lookups fail or time out
- **THEN** the identity panel shows a truncated address and no broken image placeholder that crashes the UI

### Requirement: Configurable token balances
The application SHALL display the wallet’s native ETH balance on Base and, when `VITE_TOKEN_ADDRESS` (plus `VITE_TOKEN_SYMBOL` / `VITE_TOKEN_DECIMALS`) is configured in environment variables, SHALL also display that ERC-20 balance.

#### Scenario: Native balance
- **WHEN** a wallet is connected on Base
- **THEN** the UI shows a formatted native ETH balance (or an explicit error state if the RPC read fails)

#### Scenario: Optional ERC-20
- **WHEN** env configures a valid ERC-20 token address with symbol and decimals
- **THEN** the UI shows that token’s balance for the connected address in addition to native ETH

#### Scenario: ERC-20 not configured
- **WHEN** ERC-20 env vars are absent
- **THEN** the UI shows only native ETH and does not error

### Requirement: Pedagogical template documentation
The repository SHALL include an English README explaining Connect vs SIWE, env setup, Base chain config, how to point the template at another chain or ERC-20, and oral-defense bullets. Hub root docs SHALL record this alternate Web3 portfolio track.

#### Scenario: New developer onboarding
- **WHEN** a developer follows the README with valid env values
- **THEN** they can run the app locally and complete connect + sign-in without reading source first

#### Scenario: Hub documentation
- **WHEN** this change is completed
- **THEN** `ARCHITECTURE_SDD.md` and `STUDENT_DECISION_LOG.md` at the Student Journey root describe the Web3 template’s layers and flows, and the learning/portfolio docs link `web3-login-ETH` as an alternate track
