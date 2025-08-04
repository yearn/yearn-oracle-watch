import { useAccount } from '@/hooks/useAccount'
import { useInput } from '@/hooks/useInput'
import { simpleToExact } from '@/utils'
import { cn } from '@/utils/cn'
import React, { ChangeEvent, FC } from 'react'
import { CaretDownIcon } from '@/components/shared/icons/CaretDownIcon'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { type VaultData } from '@/hooks/useGetVaults'
import { getSvgAsset } from '@/utils/logos'

interface Props {
  input: ReturnType<typeof useInput>
  className?: string
  balance?: bigint
  defaultSymbol?: string
  symbol?: string
  placeholder?: string
  title?: string
  disabled?: boolean
  errorMessage?: string
  currentVault?: VaultData
  assetPrice?: number | null
  onInputChange?: (value: bigint) => void
  onButtonClick?: () => void
  onCurrencyChange?: (newCurrency: string) => void
}

export const InputDepositAmount: FC<Props> = ({
  input,
  symbol,
  placeholder,
  disabled: _disabled,
  onInputChange,
  onButtonClick,
  title,
  defaultSymbol = 'USD',
  currentVault,
  assetPrice,
  onCurrencyChange,
}) => {
  const account = useAccount()
  const [
    {
      formValue,
      activity: [, setActive],
    },
    handleChangeInput,
    setFormValue,
  ] = input
  const disabled = _disabled || !account

  // Get vault symbol from currentVault prop
  const vaultAsset = currentVault?.asset?.symbol as string

  // Dropdown state
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string>(
    symbol ?? defaultSymbol
  )

  // Create options with USD and vault asset
  const options = [
    { label: 'USD', value: 'USD' },
    { label: vaultAsset, value: vaultAsset },
  ]

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChangeInput(event)
    onInputChange?.(simpleToExact(event.target.value))
  }

  // Currency conversion function
  const convertValue = (
    fromCurrency: string,
    toCurrency: string,
    value: string
  ): string => {
    if (!value || !assetPrice || parseFloat(value) === 0) return value

    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) return value

    // Convert from USD to asset
    if (fromCurrency === 'USD' && toCurrency === vaultAsset) {
      const convertedValue = numericValue / assetPrice
      return convertedValue.toString()
    }

    // Convert from asset to USD
    if (fromCurrency === vaultAsset && toCurrency === 'USD') {
      const convertedValue = numericValue * assetPrice
      return convertedValue.toString()
    }

    // No conversion needed (same currency)
    return value
  }

  const handleSelect = (value: string) => {
    const previousCurrency = selected
    const newCurrency = value

    // Only convert if currency actually changed and we have a price
    if (previousCurrency !== newCurrency && assetPrice && formValue) {
      const convertedValue = convertValue(
        previousCurrency,
        newCurrency,
        formValue
      )
      setFormValue(convertedValue)
    }

    setSelected(newCurrency)
    setOpen(false)

    // Notify parent of currency change
    onCurrencyChange?.(newCurrency)
    if (onButtonClick) onButtonClick()
  }

  return (
    <div className={cn('flex flex-col w-full')}>
      {title && (
        <div className="flex items-center gap-2 p-1">
          <label className="text-sm font-normal text-black">{title}</label>
        </div>
      )}
      <div className="w-full p-1 bg-black/5 rounded-[16px] outline outline-1 outline-black/10 -outline-offset-1 flex justify-start items-center gap-1">
        <input
          disabled={disabled}
          placeholder={placeholder ?? '0.00'}
          value={formValue}
          onChange={handleInputChange}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          className={cn(
            'self-stretch px-6 rounded-[12px] bg-transparent outline-none text-xl font-normal leading-8 font-mono min-w-0',
            disabled ? 'text-gray-700' : 'text-[#1E1E1E]',
            'placeholder:text-gray-400',
            'font-aeonik-mono'
          )}
          style={{ width: '6.5em' }}
        />
        <div className="flex-1 h-1" />
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'self-stretch flex flex-row items-center justify-end gap-2.5 px-0 py-0 transition',
                'bg-white/50 outline outline-1 outline-black/10 -outline-offset-1 hover:bg-white/70 rounded-[14px]'
              )}
              style={{
                height: '48px',
                borderBottom: open ? 'none' : undefined,
              }}
            >
              <div
                className={cn(
                  'w-full px-6 py-1 flex justify-end items-center gap-3 rounded-[12px]'
                )}
              >
                <div className="text-right text-[#3D3D3D] text-base font-normal leading-8 font-aeonik">
                  {selected}
                </div>
                <div className="flex items-center justify-center w-6 h-6">
                  <CaretDownIcon
                    className={cn(
                      'ml-1 w-4 h-4 transition-transform duration-200',
                      open ? 'rotate-90' : 'rotate-0'
                    )}
                    color="#3D3D3D"
                  />
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              'bg-white flex flex-col p-0',
              'rounded-[14px]',
              'outline outline-1 outline-gray-400 -outline-offset-1',
              'shadow-lg'
            )}
          >
            {options.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => handleSelect(opt.value)}
                className={cn(
                  'flex flex-row items-center justify-end gap-3 px-6 py-2',
                  'text-[#3D3D3D] text-base font-normal leading-8 font-aeonik',
                  selected === opt.value
                )}
              >
                {/* Token logo */}
                <div className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {opt.value === 'USD' ? (
                    <img
                      src="images/tokens/dollarsign.svg"
                      alt="dollar"
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://placehold.co/24x24/cccccc/666666?text=?'
                      }}
                    />
                  ) : currentVault?.chainId && currentVault?.asset?.address ? (
                    <img
                      src={getSvgAsset(
                        currentVault.chainId,
                        currentVault.asset.address
                      )}
                      alt={vaultAsset}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300" />
                  )}
                </div>
                {/* Option text, right-aligned */}
                <div className="flex-1 text-right">{opt.label}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
