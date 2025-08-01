import { KongDataSource } from 'src/datasources/KongDataSource'
import { YDaemonDataSource } from 'src/datasources/YDaemonDataSource'
import { SdkContext } from '../types'
import { Address } from 'viem'
import { aprOracleAbi, aprOracleAddress } from '@yearn-oracle-watch/contracts'
import { readContracts } from '@wagmi/core'

export class CoreDataSource {
  public readonly kong: KongDataSource
  public readonly yDaemon: YDaemonDataSource
  private readonly queryClient
  private readonly wagmiConfig
  private readonly config

  constructor(context: SdkContext) {
    this.queryClient = context.queryClient
    this.wagmiConfig = context.wagmiConfig
    this.config = context.config
    this.kong = new KongDataSource(context, 'kong')
    this.yDaemon = new YDaemonDataSource(context, 'yDaemon')
  }

  async initialize(): Promise<void> {
    await Promise.all([this.kong.initialize(), this.yDaemon.initialize()])
  }

  dispose(): void {
    this.kong.dispose()
    this.yDaemon.dispose()
  }

  // getAprOracle(chainId: number): Promise<any> {
  //   return this.kong.getVaultsData()
  // }

  async getAprOracleData(vaultAddress: Address, delta: bigint) {
    const expectedAprContracts = [1, 10, 137].map((chainId) => {
      return {
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr',
        args: [vaultAddress, delta],
        chainId,
      }
    })

    const expectedAprResults = await readContracts(this.wagmiConfig, {
      contracts: expectedAprContracts,
    })

    return expectedAprResults

    // // Get current APR (with delta = 0)
    // const currentAprQuery = useAprOracleGetExpectedApr({
    //   args: vaultAddress ? [vaultAddress as Address, 0n] : undefined,
    //   query: {
    //     enabled: !!vaultAddress,
    //     staleTime: 30_000, // 30 seconds
    //   },
    // })

    // // Get projected APR (with the provided delta)
    // const projectedAprQuery = useAprOracleGetExpectedApr({
    //   args:
    //     vaultAddress && delta !== undefined
    //       ? [vaultAddress as Address, delta]
    //       : undefined,
    //   query: {
    //     enabled: !!vaultAddress && delta !== undefined,
    //     staleTime: 30_000, // 30 seconds
    //   },
    // })
  }
}
