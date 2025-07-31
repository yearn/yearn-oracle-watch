import { FetchQueryOptions } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { Config } from '@wagmi/core'

export interface SdkConfig {
  endpoints: {
    kong: string
    yDaemon: string
  }
  defaultCacheOptions?: Partial<FetchQueryOptions>
}

export interface SdkContext {
  queryClient: QueryClient
  wagmiConfig: Config
  config: SdkConfig
}
