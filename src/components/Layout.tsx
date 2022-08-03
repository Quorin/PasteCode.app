import Head from "next/head";
import Footer from "./Footer";
import Navbar from "./Navbar";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>PasteCode.app</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col justify-between min-h-screen bg-zinc-900">
        <Navbar />
        <main className="container mx-auto px-10 text-zinc-400">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
