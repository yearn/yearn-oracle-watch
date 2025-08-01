import React from 'react'
import { Modal } from '@/components/shared/Modal'
import {
  useMetadata,
  type EntityType,
  type VaultMetadata,
} from '@/hooks/useMetadata'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'
import { getSvgAsset } from '@/utils/logos'
import { getAddress } from 'viem'

export interface MetadataModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
  chainId: number
}

const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  chainId,
}) => {
  const { data, isLoading, error } = useMetadata({
    entityType,
    entityId,
    chainId,
    enabled: isOpen,
  })

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const renderVaultMetadata = (vault: VaultMetadata) => (
    <div className="flex flex-col gap-6 p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <img
          className="w-12 h-12 min-w-12 min-h-12 rounded-lg"
          src={getSvgAsset(chainId, getAddress(vault.asset.address))}
          alt={vault.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://placehold.co/48x48/cccccc/666666?text=🏦'
          }}
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 font-aeonik">
            {vault.name} ({vault.symbol})
          </h2>
          <p className="text-sm text-gray-600 font-aeonik">
            {CHAIN_ID_TO_NAME[chainId]} • {vault.address}
          </p>
        </div>
      </div>

      {/* Performance Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 font-aeonik">
          Performance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-aeonik">Current APY</p>
            <p className="text-lg font-semibold text-gray-900 font-aeonik-mono">
              {vault.apy.net.toFixed(2)}% (Net)
            </p>
            <p className="text-sm text-gray-500 font-aeonik-mono">
              {vault.apy.gross.toFixed(2)}% (Gross)
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-aeonik">TVL</p>
            <p className="text-lg font-semibold text-gray-900 font-aeonik-mono">
              ${vault.tvl.value.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-aeonik">Management Fee</p>
            <p className="text-lg font-semibold text-gray-900 font-aeonik-mono">
              {vault.fees.management.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-aeonik">Performance Fee</p>
            <p className="text-lg font-semibold text-gray-900 font-aeonik-mono">
              {vault.fees.performance.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Risk Assessment Section */}
      {vault.risk &&
        Object.values(vault.risk).some((val) => val !== undefined) && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 font-aeonik">
              Risk Assessment
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {vault.risk.label && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-aeonik">
                    Overall Score:
                  </span>
                  <span className="text-sm font-medium text-gray-900 font-aeonik">
                    {vault.risk.label}
                  </span>
                </div>
              )}
              {vault.risk.auditScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-aeonik">
                    Audit Score:
                  </span>
                  <span className="text-sm font-medium text-gray-900 font-aeonik-mono">
                    {vault.risk.auditScore}/100
                  </span>
                </div>
              )}
              {vault.risk.codeReviewScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-aeonik">
                    Code Review:
                  </span>
                  <span className="text-sm font-medium text-gray-900 font-aeonik-mono">
                    {vault.risk.codeReviewScore}/100
                  </span>
                </div>
              )}
              {vault.risk.protocolSafetyScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-aeonik">
                    Protocol Safety:
                  </span>
                  <span className="text-sm font-medium text-gray-900 font-aeonik-mono">
                    {vault.risk.protocolSafetyScore}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Management Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 font-aeonik">
          Management
        </h3>
        <div className="space-y-2">
          {vault.governance && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-aeonik">
                Governance:
              </span>
              <span className="text-sm font-mono text-gray-900 break-all">
                {vault.governance}
              </span>
            </div>
          )}
          {vault.management && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-aeonik">
                Management:
              </span>
              <span className="text-sm font-mono text-gray-900 break-all">
                {vault.management}
              </span>
            </div>
          )}
          {vault.guardian && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-aeonik">
                Guardian:
              </span>
              <span className="text-sm font-mono text-gray-900 break-all">
                {vault.guardian}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Strategies Section */}
      {vault.strategies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 font-aeonik">
            Strategies ({vault.strategies.length})
          </h3>
          <div className="space-y-2">
            {vault.strategies.slice(0, 5).map((strategy, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm">📊</span>
                <span className="text-sm text-gray-900 font-mono break-all">
                  {strategy}
                </span>
              </div>
            ))}
            {vault.strategies.length > 5 && (
              <p className="text-sm text-gray-500 font-aeonik">
                ... and {vault.strategies.length - 5} more strategies
              </p>
            )}
          </div>
        </div>
      )}

      {/* External Links Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 font-aeonik">
          External Links
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => handleExternalLink(vault.links.analytics)}
            className="flex items-center gap-2 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-blue-600">🔗</span>
            <span className="text-sm text-blue-700 font-aeonik">
              View in Yearn Analytics
            </span>
          </button>
          <button
            onClick={() => handleExternalLink(vault.links.userInterface)}
            className="flex items-center gap-2 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-green-600">🔗</span>
            <span className="text-sm text-green-700 font-aeonik">
              Open in Yearn App
            </span>
          </button>
          <button
            onClick={() => handleExternalLink(vault.links.blockExplorer)}
            className="flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-600">🔗</span>
            <span className="text-sm text-gray-700 font-aeonik">
              View on Block Explorer
            </span>
          </button>
          {vault.links.github && (
            <button
              onClick={() =>
                vault.links.github && handleExternalLink(vault.links.github)
              }
              className="flex items-center gap-2 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <span className="text-purple-600">🔗</span>
              <span className="text-sm text-purple-700 font-aeonik">
                GitHub Repository
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500 font-aeonik">Loading metadata...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-red-500 font-aeonik">
            Error loading metadata: {error.message}
          </div>
        </div>
      )
    }

    if (!data) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500 font-aeonik">No metadata available</div>
        </div>
      )
    }

    if (entityType === 'vault') {
      return renderVaultMetadata(data as VaultMetadata)
    }

    // TODO: Add rendering for other entity types
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500 font-aeonik">
          Metadata view for {entityType} not yet implemented
        </div>
      </div>
    )
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        <span className="text-lg font-semibold font-aeonik">
          {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Metadata
        </span>
      }
    >
      {renderContent()}
    </Modal>
  )
}

export default MetadataModal
