import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Config, http } from 'wagmi'
import {
  mainnet,
  optimism,
  gnosis,
  polygon,
  sonic,
  base,
  arbitrum,
} from 'wagmi/chains'

const name = 'yearn-oracle-watch'

export const config: Config = getDefaultConfig({
  appName: name,
  projectId: import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID ?? 'projectId',
  chains: [mainnet, optimism, gnosis, polygon, sonic, base, arbitrum],
  transports: {
    [mainnet.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_1}`),
    [optimism.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_10}`),
    [gnosis.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_100}`),
    [polygon.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_137}`),
    [sonic.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_146}`),
    [base.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_8453}`),
    [arbitrum.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_42161}`),
  },
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet,
        rabbyWallet,
        metaMaskWallet,
        walletConnectWallet,
        rainbowWallet,
        safeWallet,
      ],
    },
  ],
})
