import { parseUnits } from 'viem'
import { formatPercent } from '.'

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
  projectedApr: string | null,
): string | null => {
  if (!currentApr || !projectedApr) return null

  // Extract numeric values (remove % sign)
  const currentValue = Number.parseFloat(currentApr.replace('%', ''))
  const projectedValue = Number.parseFloat(projectedApr.replace('%', ''))

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
  isDenominationUSD = false,
  assetPrice?: number,
): bigint => {
  if (!userInput || Number.parseFloat(userInput) === 0) return 0n

  let amountInAsset = userInput

  // Convert USD to asset amount if needed
  if (isDenominationUSD && assetPrice && assetPrice > 0) {
    const usdAmount = Number.parseFloat(userInput)
    if (usdAmount > 0) {
      amountInAsset = (usdAmount / assetPrice).toString()
    } else {
      return 0n
    }
  }

  try {
    // Validate input is a valid number
    const numericValue = Number.parseFloat(amountInAsset)
    if (Number.isNaN(numericValue) || numericValue <= 0) {
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
