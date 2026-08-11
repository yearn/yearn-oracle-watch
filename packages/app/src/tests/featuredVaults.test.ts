import { resolveRpcUrls } from '@/config/rpc'
import {
  EXCLUDED_VAULT_CHAIN_IDS,
  YBOLD_STAKING_ADDRESS,
  YBOLD_VAULT_ADDRESS,
  YVUSD_LOCKED_ADDRESS,
  YVUSD_UNLOCKED_ADDRESS,
  getAprOracleVaultAddresses,
  getVaultCategory,
  getVaultDisplayName,
  getVaultIconAddress,
  isSelectableVaultMeta,
  isYvUsdVault,
  sumAprOracleValues,
} from '@yearn-oracle-watch/sdk'
import { describe, expect, it } from 'vitest'

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

describe('featured vault behavior', () => {
  it('routes yBOLD oracle reads to staked yBOLD', () => {
    expect(getAprOracleVaultAddresses(YBOLD_VAULT_ADDRESS, 1)).toEqual([YBOLD_STAKING_ADDRESS])
  })

  it('combines unlocked and locked yvUSD oracle reads for Locked yvUSD', () => {
    expect(getAprOracleVaultAddresses(YVUSD_LOCKED_ADDRESS, 1)).toEqual([
      YVUSD_UNLOCKED_ADDRESS,
      YVUSD_LOCKED_ADDRESS,
    ])
    expect(sumAprOracleValues([2n, 3n])).toBe(5n)
    expect(sumAprOracleValues([2n, undefined])).toBeUndefined()
  })

  it('normalizes unlocked yvUSD identity and icon without changing its asset', () => {
    expect(getVaultDisplayName(1, YVUSD_UNLOCKED_ADDRESS, 'USD yVault')).toBe('yvUSD')
    expect(getVaultIconAddress(1, YVUSD_UNLOCKED_ADDRESS, USDC_ADDRESS)).toBe(
      YVUSD_UNLOCKED_ADDRESS,
    )
    expect(isYvUsdVault(1, YVUSD_UNLOCKED_ADDRESS)).toBe(true)
    expect(isYvUsdVault(1, YVUSD_LOCKED_ADDRESS)).toBe(true)
  })

  it('classifies single-strategy vaults separately from allocator vaults', () => {
    expect(getVaultCategory('Single Strategy')).toBe('strategy')
    expect(getVaultCategory('Multi Strategy')).toBe('allocator')
    expect(getVaultCategory('None')).toBe('allocator')
  })

  it('excludes hidden and retired vaults from selector data', () => {
    expect(isSelectableVaultMeta({ isHidden: false, isRetired: false })).toBe(true)
    expect(isSelectableVaultMeta({ isHidden: true, isRetired: false })).toBe(false)
    expect(isSelectableVaultMeta({ isHidden: false, isRetired: true })).toBe(false)
  })

  it('excludes Berachain from vault selector data', () => {
    expect(EXCLUDED_VAULT_CHAIN_IDS).toContain(80094)
  })

  it('uses a public RPC fallback when preview credentials are absent', () => {
    expect(resolveRpcUrls(undefined, 'https://public.example', 'https://default.example')).toEqual([
      'https://public.example',
      'https://default.example',
    ])
    expect(
      resolveRpcUrls(
        'https://configured.example',
        'https://public.example',
        'https://default.example',
      ),
    ).toEqual(['https://configured.example', 'https://public.example', 'https://default.example'])
    expect(resolveRpcUrls('', 'https://same.example', 'https://same.example')).toEqual([
      'https://same.example',
    ])
  })
})
