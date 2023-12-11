'use client'

import { ReactNode } from 'react'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'

// const queryClient = new QueryClient()

function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {/* <QueryClientProvider client={queryClient}> */}
      {children}
      {/* </QueryClientProvider> */}
      <Analytics />
    </>
  )
}

export default Providers
