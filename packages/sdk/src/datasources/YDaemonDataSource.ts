import _ from 'lodash'
import { BaseDataSource } from './BaseDataSource'

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
}
