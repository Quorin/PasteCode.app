import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Footer from './Footer'
import Navbar from './Navbar'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>PasteCode.app</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col justify-between min-h-screen bg-zinc-900 gap-6">
        <Navbar />
        <main className="container mx-auto px-10 md:px-20 lg:px-40 xl:px-52 text-zinc-400">
          {children}
        </main>
        <Footer />
        <Toaster />
      </div>
    </>
  )
}

export default Layout
