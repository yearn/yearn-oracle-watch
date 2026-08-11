import { readContracts } from '@wagmi/core'
import { aprOracleAbi, aprOracleAddress, erc20Abi, v3VaultAbi } from '@yearn-oracle-watch/contracts'
import _ from 'lodash'
import { KongDataSource } from 'src/datasources/KongDataSource'
import { YDaemonDataSource } from 'src/datasources/YDaemonDataSource'
import { calculatePercentChange, formatApr } from 'src/utils/apr'
import {
  getAprOracleVaultAddresses,
  getVaultIconAddress,
  sumAprOracleValues,
} from 'src/utils/featuredVaults'
import { Address, getAddress } from 'viem'
import { SdkContext } from '../types'

// Environment check for development logging
const isDevelopment = (() => {
  try {
    return (
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
      (typeof window !== 'undefined' && window.location?.hostname === 'localhost')
    )
  } catch {
    return false
  }
})()

// Development-only logging helper
const devLog = (...args: Parameters<typeof console.log>) => {
  if (isDevelopment) {
    console.log(...args)
  }
}

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

  async getAprOracleData(vaultAddress: Address, chainId: number, delta: bigint) {
    devLog('🔍 getAprOracleData called with:', {
      vaultAddress,
      chainId,
      delta: delta.toString(),
    })

    const oracleVaultAddresses = getAprOracleVaultAddresses(vaultAddress, chainId)
    const expectedAprContracts = [0n, delta].flatMap((queryDelta) =>
      oracleVaultAddresses.map((oracleVaultAddress) => ({
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getStrategyApr' as const,
        args: [oracleVaultAddress, queryDelta] as const,
        chainId,
      })),
    )

    devLog('📋 Contract calls prepared:', {
      oracleAddress: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
      contractsCount: expectedAprContracts.length,
      contracts: expectedAprContracts.map((c) => ({
        functionName: c.functionName,
        args: c.args.map((arg: Address | bigint) =>
          typeof arg === 'bigint' ? arg.toString() : arg,
        ),
      })),
    })

    const expectedAprResults = await readContracts(this.wagmiConfig, {
      contracts: expectedAprContracts,
    })

    devLog(
      '📊 Raw contract results:',
      expectedAprResults.map((result, index) => ({
        index,
        status: result.status,
        result: result.result ? (result.result as bigint).toString() : null,
        error: result.error,
      })),
    )

    // Check for failed calls and create fallback contracts
    const failedIndices = expectedAprResults
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'failure')
      .map(({ index }) => index)

    const finalResults = [...expectedAprResults]

    if (failedIndices.length > 0) {
      devLog(`🔄 Found ${failedIndices.length} failed calls, attempting fallback to getExpectedApr`)

      const fallbackContracts = failedIndices.map((index) => ({
        address: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        abi: aprOracleAbi,
        functionName: 'getExpectedApr' as const,
        args: expectedAprContracts[index].args,
        chainId,
      }))

      devLog('📋 Fallback contract calls prepared:', {
        oracleAddress: aprOracleAddress[chainId as keyof typeof aprOracleAddress],
        contractsCount: fallbackContracts.length,
        contracts: fallbackContracts.map((c) => ({
          functionName: c.functionName,
          args: c.args.map((arg: Address | bigint) =>
            typeof arg === 'bigint' ? arg.toString() : arg,
          ),
        })),
      })

      const fallbackResults = await readContracts(this.wagmiConfig, {
        contracts: fallbackContracts,
      })

      devLog(
        '📊 Fallback contract results:',
        fallbackResults.map((result, index) => ({
          originalIndex: failedIndices[index],
          status: result.status,
          result: result.result ? (result.result as bigint).toString() : null,
          error: result.error,
        })),
      )

      // Replace failed results with fallback results
      failedIndices.forEach((originalIndex, fallbackIndex) => {
        if (fallbackResults[fallbackIndex].status === 'success') {
          finalResults[originalIndex] = fallbackResults[fallbackIndex]
          devLog(`✅ Successfully recovered index ${originalIndex} using getExpectedApr fallback`)
        } else {
          devLog(`❌ Fallback also failed for index ${originalIndex}`)
        }
      })
    }

    const valuesPerDelta = oracleVaultAddresses.length
    const sumAprResults = (offset: number): bigint | undefined => {
      const results = finalResults.slice(offset, offset + valuesPerDelta)
      return sumAprOracleValues(
        results.map((result) =>
          result.status === 'success' ? (result.result as bigint) : undefined,
        ),
      )
    }
    const currentApr = sumAprResults(0)
    const projectedApr = sumAprResults(valuesPerDelta)

    if (currentApr === undefined || projectedApr === undefined) {
      throw new Error(`APR oracle reads failed for ${vaultAddress} on chain ${chainId}`)
    }

    devLog('🔢 Extracted APR values:', {
      currentApr: currentApr.toString(),
      projectedApr: projectedApr.toString(),
    })

    const currentAprFormatted = formatApr(currentApr)
    const projectedAprFormatted = formatApr(projectedApr)

    devLog('✨ Formatted APR values:', {
      currentAprFormatted,
      projectedAprFormatted,
    })

    // Calculate percent change between current and projected APR
    const percentChange = calculatePercentChange(currentAprFormatted, projectedAprFormatted)

    devLog('📈 Calculated percent change:', percentChange)

    const result = {
      currentApr: currentAprFormatted,
      projectedApr: projectedAprFormatted,
      percentChange,
      delta,
    }

    devLog('🎯 Final result:', {
      ...result,
      delta: result.delta.toString(),
    })

    return result
  }

  /**
   * Probe chains to discover a v3 vault at a pasted address and return VaultData-like entries.
   * This method is side-effect free and performs best-effort per-chain reads.
   */
  async discoverVaultsFromContract(
    vaultAddress: Address,
    chainIds: number[] = [],
  ): Promise<
    Array<{
      address: Address
      symbol: string
      name: string
      chainId: number
      category: 'allocator'
      iconAddress: Address
      asset: {
        address: Address
        name: string
        symbol: string
        decimals: number
      }
    }>
  > {
    const checksumVault = getAddress(vaultAddress)

    const results: Array<{
      address: Address
      symbol: string
      name: string
      chainId: number
      category: 'allocator'
      iconAddress: Address
      asset: {
        address: Address
        name: string
        symbol: string
        decimals: number
      }
    }> = []

    for (const chainId of chainIds) {
      try {
        // Read basic vault metadata from v3Vault
        const vaultMeta = await readContracts(this.wagmiConfig, {
          contracts: [
            {
              address: checksumVault,
              abi: v3VaultAbi,
              functionName: 'name' as const,
              args: [],
              chainId,
            },
            {
              address: checksumVault,
              abi: v3VaultAbi,
              functionName: 'symbol' as const,
              args: [],
              chainId,
            },
            {
              address: checksumVault,
              abi: v3VaultAbi,
              functionName: 'asset' as const,
              args: [],
              chainId,
            },
            {
              address: checksumVault,
              abi: v3VaultAbi,
              functionName: 'decimals' as const,
              args: [],
              chainId,
            },
          ],
        })

        // Ensure all succeeded
        if (vaultMeta.some((r) => r.status !== 'success')) {
          devLog(`v3Vault reads failed on chain ${chainId}`, vaultMeta)
          continue
        }

        const [nameRes, symbolRes, assetRes] = vaultMeta
        const vaultName = nameRes.result as string
        const vaultSymbol = symbolRes.result as string
        const assetAddr = getAddress(assetRes.result as Address)
        // We don't currently need the vault share decimals in app logic here
        // const vaultDecimals = Number(decimalsRes.result as bigint)

        // Read ERC20 metadata for asset
        const assetMeta = await readContracts(this.wagmiConfig, {
          contracts: [
            {
              address: assetAddr,
              abi: erc20Abi,
              functionName: 'decimals' as const,
              args: [],
              chainId,
            },
            {
              address: assetAddr,
              abi: erc20Abi,
              functionName: 'symbol' as const,
              args: [],
              chainId,
            },
            {
              address: assetAddr,
              abi: erc20Abi,
              functionName: 'name' as const,
              args: [],
              chainId,
            },
          ],
        })

        if (assetMeta.some((r) => r.status !== 'success')) {
          devLog(`erc20 reads failed on chain ${chainId}`, assetMeta)
          continue
        }

        const [aDecRes, aSymRes, aNameRes] = assetMeta
        const assetDecimals = Number(aDecRes.result as number | bigint)
        const assetSymbol = aSymRes.result as string
        const assetName = aNameRes.result as string

        results.push({
          address: checksumVault,
          symbol: vaultSymbol,
          name: vaultName,
          chainId,
          category: 'allocator',
          iconAddress: getVaultIconAddress(chainId, checksumVault, assetAddr),
          asset: {
            address: assetAddr,
            name: assetName,
            symbol: assetSymbol,
            decimals: assetDecimals,
          },
        })
      } catch (e) {
        devLog(`discoverVaultsFromContract error on chain ${chainId}`, e)
      }
    }

    // De-duplicate by chainId+address just in case
    const deduped = _.uniqBy(results, (v) => `${v.chainId}-${v.address}`)
    return deduped
  }
}
