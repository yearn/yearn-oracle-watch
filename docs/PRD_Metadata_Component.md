# Product Requirements Document: Metadata Component System

## Overview

This PRD outlines the development of a universal metadata component system that can be summoned for any metadata-enabled component to display comprehensive data about elements within the component. The primary use case is providing detailed vault information when users interact with vault components.

## Problem Statement

Currently, users viewing vault information in components like `VaultSelectButton` have limited access to comprehensive vault data. Users need quick access to detailed metadata, analytics links, and external resources without navigating away from their current workflow.

## Solution

Create a metadata overlay/modal system that can be triggered via middle mouse button click on any metadata-enabled component. This system will:

1. Fetch comprehensive data from Kong API
2. Display rich metadata in an accessible format
3. Provide useful external links to analytics and main user interface
4. Be reusable across different component types

## Technical Requirements

### Core Components

#### 1. Metadata Component (`MetadataModal.tsx`)

A universal modal component that displays metadata for any supported entity type.

```tsx
interface MetadataModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'vault' | 'strategy' | 'token'
  entityId: string
  chainId: number
}
```

#### 2. Metadata Provider (`useMetadata.ts`)

A React hook that manages metadata fetching and caching.

```tsx
interface UseMetadataOptions {
  entityType: 'vault' | 'strategy' | 'token'
  entityId?: string
  chainId?: number
  enabled?: boolean
}

interface MetadataResult {
  data: VaultMetadata | StrategyMetadata | TokenMetadata | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

#### 3. Metadata HOC (`withMetadata.tsx`)

A higher-order component that adds metadata functionality to existing components.

```tsx
interface WithMetadataProps {
  enableMetadata?: boolean
  metadataConfig?: {
    entityType: 'vault' | 'strategy' | 'token'
    entityId: string
    chainId: number
  }
}
```

### Data Structures

#### Vault Metadata

Based on Kong GraphQL schema, comprehensive vault metadata will include:

```typescript
interface VaultMetadata {
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
  governance: string
  management: string
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
```

### Kong API Integration

#### Metadata Query

Extend existing Kong GraphQL queries to fetch comprehensive metadata:

```graphql
query GetVaultMetadata($address: String!, $chainId: Int!) {
  vault(address: $address, chainId: $chainId) {
    address
    name
    symbol
    chainId
    
    asset {
      address
      name
      symbol
      decimals
    }
    
    apy {
      grossApr
      net
      inceptionNet
      monthlyNet
      weeklyNet
    }
    
    fees {
      managementFee
      performanceFee
    }
    
    risk {
      auditScore
      codeReviewScore
      complexityScore
      protocolSafetyScore
      teamKnowledgeScore
      testingScore
      label
    }
    
    governance
    management
    guardian
    
    sparklines {
      apy {
        address
        blockTime
        chainId
        close
        label
      }
      tvl {
        address
        blockTime
        chainId
        close
        label
      }
    }
    
    strategies
    
    totalAssets
    totalSupply
    pricePerShare
    
    meta {
      description
      displayName
      displaySymbol
      protocols
    }
  }
}
```

### User Interface Design

#### Metadata Modal Layout

```text
┌─────────────────────────────────────────────────────────┐
│ [X] Vault Metadata - yvUSDC                            │
├─────────────────────────────────────────────────────────┤
│ ┌─────┐ Yearn USDC Vault (yvUSDC)                      │
│ │ 🏦  │ Ethereum • 0x5f18C75AbDAe578b483E5F43f12a39cF75b│
│ └─────┘                                                 │
├─────────────────────────────────────────────────────────┤
│ Performance                                             │
│ ├─ Current APY: 5.23% (Net) / 6.12% (Gross)           │
│ ├─ TVL: $42.3M                                         │
│ ├─ Price per Share: 1.0456                             │
│ └─ [APY Chart] [TVL Chart]                             │
├─────────────────────────────────────────────────────────┤
│ Risk Assessment                                         │
│ ├─ Overall Score: B+ (Safe)                            │
│ ├─ Audit Score: 85/100                                 │
│ ├─ Code Review: 92/100                                 │
│ └─ Protocol Safety: 88/100                             │
├─────────────────────────────────────────────────────────┤
│ Management                                              │
│ ├─ Governance: 0x9BC7c6ad7E7Cf3A6fCB58fb3e40e3ea5Cd │
│ ├─ Management: 0x16388463d60FFE0661Cf7F1f31a7D658aC │
│ └─ Guardian: 0x846e211e8ba920B353FB717631C015cf04dd │
├─────────────────────────────────────────────────────────┤
│ Strategies (3)                                          │
│ ├─ [📊] Compound USDC Strategy                         │
│ ├─ [📊] Aave USDC Strategy                             │
│ └─ [📊] Curve USDC Strategy                            │
├─────────────────────────────────────────────────────────┤
│ External Links                                          │
│ ├─ [🔗] View in Yearn Analytics                        │
│ ├─ [🔗] Open in Yearn App                              │
│ ├─ [🔗] View on Etherscan                              │
│ └─ [🔗] GitHub Repository                               │
└─────────────────────────────────────────────────────────┘
```

## User Experience Flow

### 1. Component Interaction

```text
User middle-clicks on VaultSelectButton
↓
System detects metadata-enabled component
↓
Extract metadata configuration (vault address, chain ID)
↓
Trigger metadata modal
```

### 2. Data Fetching

```text
Modal opens with loading state
↓
Hook fetches vault metadata from Kong API
↓
Data is cached for subsequent views
↓
Modal displays comprehensive information
```

### 3. External Navigation

```text
User clicks external link
↓
Opens in new tab/window
↓
User returns to original workflow
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)

1. Create `MetadataModal` component with basic layout
2. Implement `useMetadata` hook with Kong integration
3. Add metadata queries to Kong GraphQL schema
4. Create `withMetadata` HOC

### Phase 2: VaultSelectButton Integration (Week 2-3)

1. Modify `VaultSelectButton` to support metadata
2. Add middle mouse button event handling
3. Integrate metadata modal with vault selection
4. Test with existing vault data

### Phase 3: Rich UI Components (Week 3-4)

1. Create sparkline chart components for APY/TVL
2. Design risk assessment visualization
3. Implement strategy list with metadata links
4. Add responsive design for different screen sizes

### Phase 4: External Links & Analytics (Week 4-5)

1. Create link generator utilities for external services
2. Implement analytics tracking for metadata usage
3. Add GitHub integration for strategy repositories
4. Create block explorer link generators

### Phase 5: Extension & Testing (Week 5-6)

1. Extend to other component types (strategies, tokens)
2. Add comprehensive error handling
3. Implement accessibility features
4. Performance testing and optimization

## Success Metrics

### Technical Performance

- Modal load time (target: <500ms)
- API response time (target: <300ms)
- Error rate (target: <1%)

### User Satisfaction

- Reduced support tickets about vault information
- Positive user feedback on feature utility
- Increased user engagement with analytics platform
- feels good

## Technical Considerations

### Accessibility

(Low Priority, focus on simple, minimal styling. This is a pro tool)

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Performance

- Implement data caching strategy
- Lazy loading for heavy components
- Optimistic updates where possible
- Bundle size impact assessment

### Error Handling

- Graceful degradation for API failures
- Offline state handling
- User-friendly error messages
- Fallback data sources

### Security

- Sanitize external URLs
- Validate metadata responses
- Rate limiting for API calls
- Safe external link handling

## External Dependencies

### Yearn Ecosystem Links

- **Analytics**: `https://yearn-powerglove.vercel.app/vaults/{chainId}/{address}`
- **Main App**: `https://yearn.fi/vault/{chainId}/{address}`
- **Governance**: `https://gov.yearn.fi/proposal/{proposalId}`

### Block Explorers

- Ethereum: `https://etherscan.io/address/{address}`
- Arbitrum: `https://arbiscan.io/address/{address}`
- Polygon: `https://polygonscan.com/address/{address}`
- Base: `https://basescan.org/address/{address}`

### Additional Data Sources

- **Defillama**: `https://defillama.com/protocol/yearn-finance`
- **GitHub**: `https://github.com/yearn/yearn-vaults-v3/tree/master/contracts/VaultV3.vy`

## Future Enhancements

### Advanced Features

1. **Comparative Analysis**: Compare multiple vaults side-by-side
2. **Historical Performance**: Extended time-range analysis
3. **Alerts**: Set up performance notifications
4. **Social Features**: Share vault analysis with others

### Integration Opportunities

1. **Portfolio Tracking**: Connect with user portfolios
2. **Strategy Deep Dive**: Detailed strategy metadata
3. **Token Analysis**: ERC20 token metadata system
4. **Cross-chain Data**: Multi-chain vault comparisons

## Conclusion

The metadata component system will significantly enhance user experience by providing immediate access to comprehensive vault information without disrupting their workflow. The modular design ensures extensibility for future entity types while maintaining consistency across the application.

The implementation leverages existing Kong infrastructure and follows established design patterns, ensuring maintainability and performance. The phased approach allows for iterative development and user feedback incorporation throughout the process.
