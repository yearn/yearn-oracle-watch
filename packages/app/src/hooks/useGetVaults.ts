import { useQuery } from '@tanstack/react-query'
import { useSdk } from '../context/Sdk'
import { queryKeys } from '../utils/queryKeys'
import { Address } from 'viem'

export type VaultData = {
  address: Address
  symbol: string
  name: string
  chainId: number
  asset: {
    decimals: number
    address: Address
    name: string
    symbol: string
  }
}

export const useGetVaults = () => {
  const sdk = useSdk()

  return useQuery({
    queryKey: queryKeys.vaults(),
    queryFn: (): Promise<VaultData[]> => sdk.core.kong.getVaultsData(),
    staleTime: 0, // seconds * millisenconds
    gcTime: 0, // seconds * milliseconds
  })
}
