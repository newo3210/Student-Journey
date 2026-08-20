//Mariano Montini ('bosque', 'bosquestudio')
import { sessionResponseSchema } from "../../contracts/web3Auth";

// Signer account - minimal shape compatible with thirdweb Account.
export type WalletSignerAccount = {
  address: string;
  signMessage: (opts: { message: string }) => Promise<string>;
};

// Logout - clear httpOnly session cookie on the auth stub.
export async function fetchLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }
}

// Hydrate - cookie session only; ignore any access_token in JSON.
export async function hydrateSessionFromServer(): Promise<{
  ok: boolean;
  wallet?: string;
}> {
  try {
    const r = await fetch("/api/auth/session", { credentials: "include" });
    const j = sessionResponseSchema.parse(await r.json());
    if (j.ok && j.wallet) {
      return { ok: true, wallet: j.wallet.toLowerCase() };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

/**
 * Ensure session - challenge → personal_sign → httpOnly cookie.
 * Client ignores access_token in JSON; auth is cookie-only.
 */
export async function ensureWalletSession(
  account: WalletSignerAccount,
): Promise<{ ok: boolean; wallet?: string; error?: string }> {
  const addr = account.address.toLowerCase();
  try {
    const r = await fetch("/api/auth/session", { credentials: "include" });
    const s = sessionResponseSchema.parse(await r.json());
    if (s.ok && s.wallet?.toLowerCase() === addr) {
      return { ok: true, wallet: addr };
    }

    const ch = await fetch(
      `/api/auth/challenge?address=${encodeURIComponent(account.address)}`,
      { credentials: "include" },
    );
    if (!ch.ok) return { ok: false, error: "challenge request failed" };
    const chBody = (await ch.json()) as { message?: string; error?: string };
    if (typeof chBody.message !== "string") {
      return { ok: false, error: chBody.error || "no challenge message" };
    }

    const signature = await account.signMessage({ message: chBody.message });
    const login = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: account.address,
        message: chBody.message,
        signature,
      }),
    });
    const body = sessionResponseSchema.parse(await login.json());
    if (!login.ok || !body.ok) {
      return { ok: false, error: body.error || "login failed" };
    }
    return { ok: true, wallet: addr };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ensure session failed";
    return { ok: false, error: msg };
  }
}
