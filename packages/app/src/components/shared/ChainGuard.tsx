import { isChainSupported } from '@/utils/chainSupport'
import { FC, ReactNode } from 'react'
import { useChainId } from 'wagmi'
import { QueryErrorBoundary } from './QueryErrorBoundary'
import { UnsupportedChain } from './UnsupportedChain'

interface ChainGuardProps {
  children: ReactNode
}

export const ChainGuard: FC<ChainGuardProps> = ({ children }) => {
  const chainId = useChainId()

  if (!isChainSupported(chainId)) {
    return <UnsupportedChain />
  }

  return <QueryErrorBoundary>{children}</QueryErrorBoundary>
}
