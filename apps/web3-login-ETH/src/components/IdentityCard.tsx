//Mariano Montini ('bosque', 'bosquestudio')
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import {
  resolveWalletIdentity,
  type IdentityResult,
} from "../features/identity/resolveIdentity";

// Identity card - Basename/ENS/avatar or truncated address fallback.
export function IdentityCard() {
  const account = useActiveAccount();
  const [identity, setIdentity] = useState<IdentityResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account?.address) {
      setIdentity(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void resolveWalletIdentity(account.address).then((result) => {
      if (cancelled) return;
      setIdentity(result);
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
          Identity
        </h2>
        <p className="text-sm text-zinc-500">No wallet connected.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Identity
      </h2>
      {loading || !identity ? (
        <p className="text-sm text-zinc-500">Resolving Basename / ENS…</p>
      ) : (
        <div className="flex items-center gap-4">
          {identity.avatarUrl ? (
            <img
              src={identity.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover ring-1 ring-zinc-600"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500"
            >
              —
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-zinc-50">
              {identity.displayName}
            </p>
            <p className="font-mono text-xs text-zinc-500">{account.address}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
              source: {identity.source}
              {identity.basename ? ` · basename ${identity.basename}` : ""}
              {identity.ensName ? ` · ens ${identity.ensName}` : ""}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
