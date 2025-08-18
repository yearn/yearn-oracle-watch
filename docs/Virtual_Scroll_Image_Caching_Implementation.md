# Virtual Scroll with Image Caching Implementation Plan

## Overview

Improve image fetching performance in the vault selection modal by implementing virtual scrolling and intelligent image caching to eliminate the current loading delays and visual distractions.

## ✅ IMPLEMENTATION COMPLETED

This document now reflects the **completed implementation** with all components working together in production.

## Current State Analysis

1. **Images are fetched directly** in the `ModalData` component using `getSvgAsset()`
2. **TanStack Query is already available** and well-integrated
3. **There's already a `useVaultsWithLogos` hook** that preloads all images, but it's commented out in the main component
4. **The current modal renders all vault items at once**, causing all images to load simultaneously
5. **Each vault item is 70px tall** with images that are 32x32px

## ✅ Implemented Solution

### 1. ✅ Virtual Scroll Component (`VirtualScrollList.tsx`)

**Created**: `components/ui/VirtualScrollList.tsx`

- Lightweight virtual scrolling component specifically for the vault list
- Only renders visible items plus a buffer (5 items above/below viewport)
- Each item is 70px tall
- Optimized scroll handling with `useCallback` and `useMemo`

```typescript
interface VirtualScrollListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode
  bufferSize?: number
  className?: string
}
```

### 2. ✅ Image Caching with TanStack Query (`useTokenImage.ts`)

**Created**: `hooks/useTokenImage.ts`

- Uses TanStack Query to cache individual images with 5-minute stale time
- Handles CORS issues with `crossOrigin: 'anonymous'`
- Retry logic: 1 retry with 500ms delay
- Integrates seamlessly with the preloading system

```typescript
interface UseTokenImageResult {
  src: string | undefined
  isLoading: boolean
  error: boolean
}
```

### 3. ✅ Background Image Preloading (`usePreloadTokenImages.ts`)

**Created**: `hooks/usePreloadTokenImages.ts`

- **Automatic preloading**: Starts as soon as vault data is available
- **Batched requests**: 15 images per batch with 150ms delays
- **Server-friendly**: Prevents overwhelming the CDN
- **Cache integration**: Uses same TanStack Query cache as `useTokenImage`
- **Deduplication**: Prevents loading the same image multiple times

**Key Features:**

- Starts 100ms after vault data loads (non-blocking)
- Console logging for debugging preload progress
- Graceful error handling with debug-level logging
- Memory efficient with `useRef` for tracking loaded images

### 4. ✅ Optimized Vault List Item (`VaultListItem.tsx`)

**Created**: `components/shared/VaultListItem.tsx`

- **Lazy loading**: Only loads images when items are visible
- **Progressive loading states**:
  - **Not visible**: Simple placeholder circle
  - **Loading**: Subtle pulsing animation
  - **Error**: Question mark icon fallback
  - **Loaded**: Actual token image with rounded corners
- **Search highlighting**: Maintains existing search functionality
- **Smooth transitions**: 150ms hover effects

### 5. ✅ Updated Modal with Virtual Scroll

**Modified**: `components/pages/home/VaultQueryCard.tsx`

- Integrated `VirtualScrollList` into existing `ModalData` component
- Added `usePreloadTokenImages(data || [])` hook
- Maintains all existing functionality (search, selection, error states)
- Backwards compatible - same props interface

## ✅ Implementation Results

### How It Works in Practice

1. **Page Load**:

   ```
   User visits page → useGetVaults() fetches data → usePreloadTokenImages() starts background loading
   ```

2. **Background Preloading**:

   ```
   Batch 1 (15 images) → 150ms delay → Batch 2 (15 images) → ... → Complete
   ```

3. **Modal Opening**:

   ```
   User opens modal → VirtualScrollList renders ~4-5 visible items → Images load instantly from cache
   ```

4. **Scrolling**:

   ```
   User scrolls → New items come into view → Images either from cache (instant) or load on-demand
   ```

### Technical Architecture

```
VaultQueryCard
├── useGetVaults() → fetches vault data
├── usePreloadTokenImages(data) → background preloading
└── Modal
    └── VirtualScrollList
        └── VaultListItem (per visible item)
            └── useTokenImage() → cached image loading
```

### Cache Strategy

- **TanStack Query Keys**: `['token-image', chainId, address.toLowerCase()]`
- **Stale Time**: 5 minutes (images don't change often)
- **Garbage Collection**: 10 minutes
- **Shared Cache**: Preloading and on-demand loading use same cache
- **Deduplication**: Prevents duplicate requests for same image

### Backwards Compatibility

- ✅ Same props interface for `ModalData`
- ✅ Existing search and selection functionality preserved
- ✅ No changes needed to parent components
- ✅ Graceful degradation if preloading fails

## Files Created/Modified

### Created Files

1. `components/ui/VirtualScrollList.tsx` - Virtual scrolling component
2. `hooks/useTokenImage.ts` - Image caching hook
3. `hooks/usePreloadTokenImages.ts` - Background preloading hook
4. `components/shared/VaultListItem.tsx` - Optimized vault item component

### Modified Files

1. `components/pages/home/VaultQueryCard.tsx` - Integrated virtual scroll and preloading
