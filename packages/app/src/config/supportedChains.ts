// !INJECTED
import {
  mainnet,
  polygon,
  gnosis,
  optimism,
  sonic,
  base,
  arbitrum,
} from 'viem/chains'

// !INJECTED
export const supportedChains = [
  mainnet,
  polygon,
  optimism,
  gnosis,
  sonic,
  base,
  arbitrum,
] as const

export type SupportedChain = (typeof supportedChains)[number]['id']

export const getSupportedChain = <T extends number>(chainId: T) =>
  supportedChains.find((c) => c.id === chainId)
