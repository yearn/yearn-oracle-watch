import React from 'react'
import {
  useVaultsWithLogos,
  type VaultWithLogos,
  type LoadingState,
} from '@/hooks/useVaultsWithLogos'
import Button from '@/components/shared/Button'
import VaultSelectButton from '@/components/shared/VaultSelectButton'
import { InputDepositAmount } from '@/components/shared/InputDepositAmount'
import { useInput } from '@/hooks/useInput'
import { Modal } from '@/components/shared/Modal'
import { SlidingModal } from '@/components/shared/SlidingModal'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'
import YearnLoader from '@/components/shared/YearnLoader'
import { useAprOracle } from '@/hooks/useAprOracle'
import { calculateDelta } from '@yearn-oracle-watch/sdk'
import { useTokenPrices, findTokenPrice } from '@/hooks/useTokenPrices'
import { Address } from 'viem'
import { SupportedChain } from '@/config/supportedChains'

// Search utility function
const searchVaults = (vaults: VaultWithLogos[], searchTerm: string) => {
  if (!searchTerm.trim()) return vaults

  const term = searchTerm.toLowerCase()

  return vaults.filter(
    (vault) =>
      vault.name?.toLowerCase().includes(term) ||
      CHAIN_ID_TO_NAME[Number(vault.chainId)]?.toLowerCase().includes(term) ||
      vault.address?.toLowerCase().includes(term)
  )
}

// Debounce utility function
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

const VaultQueryCard: React.FC = () => {
  // State and handlers at the top
  const [selectedAsset, setSelectedAsset] = React.useState('USD')
  const [selectedVault, setSelectedVault] = React.useState({} as VaultWithLogos)
  const [vaultModalOpen, setVaultModalOpen] = React.useState(false)
  const [slidingModalOpen, setSlidingModalOpen] = React.useState(false)
  const [deltaValue, setDeltaValue] = React.useState<bigint | undefined>(
    undefined
  )
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filteredVaults, setFilteredVaults] = React.useState<VaultWithLogos[]>(
    []
  )

  const handleSelectVault = () => {
    setVaultModalOpen(true)
  }
  const handleCloseVaultModal = () => {
    setVaultModalOpen(false)
    setSearchTerm('') // Clear search when closing modal
  }
  const handleOpenSlidingModal = () => {
    setSlidingModalOpen(true)
  }
  const handleCloseSlidingModal = () => {
    setSlidingModalOpen(false)
  }

  // Data hooks
  const { data, isLoading, error, loadingState } = useVaultsWithLogos()
  const { data: pricesData } = useTokenPrices()
  const inputHook = useInput(18) // Use actual useInput hook with 18 decimals
  const [inputValue] = inputHook

  // Debounced search implementation
  const debouncedSearch = React.useMemo(
    () =>
      debounce((term: string) => {
        const filtered = searchVaults(data || [], term)
        setFilteredVaults(filtered)
      }, 150),
    [data]
  )

  // Effect to handle search term changes
  React.useEffect(() => {
    if (data) {
      debouncedSearch(searchTerm)
    }
  }, [searchTerm, data, debouncedSearch])

  // Initialize filtered vaults when data loads
  React.useEffect(() => {
    if (data && !searchTerm) {
      setFilteredVaults(data)
    }
  }, [data, searchTerm])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  // APR Oracle integration
  const {
    data: aprOracleResult,
    isLoading: isAprOracleLoading,
    error: aprOracleError,
  } = useAprOracle({
    vault: {
      address: selectedVault?.address as Address,
      chainId: selectedVault?.chainId as SupportedChain,
    },
    delta: deltaValue,
  })

  // Vault and price calculations
  const vaultSymbol = selectedVault?.asset?.symbol || 'yvUSDC'
  const assetPrice =
    pricesData && selectedVault?.asset?.address && selectedVault?.chainId
      ? findTokenPrice(
          pricesData,
          selectedVault.asset.address,
          selectedVault.chainId
        )
      : null

  const handleQuery = () => {
    if (!selectedVault?.address || !inputValue.formValue) {
      alert('Please select a vault and enter an amount')
      return
    }

    // Calculate delta for the APR Oracle call
    const delta = calculateDelta(
      inputValue.formValue,
      selectedVault.asset?.decimals || 18,
      selectedAsset === 'USD',
      assetPrice || undefined
    )

    setDeltaValue(delta)
  }

  console.log('Vaults Data with Logos:', data)
  const balance = 0n

  // Find the full vault with logos for InputDepositAmount
  const selectedVaultWithLogos = data?.find(
    (vault) => vault.address === selectedVault?.address
  )

  // Loading state messages with whimsy
  const getLoadingMessage = (state: LoadingState): string => {
    switch (state) {
      case 'fetching-data':
        return 'Fetching vault data from Kong...'
      case 'generating-urls':
        return 'Generating logo URLs...'
      case 'preloading-images':
        return 'Preloading vault logos...'
      case 'preloading-images-1s':
        return 'Wow! there must be a lot of logos...'
      case 'preloading-images-2s':
        return 'Almost there! I promise!'
      case 'preloading-images-3s':
        return 'Are you sure you need logos?'
      case 'complete':
        return 'Complete!'
      default:
        return 'Loading...'
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <YearnLoader loadingState={getLoadingMessage(loadingState)} />
      </div>
    )
  }

  return (
    <div className="w-full h-full pb-16 flex justify-center items-center gap-4">
      <div className="w-[500px] h-full max-h-[500px] flex flex-col justify-start items-start gap-2.5">
        <div className="w-full flex-1 p-3 bg-white/10 rounded-[36px] flex flex-col justify-start items-start gap-2.5">
          <div className="w-full flex-1 p-2 bg-white rounded-[30px] overflow-visible flex justify-start items-center gap-5">
            <div className="flex-1 self-stretch px-3 py-[14px] rounded-[12px] overflow-visible flex flex-col justify-start items-center gap-5">
              {/* Select Vault */}
              <div className="w-full p-2 overflow-visible border-b border-[#1A51B2] flex flex-col justify-center items-start gap-2">
                <div className="px-3 flex justify-center items-center gap-2.5">
                  <div className="text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Select a Yearn Vault to Query:
                  </div>
                </div>
                <VaultSelectButton
                  selectedVault={selectedVault as any} // VaultWithLogos is compatible with KongVault
                  onClick={handleSelectVault}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      // Middle mouse button
                      e.preventDefault()
                      handleOpenSlidingModal()
                    }
                  }}
                  disabled={isLoading}
                  enableMetadata={!!selectedVault?.address}
                  metadataConfig={
                    selectedVault?.address
                      ? {
                          entityType: 'vault',
                          entityId: selectedVault.address,
                          chainId: selectedVault.chainId || 1,
                        }
                      : undefined
                  }
                />
              </div>
              {/* Vault Select Modal */}
              <Modal
                open={vaultModalOpen}
                onClose={handleCloseVaultModal}
                title={
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search vaults..."
                        className="flex-1 w-full px-4 py-2 pr-10 rounded-lg bg-gray-0 text-base font-aeonik"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          type="button"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                }
              >
                <ModalData
                  data={filteredVaults}
                  searchTerm={searchTerm}
                  isLoading={isLoading}
                  error={error}
                  onClose={handleCloseVaultModal}
                  onSelect={(vault) => {
                    setSelectedVault(vault as VaultWithLogos)
                    handleCloseVaultModal()
                  }}
                />
              </Modal>
              {/* Vault Select Sliding Modal - New sliding modal for secondary clicks */}
              <SlidingModal
                open={slidingModalOpen}
                onClose={handleCloseSlidingModal}
                title={
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search vaults..."
                        className="flex-1 w-full px-4 py-2 pr-10 rounded-lg bg-gray-0 text-base font-aeonik"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          type="button"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                }
              >
                <ModalData
                  data={filteredVaults}
                  searchTerm={searchTerm}
                  isLoading={isLoading}
                  error={error}
                  onClose={handleCloseSlidingModal}
                  onSelect={(vault) => {
                    setSelectedVault(vault as VaultWithLogos)
                    handleCloseSlidingModal()
                  }}
                />
              </SlidingModal>

              {/* Amount to Deposit */}
              <div className="w-full p-2 overflow-hidden border-b border-[#1A51B2] flex flex-col justify-center items-start">
                <div className="px-3 flex justify-center items-center gap-2.5">
                  <div className="text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Amount to Deposit
                  </div>
                </div>
                <InputDepositAmount
                  input={inputHook}
                  className="w-full p-1 bg-black/5 rounded-[16px] outline outline-1 outline-black/10 -outline-offset-1"
                  symbol={selectedAsset}
                  defaultSymbol="USD"
                  balance={balance}
                  currentVault={selectedVaultWithLogos}
                  onButtonClick={() =>
                    setSelectedAsset(
                      selectedAsset === 'USD' ? vaultSymbol : 'USD'
                    )
                  }
                />
              </div>
              {/* Query Button */}
              <div className="w-full px-2 flex flex-col justify-start items-start gap-2.5">
                <Button
                  className="w-full p-3 rounded-[14px] flex justify-center items-center gap-2.5"
                  variant="filled"
                  onClick={handleQuery}
                  disabled={!selectedVault?.address || isLoading}
                >
                  <span className="text-center text-white text-base font-bold leading-8 font-aeonik">
                    {isLoading ? 'Loading...' : 'Query AprOracle'}
                  </span>
                </Button>
              </div>
              {/* APY Info */}
              <div className="w-full flex flex-col justify-start items-start">
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Current APY:
                  </div>
                  <div className="flex-1 text-right text-[#9E9E9E] text-base font-normal leading-8 font-aeonik-mono">
                    {selectedVault?.address
                      ? isAprOracleLoading
                        ? 'Loading...'
                        : aprOracleError
                          ? 'Error loading APR'
                          : aprOracleResult?.currentApr
                            ? aprOracleResult.currentApr
                            : 'N/A'
                      : 'select vault to see'}
                  </div>
                </div>
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Projected APY:
                  </div>
                  <div className="flex-1 text-right text-[#9E9E9E] text-base font-normal leading-8 font-aeonik-mono">
                    {deltaValue !== undefined
                      ? isAprOracleLoading
                        ? 'Loading...'
                        : aprOracleError
                          ? 'Error loading APR'
                          : aprOracleResult?.projectedApr
                            ? aprOracleResult.projectedApr
                            : 'N/A'
                      : 'query to generate'}
                  </div>
                </div>
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Percent Change:
                  </div>
                  <div className="flex-1 text-right text-[#9E9E9E] text-base font-normal leading-8 font-aeonik-mono">
                    {deltaValue !== undefined ? (
                      aprOracleResult?.percentChange ? (
                        <span
                          className={
                            aprOracleResult?.percentChange.startsWith('+')
                              ? 'text-green-600'
                              : aprOracleResult.percentChange.startsWith('-')
                                ? 'text-red-600'
                                : ''
                          }
                        >
                          {aprOracleResult.percentChange}
                        </span>
                      ) : (
                        'N/A'
                      )
                    ) : (
                      'query to generate'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VaultQueryCard

// Vault list modal content as a separate component

type ModalDataProps = {
  data?: VaultWithLogos[]
  searchTerm?: string
  isLoading?: boolean
  error?: Error | null
  onClose: () => void
  onSelect: (vault: VaultWithLogos) => void
}

const ModalData: React.FC<ModalDataProps> = ({
  data,
  searchTerm,
  isLoading,
  error,
  onClose,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading vaults...</div>
        </div>
        <Button className="mt-4" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-red-500">
            Error loading vaults: {error.message}
          </div>
        </div>
        <Button className="mt-4" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  const vaults = Array.isArray(data) && data.length > 0 ? data : []

  // Empty state when no results found after search
  if (searchTerm && searchTerm.trim() && vaults.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col justify-center items-center h-32 gap-2">
          <div className="text-gray-500 text-lg">No vaults found</div>
          <div className="text-gray-400 text-sm">
            Try searching for a different vault name, chain, or address
          </div>
        </div>
        <Button className="mt-4" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

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

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search results count */}
      {searchTerm && searchTerm.trim() && (
        <div className="text-sm text-gray-600 px-2">
          {vaults.length} vault{vaults.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Vault List */}
      <div
        className="overflow-y-auto w-full"
        style={{ maxHeight: 350, minHeight: 100 }}
      >
        {vaults.map((vault, idx) => {
          const chainName = CHAIN_ID_TO_NAME[Number(vault.chainId)]
          return (
            <div
              key={vault.address || idx}
              className="h-[70px] px-6 py-1 bg-gray-100/50 overflow-hidden rounded-[16px] flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-200/50"
              onClick={() => onSelect(vault)}
            >
              <div className="flex items-center gap-2 px-2">
                <img
                  className="w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 relative"
                  src={
                    vault.logos?.asset ||
                    vault.preloadedImages?.asset?.src ||
                    'https://placehold.co/32x32/cccccc/666666?text=?'
                  }
                  alt={vault.name as string}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/32x32/cccccc/666666?text=?'
                  }}
                />
                <div className="flex flex-col items-start justify-start">
                  <div className="text-[#1E1E1E] text-[16px] font-aeonik font-normal leading-5">
                    {highlightMatch(vault.name || '', searchTerm)}
                  </div>
                  <div className="text-center text-[#3D3D3D] text-[10px] font-aeonik font-normal leading-[14px]">
                    {highlightMatch(chainName || '', searchTerm)}
                  </div>
                  <div className="text-center text-[#3D3D3D] text-[10px] font-aeonik font-normal leading-[14px]">
                    {highlightMatch(vault.address || '', searchTerm)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Button className="mt-4" variant="outlined" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
