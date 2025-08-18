import type { QueryClient } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import { GraphQLClient } from 'graphql-request'
import { NetworkError } from '../errors'
import type { SdkConfig, SdkContext } from '../types'

interface DataSource {
  initialize(): Promise<void>
  dispose(): void
}

export abstract class BaseDataSource implements DataSource {
  protected readonly queryClient: QueryClient
  protected readonly wagmiConfig: Config
  protected readonly config: SdkConfig
  protected graphqlClient?: GraphQLClient

  constructor(
    protected readonly context: SdkContext,
    protected readonly sourceName: string,
  ) {
    this.queryClient = context.queryClient
    this.wagmiConfig = context.wagmiConfig
    this.config = context.config
  }

  async initialize(): Promise<void> {
    await this.setupGraphQLClient()
    await this.onInitialize()
  }

  dispose(): void {
    this.onDispose()
    this.graphqlClient = undefined
  }

  protected async setupGraphQLClient(chainId?: number): Promise<void> {
    const endpoint = this.getEndpoint(chainId)
    if (endpoint) {
      this.graphqlClient = new GraphQLClient(endpoint, {
        responseMiddleware: (response) => {
          if (response instanceof Error) {
            throw new NetworkError(
              `GraphQL request failed: ${response.message}`,
              undefined,
              response,
            )
          }
        },
      })
    }
  }

  protected abstract getEndpoint(chainId?: number): string | undefined
  protected abstract onInitialize(): Promise<void>
  protected abstract onDispose(): void

  protected async invalidateQueriesByProperty(property: string, value: any): Promise<void> {
    await this.queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(
          (item: any) =>
            item !== undefined &&
            Object.hasOwnProperty.call(item, property) &&
            item[property] !== value,
        ),
    })
  }
}
