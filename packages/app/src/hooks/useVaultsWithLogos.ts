import { useQuery } from '@tanstack/react-query'
import { useSdk } from '../context/Sdk'
import { queryKeys } from '../utils/queryKeys'
import { getSvgAsset } from '@/utils/logos'
import { getAddress, type Address } from 'viem'
import { useState } from 'react'

type LoadingState =
  | 'fetching-data'
  | 'generating-urls'
  | 'preloading-images'
  | 'preloading-images-1s'
  | 'preloading-images-2s'
  | 'preloading-images-3s'
  | 'complete'

type VaultWithLogos = {
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
  logos: {
    vault: string
    asset: string
  }
  preloadedImages: {
    vault: HTMLImageElement | null
    asset: HTMLImageElement | null
  }
}

const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // Add a small random delay to stagger requests and avoid overwhelming the server
    const delay = Math.random() * 200 // 0-200ms random delay

    setTimeout(() => {
      // Try without CORS first since most token logo services don't support it
      const img = new Image()

      img.onload = () => {
        console.log('✅ Successfully loaded image:', src)
        resolve(img)
      }

      img.onerror = () => {
        console.log('❌ Complete failure for image, using placeholder:', src)
        // Final fallback to placeholder
        const placeholderImg = new Image()
        placeholderImg.src = '/images/yearn.svg'
        placeholderImg.onload = () => {
          console.log('✅ Loaded placeholder image')
          resolve(placeholderImg)
        }
        placeholderImg.onerror = () =>
          reject(new Error('Failed to load fallback image'))
      }

      img.src = src
    }, delay)
  })
}

export const useVaultsWithLogos = () => {
  const sdk = useSdk()
  const [loadingState, setLoadingState] =
    useState<LoadingState>('fetching-data')

  const query = useQuery({
    queryKey: [...queryKeys.vaults(), 'with-logos'],
    queryFn: async (): Promise<VaultWithLogos[]> => {
      try {
        // Step 1: Fetching data from Kong
        setLoadingState('fetching-data')
        const vaultsData = await sdk.core.kong.getVaultsData()

        // Step 2: Generating logo URLs
        setLoadingState('generating-urls')
        const vaultsWithUrls = vaultsData.map((vault) => {
          const vaultLogoUrl = getSvgAsset(
            vault.chainId,
            getAddress(vault.address)
          )
          const assetLogoUrl = getSvgAsset(
            vault.chainId,
            getAddress(vault.asset.address)
          )

          return {
            ...vault,
            logos: {
              vault: vaultLogoUrl,
              asset: assetLogoUrl,
            },
          }
        })

        // Step 3: Preloading images
        setLoadingState('preloading-images')

        // Add whimsical timing messages
        const timer1 = setTimeout(
          () => setLoadingState('preloading-images-1s'),
          2000
        )
        const timer2 = setTimeout(
          () => setLoadingState('preloading-images-2s'),
          4000
        )
        const timer3 = setTimeout(
          () => setLoadingState('preloading-images-3s'),
          6000
        )

        let vaultsWithLogos: VaultWithLogos[]
        try {
          // Process images in batches to avoid rate limiting
          const BATCH_SIZE = 100 // Process 100 vaults at a time
          const BATCH_DELAY = 500 // 500ms delay between batches

          const results: VaultWithLogos[] = []

          for (let i = 0; i < vaultsWithUrls.length; i += BATCH_SIZE) {
            const batch = vaultsWithUrls.slice(i, i + BATCH_SIZE)

            const batchResults = await Promise.all(
              batch.map(async (vault) => {
                // Preload both images in parallel for each vault
                const [vaultImage, assetImage] = await Promise.allSettled([
                  preloadImage(vault.logos.vault),
                  preloadImage(vault.logos.asset),
                ])

                return {
                  ...vault,
                  preloadedImages: {
                    vault:
                      vaultImage.status === 'fulfilled'
                        ? vaultImage.value
                        : null,
                    asset:
                      assetImage.status === 'fulfilled'
                        ? assetImage.value
                        : null,
                  },
                }
              })
            )

            results.push(...batchResults)

            // Add delay between batches (except for the last batch)
            if (i + BATCH_SIZE < vaultsWithUrls.length) {
              await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
            }
          }

          vaultsWithLogos = results

          // Clear all timers when done
          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)
        } catch (error) {
          // Clear timers on error too
          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)
          throw error
        }

        setLoadingState('complete')
        return vaultsWithLogos
      } catch (error) {
        setLoadingState('complete')
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - logos don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    ...query,
    loadingState: query.isLoading ? loadingState : ('complete' as LoadingState),
  }
}

export type { VaultWithLogos, LoadingState }
