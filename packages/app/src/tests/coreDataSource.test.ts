import { QueryClient } from '@tanstack/query-core'
import { type Config, readContracts } from '@wagmi/core'
import {
  CoreDataSource,
  YBOLD_STAKING_ADDRESS,
  YBOLD_VAULT_ADDRESS,
  YVUSD_LOCKED_ADDRESS,
  YVUSD_UNLOCKED_ADDRESS,
} from '@yearn-oracle-watch/sdk'
import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@wagmi/core', async () => {
  const actual = await vi.importActual<typeof import('@wagmi/core')>('@wagmi/core')
  return { ...actual, readContracts: vi.fn() }
})

const STANDARD_VAULT = '0x0000000000000000000000000000000000000001' as Address
const DELTA = 123n
const APR_UNIT = 10n ** 16n

const success = (result: bigint) => ({ status: 'success' as const, result })
const failure = () => ({ status: 'failure' as const, error: new Error('oracle read failed') })

const createDataSource = () =>
  new CoreDataSource({
    queryClient: new QueryClient(),
    wagmiConfig: {} as Config,
    config: {
      endpoints: {
        kong: 'https://kong.example',
        yDaemon: 'https://ydaemon.example',
      },
    },
  })

const mockedReadContracts = vi.mocked(readContracts)

describe('CoreDataSource.getAprOracleData', () => {
  beforeEach(() => {
    mockedReadContracts.mockReset()
  })

  it('returns current and projected APRs for an ordinary vault', async () => {
    mockedReadContracts.mockResolvedValueOnce([success(APR_UNIT), success(2n * APR_UNIT)] as never)

    const result = await createDataSource().getAprOracleData(STANDARD_VAULT, 1, DELTA)

    expect(result).toEqual({
      currentApr: '1.00%',
      projectedApr: '2.00%',
      percentChange: '+100.00%',
      delta: DELTA,
    })
    expect(mockedReadContracts).toHaveBeenCalledTimes(1)
    expect(mockedReadContracts.mock.calls[0][1].contracts.map((contract) => contract.args)).toEqual(
      [
        [STANDARD_VAULT, 0n],
        [STANDARD_VAULT, DELTA],
      ],
    )
  })

  it('routes yBOLD oracle calls through the staked yBOLD address', async () => {
    mockedReadContracts.mockResolvedValueOnce([
      success(3n * APR_UNIT),
      success(4n * APR_UNIT),
    ] as never)

    await createDataSource().getAprOracleData(YBOLD_VAULT_ADDRESS, 1, DELTA)

    expect(mockedReadContracts.mock.calls[0][1].contracts.map((contract) => contract.args)).toEqual(
      [
        [YBOLD_STAKING_ADDRESS, 0n],
        [YBOLD_STAKING_ADDRESS, DELTA],
      ],
    )
  })

  it('groups and sums Locked yvUSD reads by delta', async () => {
    mockedReadContracts.mockResolvedValueOnce([
      success(APR_UNIT),
      success(2n * APR_UNIT),
      success(3n * APR_UNIT),
      success(4n * APR_UNIT),
    ] as never)

    const result = await createDataSource().getAprOracleData(YVUSD_LOCKED_ADDRESS, 1, DELTA)

    expect(result).toEqual({
      currentApr: '3.00%',
      projectedApr: '7.00%',
      percentChange: '+133.33%',
      delta: DELTA,
    })
    expect(mockedReadContracts.mock.calls[0][1].contracts.map((contract) => contract.args)).toEqual(
      [
        [YVUSD_UNLOCKED_ADDRESS, 0n],
        [YVUSD_LOCKED_ADDRESS, 0n],
        [YVUSD_UNLOCKED_ADDRESS, DELTA],
        [YVUSD_LOCKED_ADDRESS, DELTA],
      ],
    )
  })

  it('remaps per-index getExpectedApr fallbacks before summing', async () => {
    mockedReadContracts
      .mockResolvedValueOnce([
        success(APR_UNIT),
        failure(),
        failure(),
        success(4n * APR_UNIT),
      ] as never)
      .mockResolvedValueOnce([success(2n * APR_UNIT), success(3n * APR_UNIT)] as never)

    const result = await createDataSource().getAprOracleData(YVUSD_LOCKED_ADDRESS, 1, DELTA)

    expect(result.currentApr).toBe('3.00%')
    expect(result.projectedApr).toBe('7.00%')
    expect(mockedReadContracts).toHaveBeenCalledTimes(2)
    expect(mockedReadContracts.mock.calls[1][1].contracts).toMatchObject([
      {
        functionName: 'getExpectedApr',
        args: [YVUSD_LOCKED_ADDRESS, 0n],
      },
      {
        functionName: 'getExpectedApr',
        args: [YVUSD_UNLOCKED_ADDRESS, DELTA],
      },
    ])
  })

  it('rejects an incomplete read when its fallback also fails', async () => {
    mockedReadContracts
      .mockResolvedValueOnce([success(APR_UNIT), failure()] as never)
      .mockResolvedValueOnce([failure()] as never)

    await expect(createDataSource().getAprOracleData(STANDARD_VAULT, 1, DELTA)).rejects.toThrow(
      `APR oracle reads failed for ${STANDARD_VAULT} on chain 1`,
    )
  })

  it('preserves successful zero values instead of treating them as failed reads', async () => {
    mockedReadContracts.mockResolvedValueOnce([success(0n), success(0n)] as never)

    await expect(createDataSource().getAprOracleData(STANDARD_VAULT, 1, DELTA)).resolves.toEqual({
      currentApr: '0.00%',
      projectedApr: '0.00%',
      percentChange: null,
      delta: DELTA,
    })
    expect(mockedReadContracts).toHaveBeenCalledTimes(1)
  })
})
