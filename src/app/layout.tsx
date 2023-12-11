import { Toaster } from 'react-hot-toast'
import Footer from './_components/Footer'
import Navbar from './_components/Navbar'
import { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import Providers from './providers'

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  subsets: ['latin-ext'],
  // variable: '--font-space-grotesk',
})

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'PasteCode',
  description: 'A simple code sharing platform',
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en">
      <body>
        <div
          className={`${spaceGrotesk.className} flex flex-col justify-between min-h-screen bg-zinc-900 gap-6`}
        >
          <Providers>
            <Navbar />
            <main className="container mx-auto px-10 md:px-20 lg:px-40 xl:px-52 text-zinc-400">
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
