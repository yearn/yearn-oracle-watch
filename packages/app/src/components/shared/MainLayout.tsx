import React from 'react'
import { useMetadataContext } from '@/context/MetadataContext'
import { MetadataPanel } from '@/components/shared/MetadataPanel'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen } = useMetadataContext()

  return (
    <div className="relative overflow-hidden">
      {/* Metadata Panel */}
      <MetadataPanel />

      {/* Main Content */}
      <div
        className={`
          transition-all duration-300 ease-out
          ${isOpen ? 'ml-120' : 'ml-0'}
        `}
      >
        {children}
      </div>
    </div>
  )
}
