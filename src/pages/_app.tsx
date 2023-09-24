// src/pages/_app.tsx
import type { AppType } from 'next/dist/shared/lib/utils'
import Head from 'next/head'
import Layout from '../components/Layout'
import '../styles/globals.css'
import { AuthProvider } from '../utils/useAuth'
import { api } from '../utils/trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
const queryClient = new QueryClient()

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <>
      <Head>
        <title>PasteCode</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </QueryClientProvider>
      <Analytics />
    </>
  )
}

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''
  }

  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
    return `https://${process.env.APP_URL}`
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export default api.withTRPC(MyApp)
