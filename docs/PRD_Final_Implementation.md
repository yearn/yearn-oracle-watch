# Product Requirements Document: Final Implementation Push

**Date:** August 1, 2025  
**Status:** Ready for Implementation  
**Priority:** High

## Overview

This PRD outlines the critical functionality needed to make the Yearn Oracle Watch application fully functional. We have identified 4 key areas that need implementation to complete the core user journey.

**UPDATED:** This document has been revised based on architectural research to follow the existing SDK DataSource pattern and reflect actual API data structures.

## Current State Assessment

### ✅ **Already Implemented**

- Vault selection UI and modal system  
- Basic APR display structure
- Contract hooks auto-generation via wagmi (`@yearn-oracle-watch/contracts`)
- VaultSelectButton integration
- Search input UI components (non-functional)
- **SDK Architecture:** Kong and yDaemon data sources with CoreDataSource pattern

### ❌ **Missing Critical Functionality**

1. **Price Integration from yDaemon**
2. **APR Oracle Contract Integration**
3. **Amount denomination switching with price conversion**
4. **Vault search functionality**

---

## Architecture Requirements ⚠️ **CRITICAL**

### **Correct Implementation Pattern**

Following the existing codebase architecture:

```
SDK Layer (packages/sdk/src/):
├── datasources/
│   ├── KongDataSource.ts (existing)
│   ├── YDaemonDataSource.ts (needs getPrices method)
│   └── CoreDataSource.ts (aggregates all data sources)
├── types/ (shared interfaces)
└── Sdk.ts (main SDK class)

App Layer (packages/app/src/hooks/):
├── useSdk.ts (existing SDK context)
├── useTokenPrices.ts (should use sdk.core.yDaemon.getPrices)
├── useAprOracle.ts (should use @contracts/wagmi hooks)
└── useKongData.ts (should use sdk.core.kong methods)
```

**❌ WRONG:** Direct API calls in app layer hooks  
**✅ CORRECT:** SDK DataSource → App layer hooks pattern

---

## Requirement 1: Price Integration from yDaemon

### **User Story**

As a user, I want to see real-time prices for vault assets so I can make informed decisions about deposits and understand USD equivalents.

### **Technical Requirements**

#### **API Integration**

- **Endpoint:** `https://ydaemon.yearn.fi/prices/all`
- **Data Format:** `{ chainId: { tokenAddress: priceString } }` - prices as strings in smallest unit
- **Cache Strategy:** 30-second stale time for price data
- **Error Handling:** Fallback to cached prices, graceful degradation

example response from prices api:

```json
{
  "1": {
    "0x0000000000000000000000000000000000000000": "3649610000",
    "0x0000000000085d4780B73119b644AE5ecd22b376": "997815",
    "0x0000000016E6Cb3038203c1129c8B4aEE7af7a11": "3673244767"
  },
  "100": {
    "0x004626A008B1aCdC4c74ab51644093b155e59A23": "1240000",
    "0x029EE678c91b52eD567d106a6f28e6B483165987": "123390211",
    "0x02E7e2dd3BA409148A49D5cc9a9034D2f884F245": "2284997773",
    "0x0AA1e96D2a46Ec6beB2923dE1E61Addf5F5f1dce": "170072"
  },
  "137": {
    "0x0000000000000000000000000000000000001010": "203130",
    "0x002bA5f8Ad6dc69BB056cED3e6b5165aE1E1691b": "560044925869114624",
    "0x00c305003F24504161F30BE355556B2Dc5C586D2": "2137284",
    "0x00e5646f60AC6Fb446f621d146B6E1886f002905": "4130000",
    "0x0128E1D15ED9f0c8572967825Ef46309BDA39836": "999717",
    "0x013F9c3fAc3e2759d7e90AcA4F9540F75194A0d7": "26438"
  },
  "8453": {
    "0x0017A89a230cb1304EfCF7Cab8855DB29243474B": "999723",
    "0x0022228a2cc5E7eF0274A7Baa600d44da5aB5776": "1130725",
    "0x00F30115B5E828AB387b8190f8532EA7cEAF3fDC": "5294133030302",
    "0x02116C8ea08Ef0459f5B5f276A0eA9Cd73a603A9": "3321833953",
    "0x02D55aF4813a3a6826Ef185935E4FC1dEfA45FB0": "29287",
    "0x03c5AfF0cd5e40889d689fD9D9Caff286b1BD7Fb": "117476195052",
    "0x0487694D04B2473B1239cbBCF4Dd1B8c14f40E2b": "999701",
    "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c": "115530000000",
    "0x0922Be8F5f88c8bc1B6EC60634B402cF8b0a112E": "11"
  }
}
```

#### **Implementation Details**

**SDK Layer: Update `YDaemonDataSource.ts`**

```typescript
// Add these types to YDaemonDataSource.ts
export type TPrice = string // Prices come as string numbers (likely in wei)
export type TPrices = Record<string, TPrice> // { tokenAddress: priceString }
export type TPricesChain = Record<string, TPrices> // { chainId: { tokenAddress: priceString } }

export class YDaemonDataSource extends BaseDataSource {
  /**
   * Get all token prices from yDaemon
   * Returns data structured as: { chainId: { tokenAddress: priceString } }
   * Note: Prices are returned as strings in smallest unit (likely 6-8 decimals)
   */
  public async getPrices(): Promise<TPricesChain> {
    const queryKey = ['yDaemon', 'prices']

    const result = await this.queryClient.fetchQuery({
      queryKey,
      queryFn: async (): Promise<TPricesChain> => {
        const response = await fetch(`${this.getEndpoint()}/prices/all`)

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      },
      ...this.context.config.defaultCacheOptions,
    })

    return result
  }
}
```

**App Layer Hook: Create `useTokenPrices.ts`**

```typescript
import { useSdk } from './useSdk'
import { useQuery } from '@tanstack/react-query'
import type { TPricesChain } from '@yearn-oracle-watch/sdk'

export const useTokenPrices = () => {
  const sdk = useSdk()
  return useQuery({
    queryKey: ['tokenPrices'],
    queryFn: () => sdk.core.yDaemon.getPrices(),
    staleTime: 30_000, // 30 seconds
  })
}

export const findTokenPrice = (
  prices: TPricesChain, 
  address: string, 
  chainId: number
): number | null => {
  const chainPrices = prices[chainId.toString()]
  if (!chainPrices?.[address.toLowerCase()]) return null
  
  const priceString = chainPrices[address.toLowerCase()]
  // Convert from smallest unit (typically 6 decimals for USD prices)
  return parseFloat(priceString) / 1_000_000
}
```

### **Integration Points**

- `VaultQueryCard.tsx`: Display vault asset prices using `findTokenPrice`
- `InputDepositAmount.tsx`: Show USD equivalents for denomination switching
- Error handling for API failures

### **Acceptance Criteria**

- ✅ Prices load via SDK DataSource pattern within 2 seconds
- ✅ Proper decimal conversion from string prices (divide by 1,000,000)
- ✅ USD equivalents update when vault selection changes
- ✅ Error states handled gracefully with fallback messaging
- ✅ Price data cached appropriately via TanStack Query

---

## Requirement 2: APR Oracle Contract Integration

### **User Story**

As a user, I want to see current and projected APY values for vaults so I can understand the impact of my deposit size on returns.

### **Technical Requirements**

#### **Contract Function Usage**

- **Current APY:** `getWeightedAverageApr(_vault, 0)`
- **Projected APY:** `getWeightedAverageApr(_vault, _delta)`
- **Delta Calculation:** User input converted to vault asset decimals

#### **Hook Implementation**

**APR Oracle Hook: Create `useAprOracle.ts`**

```typescript
import { Address } from 'viem'
import { useAprOracleGetWeightedAverageApr } from '@contracts/wagmi'

export const useAprOracle = (vaultAddress?: string, delta?: bigint) => {
  const currentApr = useAprOracleGetWeightedAverageApr({
    args: vaultAddress ? [vaultAddress as Address, 0n] : undefined,
    query: { enabled: !!vaultAddress }
  })
  
  const projectedApr = useAprOracleGetWeightedAverageApr({
    args: vaultAddress && delta ? [vaultAddress as Address, delta] : undefined,
    query: { enabled: !!vaultAddress && delta !== undefined }
  })
  
  const currentAprFormatted = currentApr.data ? formatApr(currentApr.data) : null
  const projectedAprFormatted = projectedApr.data ? formatApr(projectedApr.data) : null
  
  return {
    currentApr: currentAprFormatted,
    projectedApr: projectedAprFormatted,
    percentChange: calculatePercentChange(currentAprFormatted, projectedAprFormatted),
    isLoading: currentApr.isLoading || projectedApr.isLoading,
    error: currentApr.error || projectedApr.error
  }
}
```

#### **Integration Flow**

1. **Vault Selection:** Call `getWeightedAverageApr(vault, 0)` → Update "Current APY"
2. **Amount Input:** Convert input to vault decimals → Calculate delta
3. **Query Button:** Call `getWeightedAverageApr(vault, delta)` → Update "Projected APY"
4. **Percent Change:** Calculate delta between current and projected

### **Implementation Details**

**Delta Calculation Logic:**

```typescript
import { parseUnits } from 'viem'

const calculateDelta = (
  userInput: string, 
  assetDecimals: number,
  isDenominationUSD: boolean,
  assetPrice?: number
): bigint => {
  let amountInAsset = userInput
  
  if (isDenominationUSD && assetPrice) {
    amountInAsset = (parseFloat(userInput) / assetPrice).toString()
  }
  
  return parseUnits(amountInAsset, assetDecimals)
}
```

### **Integration Points**

- `VaultQueryCard.tsx`: Main APR display and query logic using `useAprOracle`
- `InputDepositAmount.tsx`: Amount input for delta calculation
- Error handling for contract failures

### **Acceptance Criteria**

- ✅ Current APY populates immediately when vault selected
- ✅ Projected APY calculates when query button pressed
- ✅ Percent change displays correctly (positive/negative formatting)
- ✅ Contract errors handled with user-friendly messages
- ✅ Loading states show during contract calls

---

## Requirement 3: Kong Data Integration

### **User Story**

As a user, I want to access vault data and metadata through a consistent API so that I can browse and select vaults effectively.

### **Technical Requirements**

#### **SDK Integration**

- **Vault Lists:** Via `sdk.core.kong.getVaults()`  
- **Vault Metadata:** Via `sdk.core.kong.getVaultMetadata()`
- **Cache Strategy:** TanStack Query with SDK DataSource pattern

#### **Hook Implementation**

**Kong Data Hook: Create `useKongData.ts`**

```typescript
import { useSdk } from './useSdk'
import { useQuery } from '@tanstack/react-query'

export const useKongData = () => {
  const sdk = useSdk()
  return useQuery({
    queryKey: ['kongVaults'],
    queryFn: () => sdk.core.kong.getVaults(),
    staleTime: 60_000, // 1 minute
  })
}

export const useVaultMetadata = (vaultAddress?: string) => {
  const sdk = useSdk()
  return useQuery({
    queryKey: ['vaultMetadata', vaultAddress],
    queryFn: () => vaultAddress ? sdk.core.kong.getVaultMetadata(vaultAddress) : null,
    enabled: !!vaultAddress,
    staleTime: 300_000, // 5 minutes
  })
}
```

### **Integration Points**

- `VaultQueryCard.tsx`: Uses vault metadata for display
- `Modal.tsx` & `SlidingModal.tsx`: Uses vault lists for selection
- SDK pattern maintains proper data layer separation

### **Acceptance Criteria**

- ✅ Vault data loads via SDK DataSource pattern
- ✅ Metadata fetching separated from APR Oracle logic  
- ✅ Proper caching strategy for different data types
- ✅ Error handling for Kong GraphQL failures

---

## Requirement 4: Amount Denomination Switching

### **User Story**

As a user, I want to toggle between USD and vault asset denomination so I can input amounts in my preferred currency.

### **Technical Requirements**

#### **Conversion Logic**

- **USD → Asset:** `assetAmount = usdAmount / assetPrice`
- **Asset → USD:** `usdAmount = assetAmount * assetPrice`
- **Precision:** Maintain 6 decimal places for calculations
- **Display:** Show 2-4 decimal places based on value magnitude

#### **State Management**

```typescript
interface DenominationState {
  selectedAsset: 'USD' | string  // vault asset symbol
  inputValue: string
  convertedValue: string
  assetPrice?: number
}
```

#### **Implementation Details**

**Enhanced InputDepositAmount Component:**

```typescript
const handleDenominationSwitch = (newDenomination: string) => {
  if (!assetPrice) return
  
  const currentValue = parseFloat(inputValue)
  if (isNaN(currentValue)) return
  
  let convertedValue: number
  
  if (selectedAsset === 'USD' && newDenomination !== 'USD') {
    // USD → Asset
    convertedValue = currentValue / assetPrice
  } else if (selectedAsset !== 'USD' && newDenomination === 'USD') {
    // Asset → USD  
    convertedValue = currentValue * assetPrice
  } else {
    return // No conversion needed
  }
  
  setSelectedAsset(newDenomination)
  setInputValue(convertedValue.toFixed(6))
}
```

### **Integration Points**

- `InputDepositAmount.tsx`: Core conversion logic
- `VaultQueryCard.tsx`: Pass price data to input component
- `useTokenPrices.ts`: Price lookup for conversion

### **Acceptance Criteria**

- ✅ Denomination switch preserves equivalent value
- ✅ Conversions accurate to 6 decimal places
- ✅ UI updates immediately on denomination change
- ✅ Handles edge cases (no price data, zero values)
- ✅ Visual indication of current denomination

---

## Requirement 4: Vault Search Functionality

### **User Story**

As a user, I want to search through available vaults by name, chain, or address so I can quickly find specific vaults.

### **Technical Requirements**

#### **Search Implementation**

- **Search Fields:** Vault name, chain name, vault address
- **Search Type:** Real-time fuzzy search (debounced)
- **Performance:** Sub-100ms response time
- **Case Sensitivity:** Case-insensitive matching

#### **Search Logic**

```typescript
const searchVaults = (vaults: VaultWithLogos[], searchTerm: string) => {
  if (!searchTerm.trim()) return vaults
  
  const term = searchTerm.toLowerCase()
  
  return vaults.filter(vault => 
    vault.name?.toLowerCase().includes(term) ||
    CHAIN_ID_TO_NAME[vault.chainId]?.toLowerCase().includes(term) ||
    vault.address?.toLowerCase().includes(term)
  )
}
```

#### **State Management**

```typescript
const [searchTerm, setSearchTerm] = useState('')
const [filteredVaults, setFilteredVaults] = useState<VaultWithLogos[]>([])

const debouncedSearch = useMemo(
  () => debounce((term: string) => {
    const filtered = searchVaults(data || [], term)
    setFilteredVaults(filtered)
  }, 150),
  [data]
)
```

### **Implementation Details**

**Search Input Enhancement:**

- Replace placeholder search inputs in both `Modal` and `SlidingModal`
- Add clear button when search term exists
- Highlight matching text in results
- Empty state when no results found

**ModalData Component Updates:**

```typescript
const ModalData: React.FC<ModalDataProps> = ({ 
  data, 
  searchTerm, 
  onSearchChange,
  // ... other props 
}) => {
  const filteredVaults = useMemo(() => 
    searchVaults(data || [], searchTerm), 
    [data, searchTerm]
  )
  
  // Render filtered results
}
```

### **Integration Points**

- `VaultQueryCard.tsx`: Search state management
- `Modal.tsx` & `SlidingModal.tsx`: Search input implementation
- `ModalData.tsx`: Filtered results display

### **Acceptance Criteria**

- ✅ Search responds within 150ms of keystroke
- ✅ Searches across name, chain, and address fields
- ✅ Case-insensitive matching works correctly  
- ✅ Clear button resets search and shows all vaults
- ✅ Empty state shows when no matches found
- ✅ Search persists across modal open/close cycles

---

## Implementation Timeline

### **Phase 1: Foundation (Day 1)**

1. **Price Integration** ✅ **COMPLETED**
   - ✅ Updated `YDaemonDataSource.ts` with `getPrices()` method
   - ✅ Created `useTokenPrices` hook using SDK pattern
   - ✅ Implemented `findTokenPrice` utility with decimal handling
   - ✅ Added proper TypeScript types and exports
   - ✅ All builds pass successfully

2. **APR Oracle Hooks** 🔄 **IN PROGRESS**
   - Create `useAprOracle` hook with wagmi contract calls
   - Implement delta calculation logic
   - Wire up to existing APR display in VaultQueryCard

### **Phase 2: Data Layer (Day 2)**

3. **Kong Data Integration**
   - Create `useKongData` hook for vault lists
   - Create `useVaultMetadata` hook for individual vault details
   - Separate concerns from APR Oracle logic

4. **Architecture Validation**
   - Ensure all hooks follow SDK DataSource pattern
   - Remove any direct API calls from app layer
   - Implement proper error handling and caching

### **Phase 3: Core Features (Day 3)**

5. **Denomination Switching**
   - Enhance InputDepositAmount with conversion logic
   - Implement state management for denomination
   - Add price-based conversion using `findTokenPrice`

6. **Search Functionality**
   - Implement debounced search logic
   - Update modal components with functional search
   - Add filtering and empty states

### **Phase 4: Polish & Testing (Day 4)**

7. **Integration Testing**
   - End-to-end user flow testing
   - Error handling validation
   - Performance optimization

8. **UI/UX Refinements**
   - Loading states and error messages
   - Animation improvements
   - Accessibility enhancements

---

## Success Metrics

### **Functional Requirements**

- ✅ All 4 core features implemented and working
- ✅ No critical bugs in main user flow
- ✅ Proper error handling for all external dependencies

### **Performance Requirements**

- ✅ Price data loads within 2 seconds
- ✅ Search responds within 150ms
- ✅ APR calculations complete within 5 seconds
- ✅ Denomination switching responds immediately

### **User Experience Requirements**

- ✅ Intuitive workflow from vault selection to APR query
- ✅ Clear visual feedback for all user actions
- ✅ Graceful degradation when external services fail

---

## Risk Assessment

### **High Risk**

- **yDaemon API Reliability:** External dependency for price data
- **Contract Call Failures:** Network issues affecting APR oracle
- **Price Data Accuracy:** Stale or incorrect price information

### **Medium Risk**  

- **Search Performance:** Large vault lists impacting search speed
- **Decimal Precision:** Rounding errors in price conversions
- **State Synchronization:** UI state getting out of sync

### **Mitigation Strategies**

- Implement robust error handling and fallbacks
- Add proper loading states and user feedback
- Use debouncing and memoization for performance
- Comprehensive testing of edge cases

---

## Technical Dependencies

### **External APIs**

- `https://ydaemon.yearn.fi/prices/all` (Price data)
- APR Oracle contract on Ethereum mainnet
- Kong GraphQL API (vault data)

### **Internal Dependencies**

- `@tanstack/react-query` for data fetching
- `wagmi` for contract interactions  
- `viem` for address and unit utilities
- Existing vault data from Kong

### **New Dependencies Required**

- `lodash.debounce` for search debouncing (if not already included)

---

This PRD provides a comprehensive roadmap for completing the Yearn Oracle Watch application. Each requirement is clearly defined with technical specifications, implementation details, and acceptance criteria to ensure successful delivery.
