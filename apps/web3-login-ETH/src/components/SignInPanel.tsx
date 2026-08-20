//Mariano Montini ('bosque', 'bosquestudio')
import { useEffect, useState } from "react";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import {
  ensureWalletSession,
  fetchLogout,
  hydrateSessionFromServer,
} from "../features/session/sessionClient";
import { BASE_CHAIN_ID } from "../lib/chains";

// Sign-in panel - shows connect vs SIWE session status and actions.
export function SignInPanel() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const onBase = chain?.id === BASE_CHAIN_ID;

  // Session UI state - cookie-backed SIWE status for the connected wallet.
  const [sessionOk, setSessionOk] = useState(false);
  const [sessionWallet, setSessionWallet] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate session cookie when account changes (Base-gated display below).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await hydrateSessionFromServer();
      if (cancelled) return;
      if (s.ok && s.wallet && account?.address.toLowerCase() === s.wallet) {
        setSessionOk(true);
        setSessionWallet(s.wallet);
      } else {
        setSessionOk(false);
        setSessionWallet(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  // Sign-in handler - challenge → personal_sign → session (Base only).
  async function onSignIn() {
    if (!account || !onBase) return;
    setBusy(true);
    setError(null);
    const result = await ensureWalletSession({
      address: account.address,
      signMessage: (opts) => account.signMessage(opts),
    });
    setBusy(false);
    if (!result.ok) {
      setSessionOk(false);
      setError(result.error || "Sign-in failed");
      return;
    }
    setSessionOk(true);
    setSessionWallet(result.wallet ?? account.address.toLowerCase());
  }

  // Logout handler - clear stub httpOnly cookie.
  async function onLogout() {
    setBusy(true);
    await fetchLogout();
    setBusy(false);
    setSessionOk(false);
    setSessionWallet(null);
  }

  // Authenticated success - cookie session AND active Base chain.
  const showSessionOk = sessionOk && onBase;

  if (!account) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Session (SIWE)
        </h2>
        <p className="text-sm text-zinc-400">
          Connect a wallet first. Connect ≠ login: you still need a signed
          challenge for an HTTP session.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Session (SIWE)
      </h2>
      <p className="text-sm text-zinc-300">
        Status:{" "}
        {!onBase ? (
          <span className="font-medium text-amber-300">
            Switch to Base (8453) before sign-in
          </span>
        ) : showSessionOk ? (
          <span className="font-medium text-emerald-400">
            Session OK ({sessionWallet})
          </span>
        ) : (
          <span className="font-medium text-amber-300">
            Connected, not authenticated
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || showSessionOk || !onBase}
          onClick={() => void onSignIn()}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "Working…" : "Sign in"}
        </button>
        <button
          type="button"
          disabled={busy || !showSessionOk}
          onClick={() => void onLogout()}
          className="rounded-md border border-zinc-600 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40"
        >
          Log out
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
