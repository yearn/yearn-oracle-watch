import React from 'react'

interface DebugIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'cached'
  className?: string
}

export const DebugIndicator: React.FC<DebugIndicatorProps> = ({
  status,
  className = '',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-yellow-500'
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'cached':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div
      className={`absolute -top-1 -left-1 w-3 h-3 rounded-full z-50 ${getStatusColor()} ${className}`}
      title={`Debug: ${status}`}
    />
  )
}
