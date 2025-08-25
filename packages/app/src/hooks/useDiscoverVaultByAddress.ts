import { supportedChains } from '@/config/supportedChains'
import { useSdk } from '@/context/Sdk'
import { useQuery } from '@tanstack/react-query'
import { isAddress, getAddress, type Address } from 'viem'
import type { VaultData } from './useGetVaults'

export const useDiscoverVaultByAddress = (addr?: string) => {
  const sdk = useSdk()
  const enabled = Boolean(addr && isAddress(addr))
  const checksum = enabled ? getAddress(addr as Address) : undefined
  const chainIds = supportedChains.map((c) => c.id)

  return useQuery<VaultData[]>({
    queryKey: ['discover-vault', checksum, chainIds.join(',')],
    queryFn: async () => {
      const discovered = await sdk.core.discoverVaultsFromContract(
        checksum as Address,
        chainIds
      )
      // SDK returns VaultData-compatible objects
      return discovered as VaultData[]
    },
    enabled,
    staleTime: 30_000,
  })
}
