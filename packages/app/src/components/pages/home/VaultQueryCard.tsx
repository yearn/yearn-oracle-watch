import React from 'react'
import { useAprOracle } from '@/hooks/useAprOracle'
import Button from '@/components/shared/Button'
import VaultSelectButton, {
  type KongVault,
} from '@/components/shared/VaultSelectButton'
import { InputTokenAmount } from '@/components/shared/InputTokenAmount2'
import { useInput } from '@/hooks/useInput'
import { Modal } from '@/components/shared/Modal'
import { getSvgAsset } from '@/utils/logos'
import { getAddress } from 'viem'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'

const VaultQueryCard: React.FC = () => {
  // State and handlers at the top
  const [selectedAsset, setSelectedAsset] = React.useState('USD')
  const [selectedVault, setSelectedVault] = React.useState({} as KongVault)
  const [vaultModalOpen, setVaultModalOpen] = React.useState(false)
  const handleSelectVault = () => {
    setVaultModalOpen(true)
  }
  const handleCloseVaultModal = () => {
    setVaultModalOpen(false)
  }
  const handleQuery = () => {
    alert('Query AprOracle')
  }
  const { data } = useAprOracle()
  console.log('Vaults Data:', data)
  const input = useInput(18) // Use actual useInput hook with 18 decimals
  const vaultSymbol = 'yvUSDC'
  const balance = 0n

  return (
    <div className="w-full h-full pb-16 flex justify-center items-center gap-4">
      <div className="w-[500px] h-full max-h-[500px] flex flex-col justify-start items-start gap-2.5">
        <div className="w-full flex-1 p-3 bg-white/10 rounded-[36px] flex flex-col justify-start items-start gap-2.5">
          <div className="w-full flex-1 p-2 bg-white rounded-[30px] overflow-hidden flex justify-start items-center gap-5">
            <div className="flex-1 self-stretch px-3 py-[14px] rounded-[12px] flex flex-col justify-start items-center gap-5">
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
                />
              </div>
              {/* Vault Select Modal */}
              <Modal
                open={vaultModalOpen}
                onClose={handleCloseVaultModal}
                title={
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Search vaults..."
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-0 text-base font-aeonik"
                      value={''}
                      onChange={() => {}}
                      // TODO: Implement search state and logic
                    />
                  </div>
                }
              >
                <ModalData
                  data={data}
                  onClose={handleCloseVaultModal}
                  onSelect={(vault) => {
                    setSelectedVault(vault)
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
                <InputTokenAmount
                  input={input as any}
                  className="w-full p-1 bg-black/5 rounded-[16px] outline outline-1 outline-black/10 -outline-offset-1"
                  symbol={selectedAsset}
                  defaultSymbol="USD"
                  balance={balance}
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
                  disabled={selectedVault === undefined}
                >
                  <span className="text-center text-white text-base font-bold leading-8 font-aeonik">
                    Query AprOracle
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
                    select vault to see
                  </div>
                </div>
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Projected APY:
                  </div>
                  <div className="flex-1 text-right text-[#9E9E9E] text-base font-normal leading-8 font-aeonik-mono">
                    query to generate
                  </div>
                </div>
                <div className="w-full h-8 px-5 overflow-hidden border-b border-[#1A51B2] flex justify-center items-center gap-2.5">
                  <div className="flex-1 text-[#1E1E1E] text-base font-normal leading-8 font-aeonik">
                    Percent Change:
                  </div>
                  <div className="flex-1 text-right text-[#9E9E9E] text-base font-normal leading-8 font-aeonik-mono">
                    query to generate
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
  data?: KongVault[]
  onClose: () => void
  onSelect: (vault: KongVault) => void
}

const ModalData: React.FC<ModalDataProps> = ({ data, onClose, onSelect }) => {
  const vaults = Array.isArray(data) && data.length > 0 ? data : []

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Vault List */}
      <div
        className="overflow-y-auto w-full"
        style={{ maxHeight: 350, minHeight: 100 }}
      >
        {vaults.map((vault, idx) => (
          <div
            key={vault.address || idx}
            className="h-[70px] px-6 py-1 bg-gray-100/50 overflow-hidden rounded-[16px] flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-200/50"
            onClick={() => onSelect(vault)}
          >
            <div className="flex items-center gap-2 px-2">
              <img
                className="w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 relative"
                src={getSvgAsset(
                  Number(vault.chainId),
                  getAddress(vault.asset?.address as string)
                )}
                alt={vault.name as string}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://placehold.co/32x32/cccccc/666666?text=?'
                }}
              />
              <div className="flex flex-col items-start justify-start">
                <div className="text-[#1E1E1E] text-[16px] font-aeonik font-normal leading-5">
                  {vault.name}
                </div>
                <div className="text-center text-[#3D3D3D] text-[10px] font-aeonik font-normal leading-[14px]">
                  {CHAIN_ID_TO_NAME[Number(vault.chainId)]}
                </div>
                <div className="text-center text-[#3D3D3D] text-[10px] font-aeonik font-normal leading-[14px]">
                  {vault.address}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-4" variant="outlined" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
