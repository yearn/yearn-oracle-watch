import { tokenlist } from '@/utils/tokenlist'
import { FC } from 'react'

const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const VaultPositionCard: FC<{
  apr: number
  title: string
  wantToken?: {
    address: string
    symbol: string
  }
  vaultToken?: {
    address: string
    symbol: string
  }
  balance: number
  isSelected: boolean
  onSelect: () => void
  variant?: 'default' | 'white'
  hasAnySelection?: boolean
}> = ({
  apr,
  title,
  vaultToken,
  wantToken,
  balance,
  isSelected,
  onSelect,
  variant = 'default',
  hasAnySelection = false,
}) => {
  const isWhiteVariant = variant === 'white'
  const shouldDim = hasAnySelection && !isSelected

  return (
    <div
      className={
        'relative cursor-pointer rounded-xl transition-all min-w-[200px]' +
        (shouldDim ? ' opacity-50 hover:opacity-75' : '')
      }
      onClick={onSelect}
    >
      {isSelected && (
        <div
          className="absolute -top-2 -right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#F26767] transition-transform hover:scale-105"
          onClick={onSelect}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div
        className={
          isWhiteVariant ? 'rounded-xl bg-white p-3 h-full' : 'rounded-xl bg-white/10 p-3 h-full'
        }
      >
        <div className={'flex flex-col h-full justify-between'}>
          {/* Top: Dollar icon and vault name */}
          <div className={'flex items-center gap-2'}>
            {vaultToken?.address && vaultToken.address in tokenlist && (
              <img
                src={tokenlist[vaultToken.address]}
                alt={'img'}
                width={20}
                height={20}
                className={'rounded-full'}
              />
            )}
            <p className={`text-sm font-medium ${isWhiteVariant ? 'text-black' : 'text-white'}`}>
              {title}
            </p>
          </div>

          {/* Center: Large value display */}
          <div className={'flex-1 flex py-2'}>
            <p className={`text-2xl font-bold ${isWhiteVariant ? 'text-black' : 'text-white'}`}>
              ${formatCurrency(balance)}
            </p>
          </div>

          {/* Bottom: APY and arrow with token icon */}
          <div className={'flex items-center justify-between'}>
            {apr !== undefined && (
              <div className={'rounded-full bg-[#F6FC3B] px-2 py-1'}>
                <p className={'font-mono text-[12px] font-medium text-black'}>
                  {isWhiteVariant ? `${(apr * 100).toFixed(2)}%` : `${(apr * 100).toFixed(2)}% APY`}
                </p>
              </div>
            )}
            <div className={'flex items-center gap-2'}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 4L13 8M13 8L9 12M13 8H3"
                  stroke={isWhiteVariant ? '#000' : '#fff'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
              </svg>
              {wantToken?.address && wantToken.address in tokenlist ? (
                <img
                  src={tokenlist[wantToken.address]}
                  alt={wantToken.address}
                  width={20}
                  height={20}
                  className={'rounded-full'}
                />
              ) : (
                <div className="px-2 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-[12px] font-medium text-gray-600">
                    {wantToken?.symbol.slice(0, 3) || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
