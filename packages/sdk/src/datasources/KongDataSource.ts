/**
 * Removes vaults from the array that have chainIds matching any in the excludeChainIds array.
 * @param vaults Array of NonNullableVaultData
 * @param excludeChainIds Array of chain IDs to exclude
 * @returns Filtered array of vaults
 */
export function filterVaultsByChainIds(
  vaults: NonNullableVaultData[],
  excludeChainIds: number[],
): NonNullableVaultData[] {
  return vaults.filter((vault) => !excludeChainIds.includes(vault.chainId))
}
import { Address } from 'viem'
import { createCachedSdk } from '../graphql/cache'
import type { CachedSdk } from '../graphql/types'
import { getSdk as kong_getSdk } from '../queries/kong/generated'
import { getVaultDisplayName, getVaultIconAddress } from '../utils/featuredVaults'
import { BaseDataSource } from './BaseDataSource'

export type VaultCategory = 'allocator' | 'strategy'

export type NonNullableVaultData = {
  address: Address
  symbol: string
  name: string
  chainId: number
  category: VaultCategory
  iconAddress: Address
  asset: {
    decimals: number
    address: Address
    name: string
    symbol: string
  }
}

export const getVaultCategory = (kind?: string | null): VaultCategory =>
  kind?.toLowerCase().includes('single') ? 'strategy' : 'allocator'

export const isSelectableVaultMeta = (
  meta?: { isHidden?: boolean | null; isRetired?: boolean | null } | null,
): boolean => !meta?.isHidden && !meta?.isRetired

export class KongDataSource extends BaseDataSource {
  private gql!: CachedSdk<typeof kong_getSdk>

  protected getEndpoint(): string | undefined {
    return this.config.endpoints.kong
  }

  protected async onInitialize(): Promise<void> {
    if (!this.graphqlClient) {
      throw new Error('GraphQL client not initialized')
    }
    this.gql = createCachedSdk(this.sourceName, kong_getSdk, this.graphqlClient, this.queryClient)
  }

  protected onDispose(): void {}

  public async getVaultsData(): Promise<NonNullableVaultData[]> {
    const data = await this.gql.GetVaultData()
    const vaults = (data.vaults || [])
      .filter((vault): vault is NonNullable<typeof vault> => vault !== null)
      .filter((vault) => isSelectableVaultMeta(vault.meta))
      .map((vault) => {
        const address = (vault.address || '') as Address
        const chainId = vault.chainId || 0
        const assetAddress = (vault.asset?.address || '') as Address

        return {
          address,
          symbol: vault.symbol || '',
          name: getVaultDisplayName(chainId, address, vault.name || ''),
          chainId,
          category: getVaultCategory(vault.meta?.kind),
          iconAddress: getVaultIconAddress(chainId, address, assetAddress),
          asset: {
            decimals: vault.asset?.decimals || 0,
            address: assetAddress,
            name: vault.asset?.name || '',
            symbol: vault.asset?.symbol || '',
          },
        }
      })
    return filterVaultsByChainIds(vaults, [250])
  }
}
