import React from 'react'
import { useMetadataContext } from '@/context/MetadataContext'
import { useMetadata, type VaultMetadata } from '@/hooks/useMetadata'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'
import { getSvgAsset } from '@/utils/logos'
import { getAddress } from 'viem'

export const MetadataPanel: React.FC = () => {
  const { isOpen, config, closeMetadata } = useMetadataContext()

  const { data, isLoading, error } = useMetadata({
    entityType: config?.entityType || 'vault',
    entityId: config?.entityId || '',
    chainId: config?.chainId || 1,
    enabled: isOpen && !!config,
  })

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const renderVaultMetadata = (vault: VaultMetadata) => (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <img
          className="w-10 h-10 min-w-10 min-h-10 rounded-lg"
          src={getSvgAsset(config!.chainId, getAddress(vault.asset.address))}
          alt={vault.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://placehold.co/40x40/cccccc/666666?text=🏦'
          }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 font-aeonik truncate">
            {vault.name} ({vault.symbol})
          </h2>
          <p className="text-xs text-gray-600 font-aeonik truncate">
            {CHAIN_ID_TO_NAME[config!.chainId]} • {vault.address}
          </p>
        </div>
      </div>

      {/* Performance Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 font-aeonik">
          Performance
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 font-aeonik">Current APY</p>
            <p className="text-sm font-semibold text-gray-900 font-aeonik-mono">
              {vault.apy.net.toFixed(2)}% (Net)
            </p>
            <p className="text-xs text-gray-500 font-aeonik-mono">
              {vault.apy.gross.toFixed(2)}% (Gross)
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 font-aeonik">TVL</p>
            <p className="text-sm font-semibold text-gray-900 font-aeonik-mono">
              ${vault.tvl.value.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 font-aeonik">Management Fee</p>
            <p className="text-sm font-semibold text-gray-900 font-aeonik-mono">
              {vault.fees.management.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 font-aeonik">Performance Fee</p>
            <p className="text-sm font-semibold text-gray-900 font-aeonik-mono">
              {vault.fees.performance.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Risk Assessment Section */}
      {vault.risk &&
        Object.values(vault.risk).some((val) => val !== undefined) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 font-aeonik">
              Risk Assessment
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              {vault.risk.label && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600 font-aeonik">
                    Overall Score:
                  </span>
                  <span className="text-xs font-medium text-gray-900 font-aeonik">
                    {vault.risk.label}
                  </span>
                </div>
              )}
              {vault.risk.auditScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600 font-aeonik">
                    Audit Score:
                  </span>
                  <span className="text-xs font-medium text-gray-900 font-aeonik-mono">
                    {vault.risk.auditScore}/100
                  </span>
                </div>
              )}
              {vault.risk.codeReviewScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600 font-aeonik">
                    Code Review:
                  </span>
                  <span className="text-xs font-medium text-gray-900 font-aeonik-mono">
                    {vault.risk.codeReviewScore}/100
                  </span>
                </div>
              )}
              {vault.risk.protocolSafetyScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600 font-aeonik">
                    Protocol Safety:
                  </span>
                  <span className="text-xs font-medium text-gray-900 font-aeonik-mono">
                    {vault.risk.protocolSafetyScore}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Management Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 font-aeonik">
          Management
        </h3>
        <div className="space-y-2">
          {vault.governance && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 font-aeonik">
                Governance:
              </span>
              <span className="text-xs font-mono text-gray-900 break-all max-w-[50%] text-right">
                {vault.governance}
              </span>
            </div>
          )}
          {vault.management && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 font-aeonik">
                Management:
              </span>
              <span className="text-xs font-mono text-gray-900 break-all max-w-[50%] text-right">
                {vault.management}
              </span>
            </div>
          )}
          {vault.guardian && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 font-aeonik">
                Guardian:
              </span>
              <span className="text-xs font-mono text-gray-900 break-all max-w-[50%] text-right">
                {vault.guardian}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Strategies Section */}
      {vault.strategies.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 font-aeonik">
            Strategies ({vault.strategies.length})
          </h3>
          <div className="space-y-1">
            {vault.strategies.slice(0, 3).map((strategy, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-xs">📊</span>
                <span className="text-xs text-gray-900 font-mono break-all">
                  {strategy.length > 40
                    ? `${strategy.substring(0, 40)}...`
                    : strategy}
                </span>
              </div>
            ))}
            {vault.strategies.length > 3 && (
              <p className="text-xs text-gray-500 font-aeonik">
                ... and {vault.strategies.length - 3} more strategies
              </p>
            )}
          </div>
        </div>
      )}

      {/* External Links Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 font-aeonik">
          External Links
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => handleExternalLink(vault.links.analytics)}
            className="flex items-center gap-2 p-2 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors w-full"
          >
            <span className="text-blue-600 text-xs">📊</span>
            <span className="text-xs text-blue-700 font-aeonik">
              View in Yearn Analytics
            </span>
          </button>
          <button
            onClick={() => handleExternalLink(vault.links.userInterface)}
            className="flex items-center gap-2 p-2 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors w-full"
          >
            <span className="text-green-600 text-xs">🌐</span>
            <span className="text-xs text-green-700 font-aeonik">
              Open in Yearn App
            </span>
          </button>
          <button
            onClick={() => handleExternalLink(vault.links.blockExplorer)}
            className="flex items-center gap-2 p-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <span className="text-gray-600 text-xs">🔗</span>
            <span className="text-xs text-gray-700 font-aeonik">
              View on Block Explorer
            </span>
          </button>
          {vault.links.github && (
            <button
              onClick={() =>
                vault.links.github && handleExternalLink(vault.links.github)
              }
              className="flex items-center gap-2 p-2 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors w-full"
            >
              <span className="text-purple-600 text-xs">🔗</span>
              <span className="text-xs text-purple-700 font-aeonik">
                GitHub Repository
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (!config) return null

    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-sm text-gray-500 font-aeonik">Loading...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-sm text-red-500 font-aeonik">
            Error: {error.message}
          </div>
        </div>
      )
    }

    if (!data) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-sm text-gray-500 font-aeonik">
            No data available
          </div>
        </div>
      )
    }

    if (config.entityType === 'vault') {
      return renderVaultMetadata(data as VaultMetadata)
    }

    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-sm text-gray-500 font-aeonik">
          {config.entityType} not yet implemented
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        fixed top-28 bottom-0 left-0 bg-white shadow-xl border-r border-gray-200 z-40
        transition-transform duration-300 ease-out overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-120
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900 font-aeonik">
          {config?.entityType.charAt(0).toUpperCase() +
            config?.entityType.slice(1)}{' '}
          Metadata
        </h2>
        <button
          onClick={closeMetadata}
          className="text-gray-400 hover:text-gray-500 transition-colors p-1"
          aria-label="Close metadata panel"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  )
}
