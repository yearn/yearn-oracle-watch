import { useQuery } from '@tanstack/react-query'
import { useSdk } from '@/context/Sdk'
import { Address } from 'viem'

export type EntityType = 'vault' | 'strategy' | 'token'

export interface UseMetadataOptions {
  entityType: EntityType
  entityId?: string
  chainId?: number
  enabled?: boolean
}

export interface SparklinePoint {
  address: string
  blockTime: string
  chainId: number
  close: number
  label: string
}

export interface VaultMetadata {
  // Basic Information
  address: string
  name: string
  symbol: string
  chainId: number

  // Asset Information
  asset: {
    address: string
    name: string
    symbol: string
    decimals: number
  }

  // Financial Data
  tvl: {
    value: number
    usd: number
  }
  apy: {
    gross: number
    net: number
  }
  fees: {
    management: number
    performance: number
  }

  // Risk Assessment
  risk: {
    auditScore?: number
    codeReviewScore?: number
    complexityScore?: number
    protocolSafetyScore?: number
    teamKnowledgeScore?: number
    testingScore?: number
    label?: string
  }

  // Governance & Management
  governance?: string
  management?: string
  guardian?: string

  // Performance Metrics
  sparklines: {
    apy: SparklinePoint[]
    tvl: SparklinePoint[]
  }

  // Strategies
  strategies: string[]

  // External Links
  links: {
    analytics: string
    userInterface: string
    blockExplorer: string
    github?: string
  }
}

export interface StrategyMetadata {
  // Placeholder for future strategy metadata
  address: string
  name: string
  // TODO: Expand when implementing strategy metadata
}

export interface TokenMetadata {
  // Placeholder for future token metadata
  address: string
  symbol: string
  // TODO: Expand when implementing token metadata
}

export type MetadataType = VaultMetadata | StrategyMetadata | TokenMetadata

export interface MetadataResult {
  data: MetadataType | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// Helper function to generate external links
const generateExternalLinks = (
  entityType: EntityType,
  address: string,
  chainId: number
): VaultMetadata['links'] => {
  const blockExplorerUrls: Record<number, string> = {
    1: 'https://etherscan.io',
    10: 'https://optimistic.etherscan.io',
    137: 'https://polygonscan.com',
    8453: 'https://basescan.org',
    42161: 'https://arbiscan.io',
    250: 'https://ftmscan.com',
  }

  const blockExplorer = blockExplorerUrls[chainId] || 'https://etherscan.io'

  return {
    analytics: `https://yearn-powerglove.vercel.app/vaults/${chainId}/${address}`,
    userInterface: `https://yearn.fi/v3/${chainId}/${address}`,
    blockExplorer: `${blockExplorer}/address/${address}`,
    github: 'https://github.com/yearn',
  }
}

export function useMetadata(options: UseMetadataOptions): MetadataResult {
  const { entityType, entityId, chainId, enabled = true } = options
  const sdk = useSdk()

  const query = useQuery({
    queryKey: ['metadata', entityType, entityId, chainId],
    queryFn: async (): Promise<MetadataType | null> => {
      if (!entityId || !chainId || !sdk) {
        return null
      }

      if (entityType === 'vault') {
        try {
          // Use the public Kong method
          const result = await sdk.core.kong.getVaultMetadata(entityId, chainId)

          if (!result?.vault) {
            throw new Error('Vault not found')
          }

          const vault = result.vault

          // Transform the data to match our VaultMetadata interface
          const metadata: VaultMetadata = {
            address: vault.address || entityId,
            name: vault.name || 'Unknown Vault',
            symbol: vault.symbol || 'UNKNOWN',
            chainId: vault.chainId || chainId,

            asset: {
              address: vault.asset?.address || '',
              name: vault.asset?.name || '',
              symbol: vault.asset?.symbol || '',
              decimals: vault.asset?.decimals || 18,
            },

            tvl: {
              value: parseFloat(vault.totalAssets || '0'),
              usd: 0, // TODO: Calculate USD value
            },

            apy: {
              gross: vault.apy?.grossApr || 0,
              net: vault.apy?.net || 0,
            },

            fees: {
              management: vault.fees?.managementFee || 0,
              performance: vault.fees?.performanceFee || 0,
            },

            risk: {
              auditScore: vault.risk?.auditScore ?? undefined,
              codeReviewScore: vault.risk?.codeReviewScore ?? undefined,
              complexityScore: vault.risk?.complexityScore ?? undefined,
              protocolSafetyScore: vault.risk?.protocolSafetyScore ?? undefined,
              teamKnowledgeScore: vault.risk?.teamKnowledgeScore ?? undefined,
              testingScore: vault.risk?.testingScore ?? undefined,
              label: vault.risk?.label ?? undefined,
            },

            governance: vault.governance ?? undefined,
            management: vault.management ?? undefined,
            guardian: vault.guardian ?? undefined,

            sparklines: {
              apy: (vault.sparklines?.apy || []).filter(
                (point): point is NonNullable<typeof point> => point !== null
              ),
              tvl: (vault.sparklines?.tvl || []).filter(
                (point): point is NonNullable<typeof point> => point !== null
              ),
            },

            strategies: (vault.strategies || []).filter(
              (strategy): strategy is string => strategy !== null
            ),

            links: generateExternalLinks(entityType, entityId, chainId),
          }

          return metadata
        } catch (error) {
          console.error('Error fetching vault metadata:', error)
          throw error
        }
      }

      // For now, return null for other entity types
      // TODO: Implement strategy and token metadata fetching
      return null
    },
    enabled: enabled && !!entityId && !!chainId && !!sdk,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
