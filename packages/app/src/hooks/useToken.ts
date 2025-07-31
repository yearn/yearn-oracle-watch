import { erc20Abi } from '@yearn-oracle-watch/contracts'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export interface Token {
  address?: Address
  decimals?: number
  symbol?: string
  name?: string
}

export const useToken = (address?: Address) => {
  const {
    data: [decimals, symbol, name] = [],
    isLoading,
  } = useReadContracts({
    allowFailure: false,
    contracts: !!address
      ? [
          {
            address: address,
            abi: erc20Abi,
            functionName: 'decimals',
          },
          {
            address: address,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: address,
            abi: erc20Abi,
            functionName: 'name',
          },
        ]
      : undefined,
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      enabled: !!address,
    },
    scopeKey: `useToken.${address?.toLowerCase()}`,
  })

  const token: Token = {
    address: address,
    decimals,
    symbol,
    name,
  }

  return { token, isLoading }
}
