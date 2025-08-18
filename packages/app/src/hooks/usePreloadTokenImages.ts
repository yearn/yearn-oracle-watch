import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { type VaultData } from '@/hooks/useGetVaults'
import { getSvgAsset } from '@/utils/logos'

/**
 * Hook to preload token images in the background
 * Works with the existing useTokenImage cache system
 */
export function usePreloadTokenImages(vaults: VaultData[]) {
  const queryClient = useQueryClient()
  const preloadedSet = useRef(new Set<string>())

  useEffect(() => {
    if (!vaults || vaults.length === 0) return

    // Create a function to preload a single image
    const preloadImage = async (chainId: number, address: string) => {
      const imageUrl = getSvgAsset(chainId, address as `0x${string}`)
      const queryKey = ['token-image', chainId, address.toLowerCase()]

      // Skip if already cached or being preloaded
      const cacheKey = `${chainId}-${address.toLowerCase()}`
      if (preloadedSet.current.has(cacheKey)) return

      // Check if already in cache
      const cachedData = queryClient.getQueryData(queryKey)
      if (cachedData) return

      // Mark as being preloaded
      preloadedSet.current.add(cacheKey)

      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: async (): Promise<string> => {
            return new Promise((resolve, reject) => {
              const img = new Image()

              img.onload = () => resolve(imageUrl)
              img.onerror = () => reject(new Error('Failed to load image'))

              img.crossOrigin = 'anonymous'
              img.src = imageUrl
            })
          },
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
        })
      } catch (error) {
        // Silently fail - the useTokenImage hook will handle errors when needed
        console.debug(`Failed to preload image for ${address}:`, error)
      }
    }

    // Batch preloading to avoid overwhelming the server
    const batchSize = 15 // Increased batch size slightly for better performance
    const delay = 150 // Slightly longer delay to be server-friendly

    const preloadInBatches = async () => {
      console.log(
        `Starting to preload ${vaults.length} token images in batches of ${batchSize}`
      )

      for (let i = 0; i < vaults.length; i += batchSize) {
        const batch = vaults.slice(i, i + batchSize)

        // Preload all images in this batch concurrently
        await Promise.allSettled(
          batch.map((vault) => preloadImage(vault.chainId, vault.asset.address))
        )

        // Add delay between batches (except for the last batch)
        if (i + batchSize < vaults.length) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }

      console.log('Finished preloading token images')
    }

    // Start preloading after a short delay to not block initial render
    const timeoutId = setTimeout(preloadInBatches, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [vaults, queryClient])
}
