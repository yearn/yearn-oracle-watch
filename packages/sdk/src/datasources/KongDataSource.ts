import { createCachedSdk } from '../graphql/cache'
import type { CachedSdk } from '../graphql/types'
import { getSdk as kong_getSdk } from '../queries/kong/generated'
import { BaseDataSource } from './BaseDataSource'

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

  public async getVaultsData(): Promise<any> {
    const data = await this.gql.GetVaultData()
    return data.vaults
  }
}
