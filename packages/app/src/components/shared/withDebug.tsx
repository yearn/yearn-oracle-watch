import { useEffect, useRef, ComponentType } from 'react'
import { useDebugContext } from '@/context/DebugContext'
import { DebugIndicator } from '@/components/debug/DebugIndicator'

export interface WithDebugProps {
  enableDebug?: boolean
  debugLabel?: string
  logRenders?: boolean
  logProps?: boolean
}

export function withDebug<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & WithDebugProps> {
  const DebugEnhancedComponent = (props: P & WithDebugProps) => {
    const {
      enableDebug = false,
      debugLabel = 'Component',
      logRenders = false,
      logProps = false,
      ...wrappedProps
    } = props

    const { isEnabled, addLog } = useDebugContext()
    const renderCount = useRef(0)
    const mountedRef = useRef(false)

    // Only log on mount and when debug settings change
    useEffect(() => {
      if (!isEnabled || !enableDebug) return

      if (!mountedRef.current) {
        mountedRef.current = true
        addLog({
          id: `${debugLabel}-mount-${Date.now()}`,
          timestamp: Date.now(),
          level: 'info',
          module: 'rendering',
          source: debugLabel,
          message: 'Component mounted with debug enabled',
          data: undefined,
        })
      }
    }, [isEnabled, enableDebug, debugLabel, addLog])

    // Increment render count without logging every render
    renderCount.current++

    // Simple status determination - you can make this more sophisticated
    const getDebugStatus = () => {
      // For now, just show 'success' when debug is enabled
      return 'success' as const
    }

    return (
      <div className="relative">
        {/* Debug indicator */}
        {isEnabled && enableDebug && (
          <DebugIndicator status={getDebugStatus()} />
        )}
        <WrappedComponent {...(wrappedProps as P)} />
      </div>
    )
  }

  DebugEnhancedComponent.displayName = `withDebug(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return DebugEnhancedComponent
}
