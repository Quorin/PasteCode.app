'use client'

import { useRef, useState } from 'react'
import { routes } from '../../constants/routes'
import useAuth from '../../utils/useAuth'
import Link from 'next/link'

const unauthorizedPaths = [
  { path: routes.HOME, name: 'Home' },
  { path: routes.AUTH.LOGIN, name: 'Login' },
  { path: routes.REGISTER, name: 'Register' },
]

const authorizedPaths = (name: string) => [
  { path: routes.HOME, name: 'Home' },
  { path: routes.PROFILE, name },
  { path: routes.SETTINGS.INDEX, name: 'Settings' },
]

const Navbar = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, isLoggedIn, isLoading } = useAuth()

  const handleCollapse = () => {
    setMenuCollapsed(!menuCollapsed)
    menuRef.current?.classList['toggle']('hidden')
  }

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
        <button
          onClick={() => handleCollapse()}
          data-collapse-toggle="navbar-default"
          type="button"
          className="transition-all inline-flex items-center p-2 ml-3 text-sm rounded-lg md:hidden focus:outline-none text-muted-foreground hover:bg-muted"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div
          ref={menuRef}
          className="hidden w-full md:block md:w-auto"
          id="navbar-default"
        >
          {/* <ul className="flex flex-col p-4 mt-4 rounded-lg border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center"> */}
          <ul className="flex flex-col p-4 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center">
            {isLoading && (
              <div className="cursor-none select-none py-2.5"></div>
            )}
            {!isLoading && (
              <>
                {(isLoggedIn
                  ? authorizedPaths(user!.name)
                  : unauthorizedPaths
                ).map(({ path, name }) => (
                  <li
                    key={path}
                    className="block py-2 pr-4 pl-3 rounded md:border-0 md:p-0 text-muted-foreground hover:text-foreground hover:bg-muted md:hover:bg-background"
                  >
                    <Link href={path}>{name}</Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
