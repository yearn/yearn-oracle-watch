import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { getSvgAsset } from '@/utils/logos'

interface UseTokenImageResult {
  src: string | undefined
  isLoading: boolean
  error: boolean
}

/**
 * Hook to load and cache token images with fallback handling
 * Uses TanStack Query for intelligent caching and error handling
 */
export function useTokenImage(
  chainId: number,
  address: Address
): UseTokenImageResult {
  const imageUrl = getSvgAsset(chainId, address)

  const { data, isLoading, error } = useQuery({
    queryKey: ['token-image', chainId, address.toLowerCase()],
    queryFn: async (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          resolve(imageUrl)
        }

        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }

        // Set crossOrigin to anonymous to handle CORS issues
        img.crossOrigin = 'anonymous'
        img.src = imageUrl
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - images don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once on failure
    retryDelay: 500, // 500ms delay before retry
  })

  return {
    src: data,
    isLoading: isLoading,
    error: !!error,
  }
}
