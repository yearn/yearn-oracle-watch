import { createContext } from 'react'
import type { Chain } from 'wagmi/chains'

export type ChainsContextType<T = number> = {
  chains: Chain[]
  active: Chain | undefined
  chainId: T
  getChainFromId(chainId: number): Chain | undefined
  switchNetwork?(chainId?: number): void
  isConnectedToNetwork(chainOrChainId: Chain | number): boolean
  isConnectedChainValid: boolean
  isMainnet: boolean
  isConnected: boolean
}

export function createChainsContext<T = number>() {
  return createContext<ChainsContextType<T>>({} as never)
}
