//Mariano Montini ('bosque', 'bosquestudio')
import { createPublicClient, http, type Address } from "viem";
import { base, mainnet } from "viem/chains";
import { getEnsAvatar, getEnsName } from "viem/actions";
import { truncateAddress } from "../../contracts/web3Auth";
import { withTimeout } from "../../lib/withTimeout";

// Identity result - display name source plus optional avatar URL.
export type IdentityResult = {
  displayName: string;
  ensName: string | null;
  basename: string | null;
  avatarUrl: string | null;
  source: "basename" | "ens" | "address";
};

type EnsIdeasPayload = {
  name?: string | null;
  avatar?: string | null;
};

// Identity RPC deadline - Basename / ENS viem calls (~3s).
const IDENTITY_TIMEOUT_MS = 3000;

// Base public client - Basename reverse lookups via ENSIP on Base.
const baseClient = createPublicClient({
  chain: base,
  transport: http(import.meta.env.VITE_RPC_URL?.trim() || undefined),
});

// Mainnet public client - classic ENS reverse + avatar.
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Resolve via ENS Ideas - public API used in Etherlink demos (no API key).
async function resolveEnsIdeas(address: string): Promise<{
  name: string | null;
  avatar: string | null;
}> {
  try {
    const res = await fetch(
      `https://api.ensideas.com/ens/resolve/${address}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return { name: null, avatar: null };
    const data = (await res.json()) as EnsIdeasPayload;
    return {
      name: typeof data?.name === "string" ? data.name : null,
      avatar: typeof data?.avatar === "string" ? data.avatar : null,
    };
  } catch {
    return { name: null, avatar: null };
  }
}

// Resolve Basename - viem getEnsName against Base chain (timed).
async function resolveBasename(address: Address): Promise<{
  name: string | null;
  avatar: string | null;
}> {
  try {
    const name = await withTimeout(
      getEnsName(baseClient, { address }),
      IDENTITY_TIMEOUT_MS,
      "Basename lookup",
    );
    if (!name) return { name: null, avatar: null };
    let avatar: string | null = null;
    try {
      avatar =
        (await withTimeout(
          getEnsAvatar(baseClient, { name }),
          IDENTITY_TIMEOUT_MS,
          "Basename avatar",
        )) ?? null;
    } catch {
      avatar = null;
    }
    return { name, avatar };
  } catch {
    return { name: null, avatar: null };
  }
}

// Resolve classic ENS - mainnet reverse + avatar, with ensideas fallback.
async function resolveEns(address: Address): Promise<{
  name: string | null;
  avatar: string | null;
}> {
  try {
    const name = await withTimeout(
      getEnsName(mainnetClient, { address }),
      IDENTITY_TIMEOUT_MS,
      "ENS lookup",
    );
    if (name) {
      let avatar: string | null = null;
      try {
        avatar =
          (await withTimeout(
            getEnsAvatar(mainnetClient, { name }),
            IDENTITY_TIMEOUT_MS,
            "ENS avatar",
          )) ?? null;
      } catch {
        avatar = null;
      }
      if (avatar) return { name, avatar };
      const ideas = await resolveEnsIdeas(address);
      return { name, avatar: ideas.avatar };
    }
  } catch {
    /* fall through to ensideas */
  }
  return resolveEnsIdeas(address);
}

/**
 * Resolve identity - prefer Basename on Base, then ENS, then truncated address.
 * Avatars follow the winning name source when available.
 */
export async function resolveWalletIdentity(
  address: string,
): Promise<IdentityResult> {
  const addr = address as Address;
  const [basename, ens] = await Promise.all([
    resolveBasename(addr),
    resolveEns(addr),
  ]);

  if (basename.name) {
    return {
      displayName: basename.name,
      ensName: ens.name,
      basename: basename.name,
      avatarUrl: basename.avatar || ens.avatar,
      source: "basename",
    };
  }

  if (ens.name) {
    return {
      displayName: ens.name,
      ensName: ens.name,
      basename: null,
      avatarUrl: ens.avatar,
      source: "ens",
    };
  }

  return {
    displayName: truncateAddress(address),
    ensName: null,
    basename: null,
    avatarUrl: null,
    source: "address",
  };
}
