import { queryClient } from '@/context/queryClient'
import { queryHelpers } from '@/utils/queryKeys'
import { FC, useEffect, useRef } from 'react'
import { useChainId } from 'wagmi'

export const ChainChangeListener: FC = () => {
  const chainId = useChainId()
  const previousChainId = useRef<number | null>(null)

  useEffect(() => {
    // Don't clear on initial load
    if (previousChainId.current === null) {
      previousChainId.current = chainId
      return
    }

    // Only clear if chain actually changed
    if (previousChainId.current !== chainId) {
      // Clear all chain-dependent queries using centralized helper
      queryHelpers.clearChainQueries(queryClient)

      console.log(
        `Chain changed from ${previousChainId.current} to ${chainId}, cleared chain-dependent queries`,
      )
      previousChainId.current = chainId
    }
  }, [chainId])

  return null
}
