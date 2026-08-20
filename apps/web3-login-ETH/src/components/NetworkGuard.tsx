//Mariano Montini ('bosque', 'bosquestudio')
import { useActiveWalletChain } from "thirdweb/react";
import { BASE_CHAIN_ID } from "../lib/chains";

// Network guard - warn when connected wallet is not on Base mainnet.
export function NetworkGuard() {
  const chain = useActiveWalletChain();
  if (!chain || chain.id === BASE_CHAIN_ID) return null;

  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
    >
      Wrong network (chain id {chain.id}). Switch to{" "}
      <strong>Base mainnet (8453)</strong> to continue this demo.
    </div>
  );
}
