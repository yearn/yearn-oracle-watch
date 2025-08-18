import { config } from '@/config/wagmi'
import { ChainChangeListener } from '@/context/ChainChangeListener'
import { SdkProvider } from '@/context/Sdk'
import { queryClient } from '@/context/queryClient'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import type { FC, PropsWithChildren } from 'react'
import { ModalProvider } from 'react-modal-hook'
import { HashRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { BreakpointsProvider } from './BreakpointsProvider'
import { ChainsProvider } from './ChainsProvider'

export const Providers: FC<PropsWithChildren> = ({ children }) => (
  <HashRouter>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <SnackbarProvider
            maxSnack={5}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={6000}
          >
            <ChainsProvider>
              <SdkProvider>
                <BreakpointsProvider>
                  <ModalProvider>{children}</ModalProvider>
                </BreakpointsProvider>
              </SdkProvider>
            </ChainsProvider>
          </SnackbarProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </HashRouter>
)

export const Updaters: FC = () => (
  <>
    <ChainChangeListener />
  </>
)
