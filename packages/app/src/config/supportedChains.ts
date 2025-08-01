// !INJECTED
import { mainnet, polygon, optimism } from 'viem/chains'

// !INJECTED
export const supportedChains = [mainnet, polygon, optimism] as const

export type SupportedChain = (typeof supportedChains)[number]['id']

export const getSupportedChain = <T extends number>(chainId: T) =>
  supportedChains.find((c) => c.id === chainId)
