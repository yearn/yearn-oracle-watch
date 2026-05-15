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
  arbitrum,
  base,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sonic,
} from 'wagmi/chains'
import { katana } from './katana'

const name = 'yearn-oracle-watch'

export const config: Config = getDefaultConfig({
  appName: name,
  projectId: import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID ?? 'projectId',
  chains: [mainnet, optimism, gnosis, polygon, sonic, base, arbitrum, katana],
  transports: {
    [mainnet.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_1}`),
    [optimism.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_10}`),
    [gnosis.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_100}`),
    [polygon.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_137}`),
    [sonic.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_146}`),
    [base.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_8453}`),
    [arbitrum.id]: http(`${import.meta.env.VITE_RPC_URI_FOR_42161}`),
    [katana.id]: http(import.meta.env.VITE_RPC_URI_FOR_747474 ?? 'https://rpc.katana.network'),
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
