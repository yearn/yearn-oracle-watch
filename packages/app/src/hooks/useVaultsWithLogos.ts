import { useQuery } from '@tanstack/react-query'
import { useSdk } from '../context/Sdk'
import { queryKeys } from '../utils/queryKeys'
import { getSvgAsset } from '@/utils/logos'
import { getAddress, type Address } from 'viem'

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
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = () => {
      const placeholder = new Image()
      placeholder.src = '/images/yearn.svg'
      resolve(placeholder)
    }
    
    img.src = src
  })
}

export const useVaultsWithLogos = () => {
  const sdk = useSdk()

  return useQuery({
    queryKey: [...queryKeys.vaults(), 'with-logos'],
    queryFn: async (): Promise<VaultWithLogos[]> => {
      const vaultsData = await sdk.core.kong.getVaultsData()

      return Promise.all(
        vaultsData.map(async (vault) => {
          const logos = {
            vault: getSvgAsset(vault.chainId, getAddress(vault.address)),
            asset: getSvgAsset(vault.chainId, getAddress(vault.asset.address)),
          }

          const [vaultImage, assetImage] = await Promise.allSettled([
            preloadImage(logos.vault),
            preloadImage(logos.asset),
          ])

          return {
            ...vault,
            logos,
            preloadedImages: {
              vault: vaultImage.status === 'fulfilled' ? vaultImage.value : null,
              asset: assetImage.status === 'fulfilled' ? assetImage.value : null,
            },
          }
        })
      )
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export type { VaultWithLogos }
