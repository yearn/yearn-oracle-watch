import type { Address } from 'viem'

export const YBOLD_VAULT_ADDRESS = '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8' as Address
export const YBOLD_STAKING_ADDRESS = '0x23346B04a7f55b8760E5860AA5A77383D63491cD' as Address
export const YVUSD_UNLOCKED_ADDRESS = '0x696d02Db93291651ED510704c9b286841d506987' as Address
export const YVUSD_LOCKED_ADDRESS = '0xAaaFEa48472f77563961Cdb53291DEDfB46F9040' as Address

const MAINNET_CHAIN_ID = 1
const toAddressKey = (address?: string) => address?.toLowerCase()

export const isYvUsdVault = (chainId: number, address?: string): boolean =>
  chainId === MAINNET_CHAIN_ID &&
  [YVUSD_UNLOCKED_ADDRESS, YVUSD_LOCKED_ADDRESS].some(
    (candidate) => toAddressKey(candidate) === toAddressKey(address),
  )

export const getAprOracleVaultAddresses = (vaultAddress: Address, chainId: number): Address[] => {
  if (chainId !== MAINNET_CHAIN_ID) return [vaultAddress]

  const addressKey = toAddressKey(vaultAddress)
  if (addressKey === toAddressKey(YBOLD_VAULT_ADDRESS)) {
    return [YBOLD_STAKING_ADDRESS]
  }
  if (addressKey === toAddressKey(YVUSD_LOCKED_ADDRESS)) {
    return [YVUSD_UNLOCKED_ADDRESS, YVUSD_LOCKED_ADDRESS]
  }

  return [vaultAddress]
}

export const sumAprOracleValues = (values: Array<bigint | undefined>): bigint | undefined =>
  values.every((value): value is bigint => value !== undefined)
    ? values.reduce((sum, value) => sum + value, 0n)
    : undefined

export const getVaultDisplayName = (
  chainId: number,
  address: string,
  fallbackName: string,
): string =>
  chainId === MAINNET_CHAIN_ID && toAddressKey(address) === toAddressKey(YVUSD_UNLOCKED_ADDRESS)
    ? 'yvUSD'
    : fallbackName

export const getVaultIconAddress = (
  chainId: number,
  vaultAddress: Address,
  assetAddress: Address,
): Address =>
  chainId === MAINNET_CHAIN_ID &&
  toAddressKey(vaultAddress) === toAddressKey(YVUSD_UNLOCKED_ADDRESS)
    ? YVUSD_UNLOCKED_ADDRESS
    : assetAddress
