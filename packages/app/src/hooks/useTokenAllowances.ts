import { useAccount } from '@/hooks/useAccount'
import { erc20Abi } from '@yearn-oracle-watch/contracts'
import _ from 'lodash'
import { useEffect } from 'react'
import { type Address } from 'viem'
import { useBlockNumber, useReadContracts } from 'wagmi'

type TokenAllowance = Record<string, bigint> | undefined

interface UseTokenAllowancesParams<T> {
  data: { token: Address; spender: Address }[]
  watch?: boolean
  select?: (val: TokenAllowance) => T
}

interface UseTokenAllowancesReturn<T> {
  allowances: T
  refetch: () => void
  isLoading: boolean
}

export const useTokenAllowances = <T = TokenAllowance>({
  data,
  watch = false,
  select,
}: UseTokenAllowancesParams<T>): UseTokenAllowancesReturn<T> => {
  const account = useAccount()
  const { data: blockNumber = 0n } = useBlockNumber({ watch })

  const contracts =
    account && data.length
      ? data.map(({ token, spender }) => ({
          address: token,
          abi: erc20Abi,
          args: [account, spender],
          functionName: 'allowance',
        }))
      : []

  const {
    data: allowances,
    isLoading,
    refetch,
  } = useReadContracts({
    contracts,
    query: {
      select: (data) =>
        Object.fromEntries(
          _.compact(
            data.map((v, i) =>
              v.status === 'success' ? [contracts[i].address, v.result as bigint] : undefined,
            ),
          ),
        ),
    },
  })

  useEffect(() => {
    if (!watch) return
    refetch()
  }, [blockNumber])

  return { allowances: select ? select(allowances) : (allowances as T), isLoading, refetch }
}
