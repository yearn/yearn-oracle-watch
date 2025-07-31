import { type ComponentProps, type FC } from 'react'
import { getSvgAsset } from '@/utils/logos'
import { getAddress } from 'viem'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'
import { CaretDownIcon } from '@/components/shared/icons/CaretDownIcon'
import Button from './Button'

export type KongVault = {
  address?: string | null
  symbol?: string | null
  name?: string | null
  chainId?: number | null
  asset?: {
    decimals?: number | null
    address?: string | null
    name?: string | null
  } | null
}

type VaultSelectButtonProps = {
  selectedVault?: KongVault | null
}

const VaultSelectButton: FC<
  VaultSelectButtonProps & ComponentProps<typeof Button>
> = ({ selectedVault, variant, children, className, ...props }) => {
  // Content for selected vault
  const selectedVaultContent = selectedVault?.address ? (
    <div className="w-full flex items-center gap-2 pt-1 pb-2">
      <img
        className="w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 relative"
        src={getSvgAsset(
          Number(selectedVault.chainId),
          getAddress(selectedVault.asset?.address as string)
        )}
        alt={selectedVault.name as string}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src =
            'https://placehold.co/32x32/cccccc/666666?text=?'
        }}
      />
      <div className="flex flex-col items-start justify-start ml-2">
        <div className="text-[#1E1E1E] text-base font-normal leading-6 font-aeonik">
          {selectedVault.name}
        </div>
        <div className="text-[#1E1E1E] text-xs font-normal leading-4 font-aeonik">
          {CHAIN_ID_TO_NAME[Number(selectedVault.chainId)]}
        </div>
        <div className="text-[#1E1E1E] text-xs font-normal leading-4 font-aeonik">
          {selectedVault.address}
        </div>
      </div>
      <CaretDownIcon className="ml-auto" color="#1E1E1E" />
    </div>
  ) : null

  // Content for no vault selected
  const noVaultContent = (
    <div className="w-full h-full flex items-center justify-end">
      <div className="flex items-center">
        <div className="text-white text-base font-normal leading-8 font-aeonik">
          Select Vault
        </div>
        <CaretDownIcon className="ml-2" color="white" />
      </div>
    </div>
  )

  // Custom vault button styling - completely self-contained
  const vaultButtonClassName = `w-full h-full p-1 bg-[#F2F2F2] rounded-[16px] flex flex-col justify-center items-center gap-2.5 cursor-pointer outline outline-1 outline-black/10 -outline-offset-1 ${className || ''}`

  // Dynamic inner div styling based on content type
  const innerDivClassName = selectedVaultContent
    ? 'w-full flex-1 px-6 py-1 bg-transparent rounded-[14px] flex justify-center items-center gap-2.5'
    : 'w-full flex-1 px-6 py-1 bg-[#1A51B2] hover:bg-[#1c4ca1] rounded-[14px] flex justify-center items-center gap-2.5'

  return (
    <Button className={vaultButtonClassName} overrideStyling={true} {...props}>
      <div className={innerDivClassName}>
        {selectedVaultContent || noVaultContent}
      </div>
    </Button>
  )
}

export default VaultSelectButton
