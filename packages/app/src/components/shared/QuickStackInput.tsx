import { simpleToExact } from '@/utils'
import { FC } from 'react'
import { formatUnits } from 'viem'

export const QuickStackInput: FC<{
  balance?: bigint
  decimals?: number
  onInputChange: (value: string) => void
}> = ({ balance, decimals = 18, onInputChange }) => {
  return (
    <div className="flex gap-1">
      {['25%', '50%', '75%', 'Max.'].map((percentage, index) => (
        <button
          key={percentage}
          type="button"
          onClick={() => {
            if (!balance) return
            const multiplierBN = simpleToExact(0.25 * (index + 1), decimals)
            const divisor = 10n ** BigInt(decimals)
            const value = formatUnits((balance * multiplierBN) / divisor, decimals)
            onInputChange(value)
          }}
          className="flex-1 px-2 py-2 bg-transparent hover:bg-black/5 border border-black/10 rounded-xl text-sm font-medium text-black transition-colors cursor-pointer"
          disabled={!balance}
        >
          {percentage}
        </button>
      ))}
    </div>
  )
}
