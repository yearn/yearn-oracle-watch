import { Address, parseUnits } from 'viem'
import { useAprOracleGetExpectedApr } from '@yearn-oracle-watch/contracts'
import { formatPercent } from '@/utils'
import { useSdk } from '../context/Sdk'

export interface UseAprOracleParams {
  vaultAddress?: string
  delta?: bigint
}

export interface AprOracleResult {
  currentApr: string | null
  projectedApr: string | null
  percentChange: string | null
  isLoading: boolean
  error: Error | null
}

export const useAprOracle2 = (params?: UseAprOracleParams) => {
  const { vaultAddress, delta } = params || {}

  const sdk = useSdk()
  console.log(
    'SDK: ',
    sdk.core.getAprOracleData(vaultAddress as Address, delta || 0n)
  )
}

export const useAprOracle = (params?: UseAprOracleParams): AprOracleResult => {
  const { vaultAddress, delta } = params || {}
  // Get current APR (with delta = 0)
  const currentAprQuery = useAprOracleGetExpectedApr({
    args: vaultAddress ? [vaultAddress as Address, 0n] : undefined,
    query: {
      enabled: !!vaultAddress,
      staleTime: 30_000, // 30 seconds
    },
  })

  // Get projected APR (with the provided delta)
  const projectedAprQuery = useAprOracleGetExpectedApr({
    args:
      vaultAddress && delta !== undefined
        ? [vaultAddress as Address, delta]
        : undefined,
    query: {
      enabled: !!vaultAddress && delta !== undefined,
      staleTime: 30_000, // 30 seconds
    },
  })

  // Debug logging
  if (vaultAddress && currentAprQuery.data) {
    console.log('APR Oracle - Current APR raw:', currentAprQuery.data)
  }
  if (vaultAddress && delta !== undefined && projectedAprQuery.data) {
    console.log(
      'APR Oracle - Projected APR raw:',
      projectedAprQuery.data,
      'for delta:',
      delta
    )
  }

  // Format APR values from getExpectedApr contract function
  const currentAprFormatted = currentAprQuery.data
    ? formatApr(currentAprQuery.data)
    : null
  const projectedAprFormatted = projectedAprQuery.data
    ? formatApr(projectedAprQuery.data)
    : null

  // Calculate percent change between current and projected APR
  const percentChange = calculatePercentChange(
    currentAprFormatted,
    projectedAprFormatted
  )

  return {
    currentApr: currentAprFormatted,
    projectedApr: projectedAprFormatted,
    percentChange,
    isLoading: currentAprQuery.isLoading || projectedAprQuery.isLoading,
    error: currentAprQuery.error || projectedAprQuery.error,
  }
}

/**
 * Format APR value from contract
 * Contract returns uint256 - need to determine the scale from actual values
 * Common scales: 1e18 (100% = 1e18), 1e4 (100% = 10000 basis points), or 1e2 (100% = 100)
 */
export const formatApr = (aprValue: bigint): string => {
  const aprNumber = Number(aprValue)

  // Determine scale based on magnitude
  let percentage: number
  if (aprNumber > 1e15) {
    // Scale: 1e18 (100% = 1e18)
    percentage = aprNumber / 1e16 // Convert to percentage (divide by 1e18 then multiply by 100)
  } else if (aprNumber > 1e6) {
    // Scale: 1e8 or similar (100% = 100000000)
    percentage = aprNumber / 1e6
  } else if (aprNumber > 1000) {
    // Scale: basis points (100% = 10000)
    percentage = aprNumber / 100
  } else {
    // Scale: already in percentage (100% = 100)
    percentage = aprNumber
  }

  return formatPercent(percentage, { mantissa: 2 })
}

/**
 * Calculate percent change between current and projected APR
 */
export const calculatePercentChange = (
  currentApr: string | null,
  projectedApr: string | null
): string | null => {
  if (!currentApr || !projectedApr) return null

  // Extract numeric values (remove % sign)
  const currentValue = parseFloat(currentApr.replace('%', ''))
  const projectedValue = parseFloat(projectedApr.replace('%', ''))

  if (currentValue === 0) return null

  const change = ((projectedValue - currentValue) / currentValue) * 100
  const sign = change > 0 ? '+' : ''

  return `${sign}${change.toFixed(2)}%`
}

/**
 * Calculate delta for contract calls
 * Converts user input to vault asset amount as signed bigint
 */
export const calculateDelta = (
  userInput: string,
  assetDecimals: number,
  isDenominationUSD: boolean = false,
  assetPrice?: number
): bigint => {
  if (!userInput || parseFloat(userInput) === 0) return 0n

  let amountInAsset = userInput

  // Convert USD to asset amount if needed
  if (isDenominationUSD && assetPrice && assetPrice > 0) {
    const usdAmount = parseFloat(userInput)
    if (usdAmount > 0) {
      amountInAsset = (usdAmount / assetPrice).toString()
    } else {
      return 0n
    }
  }

  try {
    // Validate input is a valid number
    const numericValue = parseFloat(amountInAsset)
    if (isNaN(numericValue) || numericValue <= 0) {
      return 0n
    }

    // Parse as positive value first, then convert to signed
    const amount = parseUnits(amountInAsset, assetDecimals)
    return amount
  } catch (error) {
    console.error('Error calculating delta:', error, {
      userInput,
      amountInAsset,
      assetDecimals,
      isDenominationUSD,
      assetPrice,
    })
    return 0n
  }
}
