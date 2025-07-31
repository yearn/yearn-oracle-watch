import { QueryClient } from '@tanstack/react-query'

// Create and export a single QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
