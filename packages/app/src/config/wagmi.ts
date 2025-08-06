import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { supportedChains } from "./supportedChains";
import { Config, http } from "wagmi";
import { mainnet } from "wagmi/chains";

const name = "yearn-oracle-watch";

export const config: Config = getDefaultConfig({
  appName: name,
  projectId: import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID ?? 'projectId',
  chains: supportedChains,
  transports: {
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com')
  },
  wallets: [{
    groupName: 'Popular',
    wallets: [
      injectedWallet,
      rabbyWallet,
      metaMaskWallet,
      walletConnectWallet,
      rainbowWallet,
      safeWallet
    ]
  }],
})
