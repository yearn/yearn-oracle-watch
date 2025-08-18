import React, { useState, useCallback, useMemo } from 'react'

interface VirtualScrollListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode
  bufferSize?: number
  className?: string
}

/**
 * Virtual scrolling component that only renders visible items plus a buffer
 * Optimized for performance with large lists
 */
export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  bufferSize = 10,
  className = '',
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    )
    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, bufferSize, items.length])

  // Handle scroll with performance optimization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setScrollTop(target.scrollTop)
  }, [])

  // Calculate total height for proper scrollbar
  const totalHeight = items.length * itemHeight

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange])

  return (
    <div
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height container for proper scrollbar */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index
            const isVisible =
              actualIndex * itemHeight < scrollTop + containerHeight &&
              (actualIndex + 1) * itemHeight > scrollTop

            return (
              <div
                key={actualIndex}
                style={{ height: itemHeight }}
                data-index={actualIndex}
              >
                {renderItem(item, actualIndex, isVisible)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
