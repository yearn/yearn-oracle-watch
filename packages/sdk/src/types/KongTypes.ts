export type TVault = {
  address: `0x${string}`
  name: string
  decimals: number
  chainId: number
  asset:
    | {
        address: `0x${string}`
        name: string
        symbol: string
        decimals: number
      }
    | undefined
  apr: {
    netAPR: number
    grossAPR: number
    rewardsAPR: number
    cvxAPR: number
  }
  price: number
}

export type TPosition = {
  balance: bigint
  balanceUSD: number
  vault: TVault
  want: {
    address: `0x${string}`
    symbol: string
    decimals: number
  }
  splitter: `0x${string}`
  isMultiClaimEnabled: boolean
  earned: bigint
}
