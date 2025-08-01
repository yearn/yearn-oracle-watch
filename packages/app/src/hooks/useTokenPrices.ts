import { useSdk } from '../context/Sdk'
import { useQuery } from '@tanstack/react-query'
import type { TPricesChain } from '@yearn-oracle-watch/sdk'

export const useTokenPrices = () => {
  const sdk = useSdk()
  return useQuery({
    queryKey: ['tokenPrices'],
    queryFn: () => sdk.core.yDaemon.getPrices(),
    staleTime: 30_000, // 30 seconds
  })
}

export const findTokenPrice = (
  prices: TPricesChain,
  address: string,
  chainId: number
): number | null => {
  const chainPrices = prices[chainId.toString()]
  if (!chainPrices) return null

  // Try original case first, then lowercase
  let priceString = chainPrices[address] || chainPrices[address.toLowerCase()]

  if (!priceString) {
    console.log(`No price found for ${address} on chain ${chainId}`)
    console.log('Available addresses:', Object.keys(chainPrices).slice(0, 5))
    return null
  }

  // Convert from smallest unit (typically 6 decimals for USD prices)
  return parseFloat(priceString) / 1_000_000
}
