import Footer from '@/components/ui/footer'
import { Metadata, Viewport } from 'next'
import { GeistMono } from 'geist/font/mono'
import Providers from '@/app/providers'
import './globals.css'
import Navbar from '@/components/ui/navbar'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'PasteCode',
  description: 'A simple code sharing platform',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: 'hsl(20 14.3% 4.1%)',
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className={GeistMono.className}>
      <body className="scrollbar-w-2 scrollbar scrollbar-track-background scrollbar-thumb-secondary-foreground overflow-y-scroll scrollbar-thumb-rounded-md">
        <div className="flex flex-col justify-between min-h-screen gap-6">
          <Providers>
            <Navbar />
            <main className="container mx-auto px-10 md:px-20 lg:px-40 xl:px-52 ">
              {children}
            </main>
            <Footer />
          </Providers>
        </div>

        <Toaster richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export default RootLayout
