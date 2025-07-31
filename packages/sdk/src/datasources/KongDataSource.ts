import { Address } from 'viem'
import { createCachedSdk } from '../graphql/cache'
import type { CachedSdk } from '../graphql/types'
import { getSdk as kong_getSdk } from '../queries/kong/generated'
import { BaseDataSource } from './BaseDataSource'

type NonNullableVaultData = {
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

export class KongDataSource extends BaseDataSource {
  private gql!: CachedSdk<typeof kong_getSdk>

  protected getEndpoint(): string | undefined {
    return this.config.endpoints.kong
  }

  protected async onInitialize(): Promise<void> {
    if (!this.graphqlClient) {
      throw new Error('GraphQL client not initialized')
    }
    this.gql = createCachedSdk(
      this.sourceName,
      kong_getSdk,
      this.graphqlClient,
      this.queryClient
    )
  }

  protected onDispose(): void {}

  public async getVaultsData(): Promise<NonNullableVaultData[]> {
    const data = await this.gql.GetVaultData()
    return (data.vaults || [])
      .filter((vault): vault is NonNullable<typeof vault> => vault !== null)
      .map((vault) => ({
        address: (vault.address || '') as Address,
        symbol: vault.symbol || '',
        name: vault.name || '',
        chainId: vault.chainId || 0,
        asset: {
          decimals: vault.asset?.decimals || 0,
          address: (vault.asset?.address || '') as Address,
          name: vault.asset?.name || '',
          symbol: vault.asset?.symbol || '',
        },
      }))
  }
}
