// !INJECTED
import { arbitrum, base, gnosis, mainnet, optimism, polygon, sonic } from 'viem/chains'

// !INJECTED
export const supportedChains = [mainnet, optimism, gnosis, polygon, sonic, base, arbitrum] as const

export type SupportedChain = (typeof supportedChains)[number]['id']

export const getSupportedChain = <T extends number>(chainId: T) =>
  supportedChains.find((c) => c.id === chainId)
