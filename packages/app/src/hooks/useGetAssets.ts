import { useQuery } from '@tanstack/react-query'
import { useSdk } from '../context/Sdk'
import { queryKeys } from '../utils/queryKeys'

export const useGetAssets = () => {
  const sdk = useSdk()

  return useQuery({
    queryKey: queryKeys.vaults(),
    queryFn: () => sdk.core.kong.getVaultsData(),
    staleTime: 0, // seconds * millisenconds
    gcTime: 0, // seconds * milliseconds
  })
}
