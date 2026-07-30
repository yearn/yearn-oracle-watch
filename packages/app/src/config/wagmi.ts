import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { fallback, http } from 'viem'
import { Config } from 'wagmi'
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
import { resolveRpcUrls } from './rpc'

const name = 'yearn-oracle-watch'
const createRpcTransport = (
  configuredUrl: string | undefined,
  publicUrl: string,
  chainDefaultUrl: string,
) => fallback(resolveRpcUrls(configuredUrl, publicUrl, chainDefaultUrl).map((url) => http(url)))

export const config: Config = getDefaultConfig({
  appName: name,
  projectId: import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID ?? 'projectId',
  chains: [mainnet, optimism, gnosis, polygon, sonic, base, arbitrum, katana],
  transports: {
    [mainnet.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_1,
      'https://ethereum-rpc.publicnode.com',
      mainnet.rpcUrls.default.http[0],
    ),
    [optimism.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_10,
      'https://optimism-rpc.publicnode.com',
      optimism.rpcUrls.default.http[0],
    ),
    [gnosis.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_100,
      'https://gnosis-rpc.publicnode.com',
      gnosis.rpcUrls.default.http[0],
    ),
    [polygon.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_137,
      'https://polygon-bor-rpc.publicnode.com',
      polygon.rpcUrls.default.http[0],
    ),
    [sonic.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_146,
      'https://sonic-rpc.publicnode.com',
      sonic.rpcUrls.default.http[0],
    ),
    [base.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_8453,
      'https://base-rpc.publicnode.com',
      base.rpcUrls.default.http[0],
    ),
    [arbitrum.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_42161,
      'https://arbitrum-one-rpc.publicnode.com',
      arbitrum.rpcUrls.default.http[0],
    ),
    [katana.id]: createRpcTransport(
      import.meta.env.VITE_RPC_URI_FOR_747474,
      katana.rpcUrls.default.http[0],
      katana.rpcUrls.default.http[0],
    ),
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
