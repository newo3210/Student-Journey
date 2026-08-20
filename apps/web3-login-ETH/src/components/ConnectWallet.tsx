//Mariano Montini ('bosque', 'bosquestudio')
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { baseMainnet, client } from "../lib/chains";

// Wallets - browser extensions plus WalletConnect.
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
  createWallet("walletConnect"),
];

// Connect wallet - Thirdweb ConnectButton pinned to Base mainnet.
export function ConnectWallet() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={baseMainnet}
      theme="dark"
      connectModal={{ title: "Connect on Base" }}
    />
  );
}
