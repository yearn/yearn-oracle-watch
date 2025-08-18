import { readContracts } from '@wagmi/core'
import { aprOracleAbi, aprOracleAddress } from '@yearn-oracle-watch/contracts'
import _ from 'lodash'
import { KongDataSource } from 'src/datasources/KongDataSource'
import { YDaemonDataSource } from 'src/datasources/YDaemonDataSource'
import { calculatePercentChange, formatApr } from 'src/utils/apr'
import { Address } from 'viem'
import { SdkContext } from '../types'

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
        functionName: 'getStrategyApr' as const,
        args: [vaultAddress, 0n] as const,
        chainId,
      },
      {
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getStrategyApr' as const,
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

    // Check for failed calls and create fallback contracts
    const failedIndices = expectedAprResults
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'failure')
      .map(({ index }) => index)

    const finalResults = [...expectedAprResults]

    if (failedIndices.length > 0) {
      console.log(
        `🔄 Found ${failedIndices.length} failed calls, attempting fallback to getExpectedApr`
      )

      const fallbackContracts = failedIndices.map((index) => ({
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr' as const,
        args: expectedAprContracts[index].args,
        chainId,
      }))

      console.log('📋 Fallback contract calls prepared:', {
        oracleAddress:
          aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        contractsCount: fallbackContracts.length,
        contracts: fallbackContracts.map((c) => ({
          functionName: c.functionName,
          args: c.args.map((arg: Address | bigint) =>
            typeof arg === 'bigint' ? arg.toString() : arg
          ),
        })),
      })

      const fallbackResults = await readContracts(this.wagmiConfig, {
        contracts: fallbackContracts,
      })

      console.log(
        '📊 Fallback contract results:',
        fallbackResults.map((result, index) => ({
          originalIndex: failedIndices[index],
          status: result.status,
          result: result.result ? (result.result as bigint).toString() : null,
          error: result.error,
        }))
      )

      // Replace failed results with fallback results
      failedIndices.forEach((originalIndex, fallbackIndex) => {
        if (fallbackResults[fallbackIndex].status === 'success') {
          finalResults[originalIndex] = fallbackResults[fallbackIndex]
          console.log(
            `✅ Successfully recovered index ${originalIndex} using getExpectedApr fallback`
          )
        } else {
          console.log(`❌ Fallback also failed for index ${originalIndex}`)
        }
      })
    }

    const [currentApr, projectedApr] = _.chain(finalResults)
      .map((v) => v.result as bigint)
      .value() as [bigint, bigint]

    console.log('🔢 Extracted APR values:', {
      currentApr: currentApr ? currentApr.toString() : null,
      projectedApr: projectedApr ? projectedApr.toString() : null,
    })

    const currentAprFormatted = currentApr
      ? formatApr(currentApr)
      : formatApr(0n)
    const projectedAprFormatted = projectedApr
      ? formatApr(projectedApr)
      : formatApr(0n)

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
