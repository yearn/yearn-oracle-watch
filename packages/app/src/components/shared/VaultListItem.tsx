import { CHAIN_ID_TO_ICON, CHAIN_ID_TO_NAME } from '@/constants/chains'
import { type VaultData } from '@/hooks/useGetVaults'
import { useTokenImage } from '@/hooks/useTokenImage'
import React from 'react'

interface VaultListItemProps {
  vault: VaultData
  searchTerm?: string
  onClick: () => void
  isVisible: boolean
  discovered?: boolean // true when sourced from on-chain discovery
}

/**
 * Optimized vault list item with lazy image loading and search highlighting
 */
export const VaultListItem: React.FC<VaultListItemProps> = ({
  vault,
  searchTerm,
  onClick,
  isVisible,
  discovered = false,
}) => {
  // Only load image when item is visible
  const {
    src: imageSrc,
    isLoading: imageLoading,
    error: imageError,
  } = useTokenImage(vault.chainId, vault.asset.address)

  // Helper function to highlight matching text
  const highlightMatch = (text: string, searchTerm?: string) => {
    if (!searchTerm || !searchTerm.trim()) return text

    const term = searchTerm.toLowerCase()
    const lowerText = text.toLowerCase()
    const index = lowerText.indexOf(term)

    if (index === -1) return text

    const before = text.slice(0, index)
    const match = text.slice(index, index + term.length)
    const after = text.slice(index + term.length)

    return (
      <>
        {before}
        <span className="bg-yellow-200 font-semibold">{match}</span>
        {after}
      </>
    )
  }

  const chainName = CHAIN_ID_TO_NAME[Number(vault.chainId)]
  const chainIcon = CHAIN_ID_TO_ICON[Number(vault.chainId)]

  // Render image with loading states
  const renderImage = () => {
    const imageClassName = 'w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 rounded-full'
    const badge = chainIcon ? (
      <span className="absolute -bottom-0.5 -left-0.5 h-4 w-4 rounded-full border-2 border-gray-100 bg-white shadow-sm">
        <img
          className="h-full w-full rounded-full"
          src={chainIcon}
          alt=""
          referrerPolicy="no-referrer"
        />
      </span>
    ) : null

    if (!isVisible) {
      // Show placeholder when not visible
      return (
        <div className="relative shrink-0">
          <div className={`${imageClassName} bg-gray-200 flex items-center justify-center`}>
            <div className="w-5 h-5 bg-gray-300 rounded-full" />
          </div>
          {badge}
        </div>
      )
    }

    if (imageError) {
      // Show question mark icon on error
      return (
        <div className="relative shrink-0">
          <div
            className={`${imageClassName} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`}
          >
            ?
          </div>
          {badge}
        </div>
      )
    }

    if (imageLoading || !imageSrc) {
      // Show subtle loading placeholder
      return (
        <div className="relative shrink-0">
          <div className={`${imageClassName} bg-gray-200 animate-pulse`} />
          {badge}
        </div>
      )
    }

    // Show actual image
    return (
      <div className="relative shrink-0">
        <img
          className={imageClassName}
          src={imageSrc}
          alt={vault.name as string}
          referrerPolicy="no-referrer"
        />
        {badge}
      </div>
    )
  }

  return (
    <div
      className="h-[70px] px-6 py-1 bg-gray-100/50 overflow-hidden rounded-[16px] flex items-center gap-2 cursor-pointer hover:bg-gray-200/50 transition-colors duration-150"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 px-2 flex-1 min-w-0">
        {renderImage()}
        <div className="flex flex-col items-start justify-start truncate">
          <div className="text-[#1E1E1E] text-[16px] font-aeonik font-normal leading-5 truncate">
            {highlightMatch(vault.name || '', searchTerm)}
          </div>
          <div className="text-center text-[#3D3D3D] text-[10px] font-aeonik font-normal leading-[14px] truncate">
            {highlightMatch(chainName || '', searchTerm)}
          </div>
          <div className="text-center text-[#3D3D3D] text-[10px] font-aeonik font-normal leading-[14px] truncate">
            {highlightMatch(vault.address || '', searchTerm)}
          </div>
        </div>
      </div>
      {discovered && (
        <div
          className="pl-2 pr-1 text-[#1A51B2] select-none"
          title="This vault was not found in the indexer and may not be endorsed by Yearn."
          aria-label="Unendorsed vault warning"
        >
          {/* Using a unicode warning symbol as requested */}
          <span role="img" aria-hidden="true">
            ⚠️
          </span>
        </div>
      )}
    </div>
  )
}
