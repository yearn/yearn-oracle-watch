import { SupportedChain } from '@/config/supportedChains'
import { useSdk } from '@/context/Sdk'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

export interface UseAprOracleParams {
  vault?: {
    address: string
    chainId: number
  }
  delta?: bigint
}

export interface AprOracleResult {
  currentApr: string | null
  projectedApr: string | null
  percentChange: string | null
  isLoading: boolean
  error: Error | null
}

export const useAprOracle = (params?: UseAprOracleParams) => {
  const { vault, delta: inputDelta } = params || {}
  const delta = inputDelta !== undefined ? inputDelta : 0n
  const { address: vaultAddress, chainId } = vault || {}
  const sdk = useSdk()

  return useQuery({
    queryKey: ['apr-oracle', vaultAddress, chainId, Number(delta)],
    queryFn: () =>
      sdk.core.getAprOracleData(
        vaultAddress as Address,
        chainId as SupportedChain,
        delta || 0n
      ),
    enabled: !!vaultAddress && !!chainId && delta !== undefined,
    staleTime: 30_000, // 30 seconds
  })
}
