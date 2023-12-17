import { Toaster } from 'react-hot-toast'
import Footer from '@/components/ui/footer'
import Navbar from '@/components/ui/navbar'
import { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import Providers from '@/app/providers'
import './globals.css'

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'PasteCode',
  description: 'A simple code sharing platform',
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className={GeistMono.className}>
      <body>
        <div className="flex flex-col justify-between min-h-screen gap-6">
          <Providers>
            <Navbar />
            <main className="container mx-auto px-10 md:px-20 lg:px-40 xl:px-52 ">
              {children}
            </main>
            <Footer />
            <Toaster />
          </Providers>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
