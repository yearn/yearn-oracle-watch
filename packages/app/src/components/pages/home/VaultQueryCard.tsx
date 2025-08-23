import Button from '@/components/shared/Button'
import { InputDepositAmount } from '@/components/shared/InputDepositAmount'
import { Modal } from '@/components/shared/Modal'
import VaultSelectButton, {
  type KongVault,
} from '@/components/shared/VaultSelectButton'
import { VaultListItem } from '@/components/shared/VaultListItem'
import YearnLoader from '@/components/shared/YearnLoader'
import { VirtualScrollList } from '@/components/ui/VirtualScrollList'
import { SupportedChain } from '@/config/supportedChains'
import { useAprOracle } from '@/hooks/useAprOracle'
import { type VaultData, useGetVaults } from '@/hooks/useGetVaults'
import { useInput } from '@/hooks/useInput'
import { usePreloadTokenImages } from '@/hooks/usePreloadTokenImages'
import { findTokenPrice, useTokenPrices } from '@/hooks/useTokenPrices'
import { useDiscoverVaultByAddress } from '@/hooks/useDiscoverVaultByAddress'
import { calculateDelta } from '@yearn-oracle-watch/sdk'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Address, isAddress } from 'viem'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'

// Search utility function
const searchVaults = (vaults: VaultData[], searchTerm: string) => {
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
  // URL search params hook
  const [searchParams, setSearchParams] = useSearchParams()

  // State and handlers at the top
  const [selectedAsset, setSelectedAsset] = React.useState('USD')
  const [selectedVault, setSelectedVault] = React.useState({} as KongVault)
  const [vaultModalOpen, setVaultModalOpen] = React.useState(false)
  const [deltaValue, setDeltaValue] = React.useState<bigint | undefined>(
    undefined
  )
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filteredVaults, setFilteredVaults] = React.useState<VaultData[]>([])
  const { data: discoveredVaults, isLoading: isDiscovering } =
    useDiscoverVaultByAddress(searchTerm)

  const handleSelectVault = () => {
    setVaultModalOpen(true)
  }
  const handleCloseVaultModal = () => {
    setVaultModalOpen(false)
  }

  // Function to update URL with vault selection
  const updateUrlWithVault = (vault: VaultData | null) => {
    if (vault) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('vault', vault.address)
      newParams.set('chainId', vault.chainId.toString())
      setSearchParams(newParams, { replace: true })
    } else {
      // Remove vault params when no vault selected
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('vault')
      newParams.delete('chainId')
      setSearchParams(newParams, { replace: true })
    }
  }

  // Data hooks
  const { data, isLoading, error } = useGetVaults()
  const { data: pricesData } = useTokenPrices()
  const inputHook = useInput(18)
  const [inputValue] = inputHook

  // Start preloading images as soon as vault data is available
  usePreloadTokenImages(data || [])

  // Effect to load vault from URL params when data is available
  React.useEffect(() => {
    if (data && data.length > 0) {
      const vaultAddress = searchParams.get('vault')
      const chainId = searchParams.get('chainId')

      if (vaultAddress && chainId) {
        const foundVault = data.find(
          (vault) =>
            vault.address.toLowerCase() === vaultAddress.toLowerCase() &&
            vault.chainId === Number(chainId)
        )

        if (foundVault && !selectedVault?.address) {
          setSelectedVault(foundVault as KongVault)
          setDeltaValue(0n) // Trigger initial APR Oracle call
        }
      }
    }
  }, [data, searchParams, selectedVault?.address])

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

  // Compute display list by merging discovered entries when searching by address
  const displayVaults: VaultData[] = React.useMemo(() => {
    if (!searchTerm || !isAddress(searchTerm)) return filteredVaults
    const merged = [...filteredVaults, ...(discoveredVaults || [])]
    const seen = new Set<string>()
    return merged.filter((v) => {
      const key = `${v.chainId}-${v.address.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [filteredVaults, discoveredVaults, searchTerm])

  // Track which items came from on-chain discovery for UI indicators
  const discoveredSet = React.useMemo(() => {
    const set = new Set<string>()
    ;(discoveredVaults || []).forEach((v) =>
      set.add(`${v.chainId}-${v.address.toLowerCase()}`)
    )
    return set
  }, [discoveredVaults])

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
    if (!selectedVault?.address) {
      alert('Please select a vault')
      return
    }

    // Use 0 as default if no input value is provided
    const inputAmount = inputValue.formValue || '0'

    // Calculate delta for the APR Oracle call
    const delta = calculateDelta(
      inputAmount,
      selectedVault.asset?.decimals || 18,
      selectedAsset === 'USD',
      assetPrice || undefined
    )

    setDeltaValue(delta)
  }

  const balance = 0n

  // Find the full vault with logos for InputDepositAmount
  const selectedVaultWithLogos = data?.find(
    (vault) => vault.address === selectedVault?.address
  )

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <YearnLoader fixed={true} />
      </div>
    )
  }

  return (
    <div className="w-full h-full pb-16 flex justify-center items-center gap-4">
      <div className="w-[500px] h-full max-h-[500px] flex flex-col justify-start items-start gap-2.5">
        <div className="w-full flex-1 p-3 bg-white/10 rounded-[36px] flex flex-col justify-start items-start gap-2.5">
          <div className="w-full flex-1 p-2 bg-white rounded-[30px] overflow-hidden flex justify-start items-center gap-5">
            <div className="w-full flex-1 self-stretch px-3 py-[14px] rounded-[12px] flex flex-col justify-start items-center gap-5">
              {/* Select Vault */}
              <div className="w-full p-2 overflow-hidden border-b border-[#1A51B2] flex flex-col justify-center items-start gap-2">
                <div className="px-3 flex justify-center items-center gap-2.5">
                  <div className="text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Select a Yearn Vault to Query:
                  </div>
                </div>
                <VaultSelectButton
                  selectedVault={selectedVault}
                  onClick={handleSelectVault}
                  disabled={isLoading}
                  className="max-w-full overflow-hidden"
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
                    </div>
                  </div>
                }
              >
                <ModalData
                  data={displayVaults}
                  searchTerm={searchTerm}
                  isLoading={isLoading}
                  error={error}
                  discoveredSet={discoveredSet}
                  isProbingOnChain={
                    isAddress(searchTerm) &&
                    filteredVaults.length === 0 &&
                    isDiscovering
                  }
                  onClose={handleCloseVaultModal}
                  onSelect={(vault) => {
                    setSelectedVault(vault as KongVault)
                    setDeltaValue(0n) // Set delta to 0n to trigger initial APR Oracle call
                    updateUrlWithVault(vault) // Add this line to update URL
                    handleCloseVaultModal()
                  }}
                />
              </Modal>

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
                  assetPrice={assetPrice}
                  onCurrencyChange={(newCurrency) =>
                    setSelectedAsset(newCurrency)
                  }
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
                  <div className="flex-1 text-right text-base font-normal text-sm leading-8 font-aeonik-mono">
                    {selectedVault?.address ? (
                      isAprOracleLoading ? (
                        <span className="text-[#9E9E9E]">Loading...</span>
                      ) : aprOracleError ? (
                        <span className="text-[#9E9E9E]">
                          Error loading APR
                        </span>
                      ) : aprOracleResult?.currentApr ? (
                        <span className="text-[#1E1E1E]">
                          {aprOracleResult.currentApr}
                        </span>
                      ) : (
                        <span className="text-[#9E9E9E]">Error</span>
                      )
                    ) : (
                      <span className="text-[#9E9E9E]">Select vault</span>
                    )}
                  </div>
                </div>
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Projected APY:
                  </div>
                  <div className="flex-1 text-right text-base font-normal text-sm leading-8 font-aeonik-mono">
                    {deltaValue !== undefined && deltaValue > 0n ? (
                      isAprOracleLoading ? (
                        <span className="text-[#9E9E9E]">Loading...</span>
                      ) : aprOracleError ? (
                        <span className="text-[#9E9E9E]">
                          Error loading APR
                        </span>
                      ) : aprOracleResult?.projectedApr ? (
                        <span className="text-[#1E1E1E]">
                          {aprOracleResult.projectedApr}
                        </span>
                      ) : (
                        <span className="text-[#9E9E9E]">Error</span>
                      )
                    ) : (
                      <span className="text-[#9E9E9E]">
                        Input deposit value
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Percent Change:
                  </div>
                  <div className="flex-1 text-right text-base font-normal text-sm leading-8 font-aeonik-mono">
                    {deltaValue !== undefined && deltaValue > 0n ? (
                      aprOracleResult?.percentChange ? (
                        <span
                          className={
                            aprOracleResult?.percentChange.startsWith('+')
                              ? 'text-green-600'
                              : aprOracleResult.percentChange.startsWith('-')
                                ? 'text-red-600'
                                : 'text-[#1E1E1E]'
                          }
                        >
                          {aprOracleResult.percentChange}
                        </span>
                      ) : (
                        <span className="text-[#9E9E9E]">Error</span>
                      )
                    ) : (
                      <span className="text-[#9E9E9E]">
                        Input deposit value
                      </span>
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
  data?: VaultData[]
  searchTerm?: string
  isLoading?: boolean
  error?: Error | null
  isProbingOnChain?: boolean
  discoveredSet?: Set<string>
  onClose: () => void
  onSelect: (vault: VaultData) => void
}

// Helper components for common modal layouts
const ModalContainer: React.FC<{
  children: React.ReactNode
  hasTopPadding?: boolean
}> = ({ children, hasTopPadding = false }) => (
  <div className={`flex flex-col gap-1 p-4 ${hasTopPadding ? '' : 'pt-0'}`}>
    {children}
  </div>
)

const CenteredContent: React.FC<{
  children: React.ReactNode
  variant?: 'single' | 'stacked'
}> = ({ children, variant = 'single' }) => (
  <div
    className={`flex ${variant === 'single' ? 'justify-center items-center' : 'flex-col justify-center items-center'} h-[490px] ${variant === 'stacked' ? 'gap-2' : ''}`}
  >
    {children}
  </div>
)

const CloseButton: React.FC<{
  onClick: () => void
  marginTop?: 'mt-2' | 'mt-4'
}> = ({ onClick, marginTop = 'mt-2' }) => (
  <Button className={marginTop} variant="outlined" onClick={onClick}>
    Close
  </Button>
)

const ModalData: React.FC<ModalDataProps> = ({
  data,
  searchTerm,
  isLoading,
  error,
  isProbingOnChain,
  discoveredSet,
  onClose,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <ModalContainer hasTopPadding>
        <CenteredContent>
          <div className="text-gray-500">Loading vaults...</div>
        </CenteredContent>
        <CloseButton onClick={onClose} marginTop="mt-4" />
      </ModalContainer>
    )
  }

  if (error) {
    return (
      <ModalContainer>
        <CenteredContent>
          <div className="text-red-500">
            Error loading vaults: {error.message}
          </div>
        </CenteredContent>
        <CloseButton onClick={onClose} />
      </ModalContainer>
    )
  }

  const vaults = Array.isArray(data) && data.length > 0 ? data : []

  // Empty state when no results found after search
  if (searchTerm?.trim() && vaults.length === 0) {
    return (
      <ModalContainer>
        <CenteredContent variant="stacked">
          {isProbingOnChain ? (
            <>
              <div className="mb-2">
                <YearnLoader fixed={false} color="blue" />
              </div>
              <div className="text-gray-500 text-lg text-center">
                No vaults found in Indexer with matching address, looking
                directly on chain.
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-500 text-lg">No vaults found</div>
              <div className="text-gray-400 text-sm">
                Try searching for a different vault name, chain, or address
              </div>
            </>
          )}
        </CenteredContent>
        <CloseButton onClick={onClose} />
      </ModalContainer>
    )
  }

  return (
    <ModalContainer>
      {/* Virtual Scrolling Vault List */}
      <VirtualScrollList
        items={vaults}
        itemHeight={70} // 70px item height
        containerHeight={490} // 70px * 7 rows
        className="w-full"
        renderItem={(vault, index, isVisible) => (
          <VaultListItem
            key={vault.address || index}
            vault={vault}
            searchTerm={searchTerm}
            isVisible={isVisible}
            discovered={discoveredSet?.has(
              `${vault.chainId}-${vault.address.toLowerCase()}`
            )}
            onClick={() => onSelect(vault)}
          />
        )}
      />
      <CloseButton onClick={onClose} />
    </ModalContainer>
  )
}
