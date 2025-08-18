import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { type ReactNode, createContext, useContext, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { Sdk } from '@yearn-oracle-watch/sdk'

interface TestWrapperProps {
  children: ReactNode
}

// Create a test-specific SDK context
const TestSdkContext = createContext<Sdk>(null as never)

const TestSdkProvider = ({
  children,
  queryClient,
}: TestWrapperProps & { queryClient: QueryClient }) => {
  const sdk = useMemo(() => {
    const sdkInstance = new Sdk(queryClient, config)
    // Initialize SDK synchronously for tests
    sdkInstance.initialize().catch(console.error)
    return sdkInstance
  }, [queryClient])

  return (
    <TestSdkContext.Provider value={sdk}>{children}</TestSdkContext.Provider>
  )
}

export const useTestSdk = () => useContext(TestSdkContext)

export const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const TestWrapper = ({ children }: TestWrapperProps) => (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TestSdkProvider queryClient={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </TestSdkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )

  return {
    TestWrapper,
    queryClient,
  }
}

export const createQueryTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })

  const QueryTestWrapper = ({ children }: TestWrapperProps) => (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TestSdkProvider queryClient={queryClient}>{children}</TestSdkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )

  return {
    QueryTestWrapper,
    queryClient,
  }
}
