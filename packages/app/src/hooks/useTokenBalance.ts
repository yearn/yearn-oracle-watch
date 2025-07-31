import { useAccount } from '@/hooks/useAccount'
import { useErc20BalanceOf } from '@yearn-oracle-watch/contracts'
import { useEffect } from 'react'
import { type Address } from 'viem'
import { useBlockNumber } from 'wagmi'

export const useTokenBalance = ({ token, watch = false }: { token?: Address; watch?: boolean }) => {
  const account = useAccount()
  const { data: blockNumber = 0n } = useBlockNumber({ watch })

  const { data: balance = 0n, refetch } = useErc20BalanceOf({
    address: token,
    args: account ? [account] : undefined,
    query: {
      enabled: !!(account && token),
    },
  })

  useEffect(() => {
    if (!watch) return
    refetch()
  }, [blockNumber])

  return { balance, refetch }
}
