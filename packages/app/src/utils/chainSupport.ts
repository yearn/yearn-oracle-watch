import { supportedChains } from '@/config/supportedChains'

export function isChainSupported(chainId: number): boolean {
  return supportedChains.some((chain) => chain.id === chainId)
}
