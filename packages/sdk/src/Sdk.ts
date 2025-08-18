import type { QueryClient } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import { CoreDataSource } from './datasources/CoreDataSource'
import { SdkConfig, SdkContext } from './types'

export class Sdk {
  private readonly queryClient: QueryClient
  private readonly wagmiConfig: Config
  private readonly config: SdkConfig
  private readonly context: SdkContext

  public readonly core: CoreDataSource
  private initialized = false

  constructor(queryClient: QueryClient, wagmiConfig: Config, config?: Partial<SdkConfig>) {
    this.queryClient = queryClient
    this.wagmiConfig = wagmiConfig
    this.config = this.validateAndMergeConfig(config)

    this.context = {
      queryClient: this.queryClient,
      wagmiConfig: this.wagmiConfig,
      config: this.config,
    }

    this.core = new CoreDataSource(this.context)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    await this.core.initialize()
    this.initialized = true
  }

  dispose(): void {
    this.core.dispose()
    this.initialized = false
  }

  isInitialized(): boolean {
    return this.initialized
  }

  private validateAndMergeConfig(config?: Partial<SdkConfig>): SdkConfig {
    const defaultConfig: SdkConfig = {
      endpoints: {
        kong: 'https://kong.yearn.farm/api/gql',
        yDaemon: 'https://ydaemon.yearn.fi',
      },
      defaultCacheOptions: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    }

    return {
      ...defaultConfig,
      ...config,
      endpoints: {
        ...defaultConfig.endpoints,
        ...config?.endpoints,
      },
      defaultCacheOptions: {
        ...defaultConfig.defaultCacheOptions,
        ...config?.defaultCacheOptions,
      },
    }
  }

  static create(queryClient: QueryClient, wagmiConfig: Config, config?: Partial<SdkConfig>): Sdk {
    const sdk = new Sdk(queryClient, wagmiConfig, config)
    sdk.initialize().catch(console.error)
    return sdk
  }
}
