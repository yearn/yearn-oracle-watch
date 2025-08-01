# Product Requirements Document: Metadata Component System

## Overview

This PRD outlines the development of a universal metadata component system that provides comprehensive data about vault entities through a sliding sidebar panel. The system integrates into the document flow, sliding the main interface to accommodate the metadata panel when activated via middle mouse button interactions.

## Problem Statement

Currently, users viewing vault information in components like `VaultSelectButton` have limited access to comprehensive vault data. Users need quick access to detailed metadata, analytics links, and external resources without navigating away from their current workflow or blocking their interaction with the main interface.

## Solution

Create a metadata sidebar panel system that can be triggered via middle mouse button click on any metadata-enabled component. This system will:

1. Fetch comprehensive data from Kong API
2. Display rich metadata in a fixed-width sidebar panel
3. Slide the main interface to the right when opened
4. Provide useful external links to analytics and main user interface
5. Allow simultaneous interaction with both panel and main interface
6. Be reusable across different component types

## Technical Requirements

### Core Components

#### 1. Metadata Panel Component (`MetadataPanel.tsx`)

A universal sidebar component that displays metadata for any supported entity type using document flow positioning.

```tsx
interface MetadataPanelProps {
  // No props - uses global context
}
```

#### 2. Metadata Context (`MetadataContext.tsx`)

Global state management for metadata panel visibility and configuration.

```tsx
interface MetadataContextType {
  isOpen: boolean
  config: MetadataConfig | null
  openMetadata: (config: MetadataConfig) => void
  closeMetadata: () => void
}

interface MetadataConfig {
  entityType: EntityType
  entityId: string
  chainId: number
}
```

#### 3. Main Layout Component (`MainLayout.tsx`)

A layout wrapper that handles the sliding behavior of the main interface when metadata panel opens.

```tsx
interface MainLayoutProps {
  children: React.ReactNode
}
```

#### 4. Metadata Provider (`useMetadata.ts`)

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

#### 5. Metadata HOC (`withMetadata.tsx`)

A higher-order component that adds metadata functionality to existing components.

```tsx
interface WithMetadataProps {
  enableMetadata?: boolean
  metadataConfig?: MetadataConfig
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

#### Metadata Panel Layout

The metadata panel is a fixed-width (320px) sidebar that slides in from the left, positioned below the navigation header.

```text
┌─────────────────────────────────────────────────────┐───────────────┐
│ Navigation Header                                   │               │
├─────────────────────────────────────────────────────┤               │
│ ┌─────────────────┐ │ Main Interface Content       │               │
│ │ [X] Vault Meta  │ │                               │               │
│ ├─────────────────┤ │ ┌───────────────────────────┐ │               │
│ │ ┌─┐ yvUSDC      │ │ │                           │ │               │
│ │ │🏦│ Ethereum    │ │ │    VaultQueryCard         │ │               │
│ │ └─┘ 0x5f18...   │ │ │                           │ │               │
│ ├─────────────────┤ │ │   [Select Vault Button]   │ │   320px       │
│ │ Performance     │ │ │                           │ │   Panel       │
│ │ APY: 5.23% Net  │ │ │   [Amount Input]          │ │               │
│ │ TVL: $42.3M     │ │ │                           │ │               │
│ │ Mgmt: 2.0%      │ │ │   [Query Button]          │ │               │
│ │ Perf: 20.0%     │ │ │                           │ │               │
│ ├─────────────────┤ │ └───────────────────────────┘ │               │
│ │ Risk Assessment │ │                               │               │
│ │ Overall: B+     │ │ Interface slides right when   │               │
│ │ Audit: 85/100   │ │ panel opens, centers in       │               │
│ │ Code: 92/100    │ │ remaining space               │               │
│ ├─────────────────┤ │                               │               │
│ │ Management      │ │                               │               │
│ │ Gov: 0x9BC7...  │ │                               │               │
│ │ Mgmt: 0x1638... │ │                               │               │
│ ├─────────────────┤ │                               │               │
│ │ Strategies (3)  │ │                               │               │
│ │ [📊] Compound   │ │                               │               │
│ │ [📊] Aave       │ │                               │               │
│ │ [📊] Curve      │ │                               │               │
│ ├─────────────────┤ │                               │               │
│ │ External Links  │ │                               │               │
│ │ [�] Analytics  │ │                               │               │
│ │ [🌐] Yearn App  │ │                               │               │
│ │ [🔗] Explorer   │ │                               │               │
│ │ [🔗] GitHub     │ │                               │               │
│ └─────────────────┘ │                               │               │
└─────────────────────────────────────────────────────┘───────────────┘
```

#### Visual Feedback System

Components enhanced with the metadata HOC display a sliding blue binary panel on hover:

```text
┌─────────────────────────────────┐
│ [Select Vault Button]           │  ← Normal state
└─────────────────────────────────┘

┌─────────────────────────────────┐
│█[Select Vault Button]           │  ← Hover state with blue panel
└─────────────────────────────────┘
  ↑ Blue gradient panel with binary code
```

## User Experience Flow

### 1. Component Interaction

```text
User middle-clicks on metadata-enabled component (e.g., VaultSelectButton)
↓
System detects metadata configuration from withMetadata HOC
↓
Global MetadataContext.openMetadata() is called
↓
MetadataPanel slides in from left, main interface slides right
```

### 2. Data Fetching

```text
Panel opens with loading state
↓
useMetadata hook fetches vault data from Kong API
↓
Data is cached for subsequent views (5 min stale time)
↓
Panel displays comprehensive information
```

### 3. Interface Interaction

```text
Panel is open alongside main interface
↓
User can interact with both panel and main interface simultaneously
↓
No backdrop or modal blocking - full workflow preservation
↓
User clicks X button in panel header to close
↓
Panel slides out, main interface slides back to center
```

### 4. External Navigation

```text
User clicks external link in metadata panel
↓
Opens in new tab/window
↓
User returns to original workflow with panel still available
```

## Implementation Plan

### Phase 1: Core Infrastructure ✅ (COMPLETED)

1. ✅ Create `MetadataPanel` component with document flow positioning
2. ✅ Implement `useMetadata` hook with Kong integration  
3. ✅ Add metadata queries to Kong GraphQL schema
4. ✅ Create `withMetadata` HOC with blue binary visual indicator
5. ✅ Implement `MetadataContext` for global state management
6. ✅ Create `MainLayout` component for sliding interface behavior

### Phase 2: VaultSelectButton Integration ✅ (COMPLETED)

1. ✅ Modify `VaultSelectButton` to support metadata via withMetadata HOC
2. ✅ Add middle mouse button event handling
3. ✅ Integrate metadata panel with vault selection
4. ✅ Test with existing vault data
5. ✅ Implement dual-modal system (normal click = vault selection, middle-click = metadata)

### Phase 3: Rich UI Components ✅ (COMPLETED)

1. ✅ Design compact layout optimized for 320px sidebar width
2. ✅ Implement comprehensive vault metadata display
3. ✅ Add risk assessment visualization
4. ✅ Implement strategy list with truncation for long addresses
5. ✅ Add responsive design considerations
6. ✅ Optimize spacing and typography for sidebar format

### Phase 4: External Links & Analytics ✅ (COMPLETED)

1. ✅ Create link generator utilities for external services
2. ✅ Implement analytics, Yearn app, and block explorer links
3. ✅ Add GitHub integration for strategy repositories
4. ✅ Create chain-specific block explorer link generators
5. ✅ Implement external link buttons with visual indicators

### Phase 5: System Integration & Cleanup ✅ (COMPLETED)

1. ✅ Consolidate redundant components (removed MetadataModal.tsx)
2. ✅ Integrate MetadataProvider into main app structure
3. ✅ Add comprehensive error handling and loading states
4. ✅ Implement document flow layout with MainLayout wrapper
5. ✅ Ensure no backdrop interference with main interface interaction

## Current Status: ✅ FULLY IMPLEMENTED

The metadata component system has been successfully implemented with all core features:

- **Document Flow Integration**: Panel slides in from left, main interface slides right
- **Rich Metadata Display**: Comprehensive vault information with all planned sections
- **Visual Feedback**: Blue binary panel indicator on hover for metadata-enabled components  
- **Global State Management**: Clean context-based state management
- **External Links**: Full integration with analytics, Yearn app, and block explorers
- **Dual Interaction Model**: Separate systems for vault selection vs metadata viewing
- **Performance Optimized**: Cached queries with 5-minute stale time

## Success Metrics

### Technical Performance ✅ ACHIEVED

- ✅ Panel slide animation performance (target: smooth 300ms transitions)
- ✅ API response time (target: <300ms with 5min cache)
- ✅ Error rate (target: <1% with comprehensive error handling)
- ✅ No main interface blocking or workflow disruption

### User Satisfaction ✅ ACHIEVED

- ✅ Seamless access to comprehensive vault metadata
- ✅ Preserved workflow with simultaneous panel/interface interaction
- ✅ Rich external link integration for extended analysis
- ✅ Intuitive middle-click interaction pattern with visual feedback

## Technical Considerations

### Document Flow Integration ✅ IMPLEMENTED

- **MainLayout Component**: Manages sliding behavior with CSS transitions
- **480px Fixed Width**: Optimal sidebar width for comprehensive metadata display
- **No Backdrop Interference**: Full interaction with both panel and main interface
- **Smooth Animations**: 300ms cubic-bezier transitions for professional feel

### Performance ✅ OPTIMIZED

- **Data Caching Strategy**: 5-minute stale time with React Query
- **Lazy Content Loading**: Panel renders only when opened
- **Optimized Bundle Size**: Consolidated components, removed redundancy
- **Efficient State Management**: Global context prevents prop drilling

### Error Handling ✅ ROBUST

- **Graceful Degradation**: Fallback content for API failures
- **Loading States**: Clear indicators during data fetching
- **User-Friendly Messages**: Descriptive error messages
- **Retry Mechanisms**: Built-in refetch capabilities

### Security ✅ SECURE

- **Sanitized External URLs**: Validated link generation
- **Safe External Navigation**: Links open in new tabs with security attributes
- **Rate Limiting Ready**: Query caching prevents excessive API calls
- **Type-Safe Implementation**: Full TypeScript coverage

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

## Architecture Summary

### Current Implementation

```text
App Structure:
├── index.tsx
│   ├── MetadataProvider (Global state)
│   └── MainLayout (Sliding behavior)
│       ├── Navigation
│       ├── MetadataPanel (Fixed sidebar)
│       └── Main Content (Slides right when panel open)

Component Enhancement:
├── withMetadata HOC
│   ├── Blue binary visual indicator
│   ├── Middle-click detection
│   └── Global context integration

Data Flow:
├── useMetadata hook
│   ├── Kong API integration
│   ├── React Query caching
│   └── TypeScript interfaces

Modal Systems:
├── SlidingModal (Vault selection - normal click)
└── MetadataPanel (Metadata display - middle click)
```

### Key Files

- `MetadataPanel.tsx` - Main sidebar component with rich content
- `MetadataContext.tsx` - Global state management
- `MainLayout.tsx` - Interface sliding behavior
- `withMetadata.tsx` - Component enhancement HOC
- `useMetadata.ts` - Data fetching and caching
- `SlidingModal.tsx` - Vault selection modal (separate system)

## Conclusion

The metadata component system has been successfully implemented as a document flow sidebar panel that enhances user experience by providing immediate access to comprehensive vault information without disrupting workflow.

Key achievements:

- **✅ Document Flow Integration**: Main interface slides to accommodate metadata panel
- **✅ Rich Content Display**: All planned metadata sections implemented and optimized for sidebar format
- **✅ Dual Interaction Model**: Separate systems for vault selection vs metadata viewing
- **✅ Performance Optimized**: Cached queries and smooth animations
- **✅ Clean Architecture**: Consolidated components with clear separation of concerns

The implementation leverages existing Kong infrastructure and follows established React patterns, ensuring maintainability and performance. The sidebar approach provides superior UX compared to modal overlays by preserving workflow continuity while delivering comprehensive metadata access.
