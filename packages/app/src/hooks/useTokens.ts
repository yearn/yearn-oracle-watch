import { erc20Abi } from '@yearn-oracle-watch/contracts'
import { chunk } from 'lodash'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export interface Token {
  address?: Address
  decimals?: number
  symbol?: string
  name?: string
}

export const useTokens = (addresses: (Address | undefined)[]) => {
  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: addresses?.flatMap((address) => [
      {
        address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'name',
      },
    ]),
    query: {
      staleTime: 1000 * 60 * 1000, // 1000 mins
      enabled: !!addresses && addresses.length > 0,
    },
    scopeKey: `useTokens.${addresses?.map((a) => a?.toLowerCase()).join('.')}`,
  })

  const tokens: Token[] =
    addresses && data
      ? chunk(data, 3).map(([decimals, symbol, name], index) => ({
          address: addresses[index],
          decimals: Number(decimals),
          symbol: String(symbol),
          name: String(name),
        }))
      : []

  return { tokens, isLoading }
}
