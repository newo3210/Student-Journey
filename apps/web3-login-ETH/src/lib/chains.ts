//Mariano Montini ('bosque', 'bosquestudio')
import { createThirdwebClient, defineChain } from "thirdweb";

// Base mainnet RPC - public default; override with VITE_RPC_URL.
const baseRpc =
  import.meta.env.VITE_RPC_URL?.trim() || "https://mainnet.base.org";

// Base mainnet chain - id 8453 for connect + reads.
export const baseMainnet = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [baseRpc] },
  },
  blockExplorers: {
    default: { name: "Basescan", url: "https://basescan.org" },
  },
  testnet: false,
});

// Thirdweb client - public client id from dashboard (never commit secrets).
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "no-client-id",
});

export const BASE_CHAIN_ID = 8453;
