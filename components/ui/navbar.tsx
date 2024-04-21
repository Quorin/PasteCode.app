import Link from 'next/link'
import CollapsableButton from '@/components/ui/collapsable-button'
import { Menu } from '@/components/ui/menu'

const Navbar = () => {
  return (
    <div className="py-5">
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
          <Menu />
        </div>
      </div>
    </div>
  )
}

export default Navbar
