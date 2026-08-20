//Mariano Montini ('bosque', 'bosquestudio')
import { ConnectWallet } from "./components/ConnectWallet";
import { NetworkGuard } from "./components/NetworkGuard";
import { SignInPanel } from "./components/SignInPanel";
import { IdentityCard } from "./components/IdentityCard";
import { BalancePanel } from "./components/BalancePanel";

// App shell - one pedagogical screen: connect, identity, balances, SIWE.
export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            web3-login-ETH
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Base wallet login template
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400">
            Pedagogical demo: connect on Base, resolve Basename/ENS + avatar,
            read ETH (and optional ERC-20), then SIWE sign-in for an HTTP
            session. Fork this for other dapps.
          </p>
          <div className="pt-2">
            <ConnectWallet />
          </div>
        </header>

        <NetworkGuard />
        <IdentityCard />
        <BalancePanel />
        <SignInPanel />

        <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
          Connect proves a provider link. SIWE proves key ownership to your
          server. Auth stub is local Vite middleware — not production hardening.
        </footer>
      </div>
    </div>
  );
}
