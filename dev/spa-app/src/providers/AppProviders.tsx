import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/**
 * QueryClient configuration (matches original Next.js ClientProviders)
 *
 * - staleTime: 5 minutes - treat data as fresh
 * - gcTime: 30 minutes - keep cache (BFCache compatible)
 * - refetchOnWindowFocus/Mount/Reconnect: disabled for manual control
 * - retry: 1 attempt
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
})

/**
 * Root application providers for the TanStack Router SPA.
 *
 * Replaces the Next.js ClientProviders component.
 * - QueryClientProvider: TanStack React Query cache & data fetching
 * - ToastContainer: react-toastify notifications
 *
 * NOT included (intentionally removed from Next.js version):
 * - SessionProvider (next-auth) -> replaced by Zustand auth store
 * - NextIntlClientProvider -> i18n will be added later
 * - PollingProviderWrapper -> will be re-integrated separately
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  )
}
