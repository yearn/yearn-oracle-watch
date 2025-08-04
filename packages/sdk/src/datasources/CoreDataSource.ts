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
    console.log('🔍 getAprOracleData called with:', {
      vaultAddress,
      chainId,
      delta: delta.toString(),
    })

    const expectedAprContracts = [
      {
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr' as const,
        args: [vaultAddress, 0n] as const,
        chainId,
      },
      {
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr' as const,
        args: [vaultAddress, delta] as const,
        chainId,
      },
    ]

    console.log('📋 Contract calls prepared:', {
      oracleAddress: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
      contractsCount: expectedAprContracts.length,
      contracts: expectedAprContracts.map((c) => ({
        functionName: c.functionName,
        args: c.args.map((arg: Address | bigint) =>
          typeof arg === 'bigint' ? arg.toString() : arg
        ),
      })),
    })

    const expectedAprResults = await readContracts(this.wagmiConfig, {
      contracts: expectedAprContracts,
    })

    console.log(
      '📊 Raw contract results:',
      expectedAprResults.map((result, index) => ({
        index,
        status: result.status,
        result: result.result ? (result.result as bigint).toString() : null,
        error: result.error,
      }))
    )

    const [currentApr, projectedApr] = _.chain(expectedAprResults)
      .map((v) => v.result as bigint)
      .value() as [bigint, bigint]

    console.log('🔢 Extracted APR values:', {
      currentApr: currentApr ? currentApr.toString() : null,
      projectedApr: projectedApr ? projectedApr.toString() : null,
    })

    const currentAprFormatted = currentApr ? formatApr(currentApr) : null
    const projectedAprFormatted = projectedApr ? formatApr(projectedApr) : null

    console.log('✨ Formatted APR values:', {
      currentAprFormatted,
      projectedAprFormatted,
    })

    // Calculate percent change between current and projected APR
    const percentChange = calculatePercentChange(
      currentAprFormatted,
      projectedAprFormatted
    )

    console.log('📈 Calculated percent change:', percentChange)

    const result = {
      currentApr: currentAprFormatted,
      projectedApr: projectedAprFormatted,
      percentChange,
      delta,
    }

    console.log('🎯 Final result:', {
      ...result,
      delta: result.delta.toString(),
    })

    return result
  }
}
