//Mariano Montini ('bosque', 'bosquestudio')
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import {
  fetchWalletBalances,
  type BalanceSnapshot,
} from "../features/balance/fetchBalances";

// Balance panel - native ETH plus optional ERC-20 from env.
export function BalancePanel() {
  const account = useActiveAccount();
  const [snapshot, setSnapshot] = useState<BalanceSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account?.address) {
      setSnapshot(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchWalletBalances(account.address)
      .then((result) => {
        if (cancelled) return;
        setSnapshot(result);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "balance read failed";
        setSnapshot({
          nativeEth: "—",
          token: null,
          tokenConfigured: false,
          error: msg,
        });
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  if (!account) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Balances
        </h2>
        <p className="text-sm text-zinc-500">Connect to read Base balances.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Balances (Base)
      </h2>
      {loading || !snapshot ? (
        <p className="text-sm text-zinc-500">Reading chain…</p>
      ) : (
        <ul className="space-y-2 text-sm text-zinc-200">
          <li>
            <span className="text-zinc-500">ETH · </span>
            {snapshot.nativeEth}
          </li>
          {snapshot.token ? (
            <li>
              <span className="text-zinc-500">{snapshot.token.symbol} · </span>
              {snapshot.token.formatted}
              <span className="ml-2 font-mono text-xs text-zinc-600">
                {snapshot.token.address}
              </span>
            </li>
          ) : snapshot.tokenConfigured ? (
            <li className="text-zinc-500">ERC-20 configured but unavailable.</li>
          ) : (
            <li className="text-zinc-500">
              No ERC-20 configured (set{" "}
              <code className="text-zinc-400">VITE_TOKEN_ADDRESS</code>).
            </li>
          )}
          {snapshot.error ? (
            <li className="text-red-400">Error: {snapshot.error}</li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
