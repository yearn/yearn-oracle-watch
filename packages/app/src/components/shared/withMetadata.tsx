import React, { useState, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useMetadataContext } from '@/context/MetadataContext'
import type { EntityType } from '@/hooks/useMetadata'

export interface MetadataConfig {
  entityType: EntityType
  entityId: string
  chainId: number
}

export interface WithMetadataProps {
  enableMetadata?: boolean
  metadataConfig?: MetadataConfig
}

export interface MetadataActions {
  showMetadata: () => void
  isMetadataEnabled: boolean
}

/**
 * Higher-order component that adds metadata functionality to existing components.
 *
 * Usage:
 * ```tsx
 * const MyComponentWithMetadata = withMetadata(MyComponent)
 *
 * <MyComponentWithMetadata
 *   enableMetadata={true}
 *   metadataConfig={{
 *     entityType: 'vault',
 *     entityId: '0x123...',
 *     chainId: 1
 *   }}
 *   // ... other props
 * />
 * ```
 */
export function withMetadata<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & WithMetadataProps> {
  const MetadataEnhancedComponent = (props: P & WithMetadataProps) => {
    const { enableMetadata = false, metadataConfig, ...wrappedProps } = props
    const { openMetadata } = useMetadataContext()

    const [isHovered, setIsHovered] = useState(false)

    const showMetadata = useCallback(() => {
      if (enableMetadata && metadataConfig) {
        openMetadata(metadataConfig)
      }
    }, [enableMetadata, metadataConfig, openMetadata])

    const handleMiddleClick = useCallback(
      (event: React.MouseEvent) => {
        // Middle mouse button click (button 1)
        if (event.button === 1) {
          event.preventDefault()
          showMetadata()
        }
      },
      [showMetadata]
    )

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        // Handle middle-click via onClick as well (more reliable)
        if (event.button === 1) {
          event.preventDefault()
          showMetadata()
        }
        // Call original onClick if it exists
        if (
          'onClick' in wrappedProps &&
          typeof wrappedProps.onClick === 'function'
        ) {
          wrappedProps.onClick(event)
        }
      },
      [showMetadata, wrappedProps]
    )

    const handleContextMenu = useCallback(
      (event: React.MouseEvent) => {
        // Don't prevent context menu - let users right-click normally
        // Call original onContextMenu if it exists
        if (
          'onContextMenu' in wrappedProps &&
          typeof wrappedProps.onContextMenu === 'function'
        ) {
          wrappedProps.onContextMenu(event)
        }
      },
      [wrappedProps]
    )

    const handleAuxClick = useCallback(
      (event: React.MouseEvent) => {
        // Handle auxiliary button clicks (middle mouse)
        if (event.button === 1) {
          event.preventDefault()
          showMetadata()
        }
      },
      [showMetadata]
    )

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        // Temporary: Add Ctrl+M as alternative trigger for testing
        if (event.ctrlKey && event.key === 'm') {
          event.preventDefault()
          showMetadata()
        }
        // Call original onKeyDown if it exists
        if (
          'onKeyDown' in wrappedProps &&
          typeof wrappedProps.onKeyDown === 'function'
        ) {
          wrappedProps.onKeyDown(event)
        }
      },
      [showMetadata, wrappedProps]
    )

    const handleFocus = useCallback(
      (event: React.FocusEvent) => {
        // Keep focus behavior for accessibility, but don't change hover state
        // Call original onFocus if it exists
        if (
          'onFocus' in wrappedProps &&
          typeof wrappedProps.onFocus === 'function'
        ) {
          wrappedProps.onFocus(event)
        }
      },
      [wrappedProps]
    )

    const handleBlur = useCallback(
      (event: React.FocusEvent) => {
        // Keep blur behavior for accessibility, but don't change hover state
        // Call original onBlur if it exists
        if (
          'onBlur' in wrappedProps &&
          typeof wrappedProps.onBlur === 'function'
        ) {
          wrappedProps.onBlur(event)
        }
      },
      [wrappedProps]
    )

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent) => {
        setIsHovered(true)
        // Call original onMouseEnter if it exists
        if (
          'onMouseEnter' in wrappedProps &&
          typeof wrappedProps.onMouseEnter === 'function'
        ) {
          wrappedProps.onMouseEnter(event)
        }
      },
      [wrappedProps]
    )

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent) => {
        setIsHovered(false)
        // Call original onMouseLeave if it exists
        if (
          'onMouseLeave' in wrappedProps &&
          typeof wrappedProps.onMouseLeave === 'function'
        ) {
          wrappedProps.onMouseLeave(event)
        }
      },
      [wrappedProps]
    )

    // Enhanced props with metadata actions and event handlers
    const enhancedProps = {
      ...wrappedProps,
      // Add metadata actions for components that want to trigger metadata programmatically
      metadataActions: {
        showMetadata,
        isMetadataEnabled: enableMetadata && !!metadataConfig,
      } as MetadataActions,
      // Add event handlers for middle-click detection
      onClick: handleClick,
      onMouseDown: (event: React.MouseEvent) => {
        handleMiddleClick(event)
        // Call original onMouseDown if it exists
        if (
          'onMouseDown' in wrappedProps &&
          typeof wrappedProps.onMouseDown === 'function'
        ) {
          wrappedProps.onMouseDown(event)
        }
      },
      onAuxClick: handleAuxClick,
      onContextMenu: handleContextMenu,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      // Add visual indicator for metadata-enabled components
      style: {
        ...('style' in wrappedProps && typeof wrappedProps.style === 'object'
          ? wrappedProps.style
          : {}),
        // Keep default cursor - tooltip is sufficient indicator
      },
      title:
        enableMetadata && metadataConfig
          ? 'Middle-click or Ctrl+M for detailed metadata'
          : 'title' in wrappedProps
            ? wrappedProps.title
            : undefined,
    } as P

    return (
      <>
        <div
          style={{
            position: 'relative',
            display: 'block', // Changed from 'inline-block' to allow full width
            overflow: 'visible',
            width: '100%', // Make sure wrapper takes full width
            height: '100%', // Make sure wrapper takes full height
          }}
        >
          {/* Sliding binary panel - only show if metadata is enabled */}
          {enableMetadata && metadataConfig && (
            <div
              style={{
                position: 'absolute',
                left: isHovered ? '-5px' : '5px', // Slide out to the left on hover, default position under button
                top: '0', // Start from the top of the button
                bottom: '0', // Extend to the bottom of the button
                width: '36px', // Make it larger
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '7px', // Slightly larger font for bigger panel
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '9px',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                userSelect: 'none',
                pointerEvents: 'none',
                borderRadius: '16px', // Match the button's rounded-[16px] class
              }}
            />
          )}

          {/* Main component - no longer moves */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%', // Ensure button takes full width
              height: '100%', // Ensure button takes full height
            }}
          >
            <WrappedComponent {...enhancedProps} />
          </div>
        </div>
      </>
    )
  }

  // Set display name for debugging
  MetadataEnhancedComponent.displayName = `withMetadata(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return MetadataEnhancedComponent
}

/**
 * Hook to use metadata actions within a component enhanced with withMetadata
 */
export function useMetadataActions(): MetadataActions | null {
  // This would be used within a component that's wrapped with withMetadata
  // For now, return null - components can access metadataActions from props
  return null
}
