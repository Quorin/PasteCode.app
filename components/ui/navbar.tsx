import Link from 'next/link'
import CollapsableButton from '@/components/ui/collapsable-button'
import { Menu, LoggedOutMenu } from '@/components/ui/menu'
import { Suspense } from 'react'

const Navbar = () => {
  return (
    <div className="pr-5 py-5">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <Link href="/">
          <div className="text-3xl whitespace-nowrap text-white cursor-pointer">
            <span className="font-semibold bg-white rounded-lg p-1 m-1 text-black">
              Paste
            </span>
            <span className="font-thin underline underline-offset-8">Code</span>
          </div>
        </Link>
        <CollapsableButton id="collapsable-navbar-btn" />
        <div
          className="hidden w-full md:block md:w-auto"
          id="collapsable-navbar-btn"
        >
          <Suspense
            fallback={
              <LoggedOutMenu className="opacity-0 pointer-events-none" />
            }
          >
            <Menu className="animate-fade" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Navbar
