import type { FetchQueryOptions, QueryClient } from '@tanstack/query-core'
import type { GraphQLClient } from 'graphql-request'

export type SdkFactory<T = any> = (client: GraphQLClient) => T

export type AddFetchQueryOptions<TTarget> = {
  [K in keyof TTarget]: TTarget[K] extends (...args: infer A) => infer R
    ? (...args: [...A, fetchQueryOptions?: Partial<FetchQueryOptions>]) => R
    : TTarget[K]
}

export type CachedSdk<TFactory extends SdkFactory> = AddFetchQueryOptions<ReturnType<TFactory>>

export function createCachedSdk<TFactory extends SdkFactory>(
  sourceName: string,
  factory: TFactory,
  client: GraphQLClient,
  queryClient: QueryClient,
): CachedSdk<TFactory> {
  const sdk = factory(client)

  const methods = Object.entries(sdk).filter(([, value]) => typeof value === 'function') as [
    string,
    (...args: any[]) => any,
  ][]

  methods.forEach(([methodName, method]) => {
    Object.defineProperty(sdk, methodName, {
      value: async (variables: any, requestHeaders: any, fetchQueryOptions?: FetchQueryOptions) => {
        const queryKey = [sourceName, methodName, variables]

        return queryClient.fetchQuery({
          queryKey,
          queryFn: () => method(variables, requestHeaders),
          ...fetchQueryOptions,
        })
      },
      enumerable: true,
      configurable: true,
    })
  })

  return sdk as CachedSdk<TFactory>
}
