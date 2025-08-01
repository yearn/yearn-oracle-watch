import _ from 'lodash'
import { BaseDataSource } from './BaseDataSource'

// Price types
export type TPrice = string // Prices come as string numbers (likely in wei)
export type TPrices = Record<string, TPrice> // { tokenAddress: priceString }
export type TPricesChain = Record<string, TPrices> // { chainId: { tokenAddress: priceString } }

export class YDaemonDataSource extends BaseDataSource {
  getEndpoint(_chainId?: number): string {
    return this.config.endpoints.yDaemon
  }

  // No logic needed for REST API
  protected async onInitialize(): Promise<void> {}
  protected async onDispose(): Promise<void> {}

  protected async exampleQuery(): Promise<any> {
    const queryKey = ['yDaemon', 'vaults']

    const result = await this.queryClient.fetchQuery({
      queryKey,
      queryFn: async (): Promise<any> => {
        const params = new URLSearchParams({})
        const response = await fetch(`${this.getEndpoint()}/vaults?${params}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      },
      ...this.context.config.defaultCacheOptions,
    })

    return result
  }

  /**
   * Get all token prices from yDaemon
   * Returns data structured as: { chainId: { tokenAddress: priceString } }
   * Note: Prices are returned as strings in smallest unit (likely 6-8 decimals)
   */
  public async getPrices(): Promise<TPricesChain> {
    const queryKey = ['yDaemon', 'prices']

    const result = await this.queryClient.fetchQuery({
      queryKey,
      queryFn: async (): Promise<TPricesChain> => {
        const response = await fetch(`${this.getEndpoint()}/prices/all`)

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data as TPricesChain
      },
      ...this.context.config.defaultCacheOptions,
    })

    return result as TPricesChain
  }
}
