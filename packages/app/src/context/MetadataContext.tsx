import React, { createContext, useContext, useState, useCallback } from 'react'
import type { EntityType } from '@/hooks/useMetadata'

export interface MetadataConfig {
  entityType: EntityType
  entityId: string
  chainId: number
}

interface MetadataContextType {
  isOpen: boolean
  config: MetadataConfig | null
  openMetadata: (config: MetadataConfig) => void
  closeMetadata: () => void
}

const MetadataContext = createContext<MetadataContextType | null>(null)

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<MetadataConfig | null>(null)

  const openMetadata = useCallback((newConfig: MetadataConfig) => {
    setConfig(newConfig)
    setIsOpen(true)
  }, [])

  const closeMetadata = useCallback(() => {
    setIsOpen(false)
    // Keep config for a moment to allow animations to complete
    setTimeout(() => setConfig(null), 300)
  }, [])

  return (
    <MetadataContext.Provider
      value={{
        isOpen,
        config,
        openMetadata,
        closeMetadata,
      }}
    >
      {children}
    </MetadataContext.Provider>
  )
}

export const useMetadataContext = () => {
  const context = useContext(MetadataContext)
  if (!context) {
    throw new Error('useMetadataContext must be used within a MetadataProvider')
  }
  return context
}
