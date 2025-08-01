import { fromUnixTime as fromUnixTimeBase } from 'date-fns'
import numbro from 'numbro'
import { formatUnits, parseUnits } from 'viem'

export const toUnixTime = (timestampish: number | bigint | Date): number => {
  if (Number.isFinite(timestampish)) {
    return Math.floor((timestampish as number) / 1e3)
  }
  if (typeof timestampish === 'bigint') {
    return toUnixTime(Number(timestampish))
  }
  return toUnixTime((timestampish as Date).getTime())
}

export const fromUnixTime = (timestampish: bigint | string | number): Date => {
  if (Number.isFinite(timestampish)) {
    return fromUnixTimeBase(timestampish as number)
  }
  return fromUnixTimeBase(Number(timestampish))
}

export const getNowUnix = () => toUnixTime(Date.now())

/**
 * Convert a BN to a simple Number primitive, scaling down and losing precision
 * @param bn
 * @param scale (decimals)
 */
export const exactToSimple = (
  bn?: bigint | string | number,
  scale?: number
) => {
  // BigNumbers can be returned by wagmi's query cache. This should happen
  // once per-browser sesion until wagmi's localStorage is cleared or overwritten.
  let res = bn

  if (typeof bn === 'object') {
    if ((bn as { hex?: string }).hex) {
      res = BigInt((bn as { hex: string }).hex)
    } else {
      console.log('unknown object type', bn, Object.entries(bn))
      return 0
    }
  }
  return Number.parseFloat(formatUnits(BigInt(res ?? 0), scale ?? 18))
}

/**
 * Convert a simple Number primitive to a BigInt, scaling up
 * @param simple
 * @param _scale (decimals)
 */
export const simpleToExact = (simple: number | string = 0, _scale = 18) =>
  parseUnits(simple.toString(), _scale)

const getSafeValue = (value: number): number =>
  Number.isNaN(value) || !value ? 0 : !Number.isFinite(value) ? 100 : value

/**
 * Format a given number as a string, with abbreviation if needed (e.g. 55.12m)
 * @param value
 * @param format
 */
export const formatValue = (value: number, format?: numbro.Format): string => {
  const currentMantissa = format?.mantissa ?? 2
  const isSmallerThanMantissa = 1 / 10 ** currentMantissa > value

  return isSmallerThanMantissa && currentMantissa > 0 && value > 0
    ? `< 0.${'0'.repeat(currentMantissa - 1)}1${format?.postfix || ''}`
    : numbro(getSafeValue(value)).format({
        mantissa: 2,
        average: true,
        ...format,
      })
}

/**
 * Format a given number as a currency, with abbreviation if needed (e.g. 55.12m)
 * Protip: supply `currencySymbol` to `format` if needed (assumes the almighty dollar)
 * @param value
 * @param format
 */
export const formatCurrency = (
  value: number,
  format?: numbro.Format
): string => {
  return numbro(getSafeValue(value)).formatCurrency({
    mantissa: 2,
    average: true,
    ...format,
  })
}

/**
 * Format a given number as a percentage, without abbreviation
 * @param value
 * @param format
 */
export const formatPercent = (
  value: number,
  format?: numbro.Format
): string => {
  return numbro(getSafeValue(value)).format({
    mantissa: 2,
    average: false,
    thousandSeparated: true,
    postfix: '%',
    ...format,
  })
}

/**
 * Replace multiple string instances in a single string
 * @param inputString
 * @param stringsToReplace
 * @param replacement
 */
export const replaceStrings = (
  inputString: string,
  stringsToReplace: string[],
  replacement: string
): string => {
  return stringsToReplace.reduce((outputString, stringToReplace) => {
    const regex = new RegExp(stringToReplace, 'g')
    return outputString.replace(regex, replacement)
  }, inputString)
}

export const replaceNetworkPath = (path: string, newNetwork?: string) =>
  path.replace(/\/(\d+)/, newNetwork ? `/${newNetwork}` : '')

export const maxUint256 = BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)

export const hashZero =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export function parseInputNumberString(input: string): string {
  const result = input.replace(/[^\d.,]/g, '').replace(/,/g, '.')
  const firstPeriod = result.indexOf('.')
  if (firstPeriod === -1) {
    return result
  }
  const firstPart = result.slice(0, firstPeriod + 1)
  const lastPart = result.slice(firstPeriod + 1).replace(/\./g, '')
  return firstPart + lastPart
}

export const scale = (bal?: bigint, val?: number, decimals?: number) =>
  ((bal || 0n) * simpleToExact(val || 0)) / BigInt(10 ** (decimals || 18))

export * from './apr'
