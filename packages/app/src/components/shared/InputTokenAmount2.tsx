import { useAccount } from '@/hooks/useAccount'
import { useInput } from '@/hooks/useInput'
import { exactToSimple, simpleToExact } from '@/utils'
import { cn } from '@/utils/cn'
import React, { ChangeEvent, FC } from 'react'
import { CaretDownIcon } from '@/components/shared/icons/CaretDownIcon'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

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
  onInputChange?: (value: bigint) => void
  onButtonClick?: () => void
}

export const InputTokenAmount: FC<Props> = ({
  input,
  symbol,
  placeholder,
  disabled: _disabled,
  onInputChange,
  onButtonClick,
  title,
  defaultSymbol = 'USD',
}) => {
  const account = useAccount()
  const [
    {
      formValue,
      activity: [, setActive],
    },
    handleChangeInput,
  ] = input
  const disabled = _disabled || !account

  // Dropdown state
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string>(
    symbol ?? defaultSymbol
  )

  // Example: get vault asset from props or context (placeholder)
  const vaultAsset = 'USDC' // Replace with actual vault asset logic
  const options = [
    { label: 'USD', value: 'USD' },
    { label: vaultAsset, value: vaultAsset },
  ]

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChangeInput(event)
    onInputChange?.(simpleToExact(event.target.value))
  }

  const handleSelect = (value: string) => {
    setSelected(value)
    setOpen(false)
    // Placeholder for processing logic
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
            'self-stretch px-2 rounded-[12px] bg-transparent outline-none text-xl font-normal leading-8 font-mono min-w-0',
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
                {/* Placeholder circle image for token logo */}
                <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 flex-shrink-0" />
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
