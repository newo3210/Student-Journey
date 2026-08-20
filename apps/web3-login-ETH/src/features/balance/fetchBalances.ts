//Mariano Montini ('bosque', 'bosquestudio')
import {
  createPublicClient,
  formatUnits,
  http,
  type Address,
  erc20Abi,
} from "viem";
import { base } from "viem/chains";
import {
  parseTokenEnv,
  tokenEnvSchema,
  type TokenEnvConfig,
} from "../../contracts/web3Auth";

// Balance snapshot - native ETH plus optional ERC-20 and config flag.
export type BalanceSnapshot = {
  nativeEth: string;
  token: {
    symbol: string;
    formatted: string;
    address: string;
  } | null;
  tokenConfigured: boolean;
  error: string | null;
};

// Public Base client - shared for balance reads.
function getBaseClient() {
  return createPublicClient({
    chain: base,
    transport: http(import.meta.env.VITE_RPC_URL?.trim() || undefined),
  });
}

// Safe token env from Vite - never throws; invalid config becomes error snapshot input.
export function readTokenEnvFromVite():
  | { ok: true; config: TokenEnvConfig }
  | { ok: false; error: string } {
  const raw = {
    address: import.meta.env.VITE_TOKEN_ADDRESS,
    symbol: import.meta.env.VITE_TOKEN_SYMBOL,
    decimals: import.meta.env.VITE_TOKEN_DECIMALS,
  };
  try {
    const address = raw.address?.trim();
    const symbol = raw.symbol?.trim();
    const parsed = tokenEnvSchema.safeParse({
      address: address || undefined,
      symbol: symbol || undefined,
      decimals: raw.decimals?.trim() || "18",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "invalid token env" };
    }
    return { ok: true, config: parsed.data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "invalid token env",
    };
  }
}

/**
 * Partial ERC-20 failure - keep native ETH, null token, ERC-20-only error.
 */
export function snapshotWithErc20Failure(
  nativeEth: string,
  reason: string,
): BalanceSnapshot {
  return {
    nativeEth,
    token: null,
    tokenConfigured: true,
    error: `ERC-20 balance failed: ${reason}`,
  };
}

/**
 * Fetch balances - native ETH always; ERC-20 when env address is set.
 * Invalid env or ERC-20 failure never hangs the UI caller.
 */
export async function fetchWalletBalances(
  address: string,
  tokenEnv?: TokenEnvConfig,
): Promise<BalanceSnapshot> {
  let config: TokenEnvConfig | undefined = tokenEnv;
  if (config === undefined) {
    const env = readTokenEnvFromVite();
    if (!env.ok) {
      // Still attempt native so the panel is useful.
      try {
        const client = getBaseClient();
        const nativeWei = await client.getBalance({
          address: address as Address,
        });
        return {
          nativeEth: formatUnits(nativeWei, 18),
          token: null,
          tokenConfigured: Boolean(import.meta.env.VITE_TOKEN_ADDRESS?.trim()),
          error: `Invalid VITE_TOKEN_* config: ${env.error}`,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "native balance read failed";
        return {
          nativeEth: "—",
          token: null,
          tokenConfigured: Boolean(import.meta.env.VITE_TOKEN_ADDRESS?.trim()),
          error: `Invalid VITE_TOKEN_* config: ${env.error}; native: ${msg}`,
        };
      }
    }
    config = env.config;
  }

  const client = getBaseClient();
  const addr = address as Address;

  let nativeEth: string;
  try {
    const nativeWei = await client.getBalance({ address: addr });
    nativeEth = formatUnits(nativeWei, 18);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "native balance read failed";
    return {
      nativeEth: "—",
      token: null,
      tokenConfigured: Boolean(config.address),
      error: msg,
    };
  }

  if (!config.address) {
    return { nativeEth, token: null, tokenConfigured: false, error: null };
  }

  try {
    const raw = await client.readContract({
      address: config.address as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addr],
    });

    const decimals = config.decimals;
    const symbol = config.symbol || "TOKEN";
    return {
      nativeEth,
      token: {
        symbol,
        formatted: formatUnits(raw, decimals),
        address: config.address,
      },
      tokenConfigured: true,
      error: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERC-20 balance read failed";
    return snapshotWithErc20Failure(nativeEth, msg);
  }
}

// Re-export parseTokenEnv for tests that construct configs explicitly.
export { parseTokenEnv };
