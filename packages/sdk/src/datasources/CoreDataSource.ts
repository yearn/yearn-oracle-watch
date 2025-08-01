import { KongDataSource } from 'src/datasources/KongDataSource'
import { YDaemonDataSource } from 'src/datasources/YDaemonDataSource'
import { SdkContext } from '../types'
import { Address } from 'viem'
import { aprOracleAbi, aprOracleAddress } from '@yearn-oracle-watch/contracts'
import { readContracts } from '@wagmi/core'
import _ from 'lodash'
import { calculatePercentChange, formatApr } from 'src/utils/apr'

export class CoreDataSource {
  public readonly kong: KongDataSource
  public readonly yDaemon: YDaemonDataSource
  private readonly wagmiConfig

  constructor(context: SdkContext) {
    this.wagmiConfig = context.wagmiConfig
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

  async getAprOracleData(
    vaultAddress: Address,
    chainId: number,
    delta: bigint
  ) {
    const expectedAprContracts = [
      {
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr',
        args: [vaultAddress, 0n],
        chainId,
      },
      {
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr',
        args: [vaultAddress, delta],
        chainId,
      },
    ] as any[]

    const expectedAprResults = await readContracts(this.wagmiConfig, {
      contracts: expectedAprContracts,
    })

    const [currentApr, projectedApr] = _.chain(expectedAprResults)
      .map((v) => v.result as bigint)
      .value() as [bigint, bigint]

    const currentAprFormatted = currentApr ? formatApr(currentApr) : null
    const projectedAprFormatted = projectedApr ? formatApr(projectedApr) : null

    // Calculate percent change between current and projected APR
    const percentChange = calculatePercentChange(
      currentAprFormatted,
      projectedAprFormatted
    )

    return {
      currentApr: currentAprFormatted,
      projectedApr: projectedAprFormatted,
      percentChange,
      delta,
    }
  }
}
