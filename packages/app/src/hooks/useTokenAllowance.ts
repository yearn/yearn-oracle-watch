import { useAccount } from '@/hooks/useAccount'
import { useChains } from '@/hooks/useChains'
import { useErc20Allowance } from '@yearn-oracle-watch/contracts'
import { useEffect } from 'react'
import { type Address } from 'viem'
import { useBlockNumber } from 'wagmi'

export const useTokenAllowance = ({
  token,
  spender,
  watch = false,
}: { token: Address | undefined; spender: Address | undefined; watch?: boolean }) => {
  const account = useAccount()
  const { chainId } = useChains()
  const { data: blockNumber = 0n } = useBlockNumber({ watch })

  const { data: allowance = 0n, refetch } = useErc20Allowance({
    address: token,
    args: account && spender ? [account, spender] : undefined,
    chainId,
    query: {
      enabled: !!(account && token && spender),
    },
  })

  useEffect(() => {
    if (!watch) return
    refetch()
  }, [blockNumber])

  return { allowance, refetch }
}
