import { formatValue } from '@/utils'
import type { FC } from 'react'

export const VaultBalanceCard: FC<{
  balance: number
}> = ({ balance }) => {
  return (
    <div className={'flex h-[120px] flex-col justify-center p-6'}>
      <div className={'flex items-center gap-2'}>
        <p className={'text-[12px] font-medium text-white/75'}>{'Your Deposits'}</p>
      </div>
      <p className={'text-[28px] font-medium text-white'}>
        <span className={'font-normal text-white/50'}>{'$'}</span>
        {formatValue(balance)}
      </p>
    </div>
  )
}
