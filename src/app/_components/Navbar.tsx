'use client'

import { cva } from 'class-variance-authority'
import { usePathname } from 'next/navigation'
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

const link = cva(
  [
    'block py-2 pr-4 pl-3 rounded md:border-0 md:p-0 text-zinc-400 md:hover:text-white hover:bg-zinc-700 hover:text-white md:hover:bg-transparent',
  ],
  {
    variants: {
      active: {
        true: ['text-blue-500 hover:text-blue-400'],
      },
    },
  },
)

const Navbar = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, isLoggedIn, isLoading } = useAuth()
  const pathname = usePathname()

  const handleCollapse = () => {
    setMenuCollapsed(!menuCollapsed)
    menuRef.current?.classList['toggle']('hidden')
  }

  return (
    <div className="px-5 py-5 bg-zinc-900 mb-10 border-b-[1px] border-zinc-700">
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
          className="inline-flex items-center p-2 ml-3 text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 text-zinc-400 hover:bg-zinc-700 focus:ring-zinc-600"
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
          <ul className="flex flex-col p-4 mt-4 rounded-lg border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 bg-zinc-800 md:bg-zinc-900 border-zinc-700 text-center">
            {isLoading && (
              <div className="cursor-none select-none py-2.5"></div>
            )}
            {!isLoading && (
              <>
                {isLoggedIn
                  ? authorizedPaths(user!.name).map(({ path, name }) => (
                      <li
                        key={path}
                        className={link({ active: pathname === path })}
                      >
                        <Link href={path}>{name}</Link>
                      </li>
                    ))
                  : unauthorizedPaths.map(({ path, name }) => (
                      <li
                        key={path}
                        className={link({ active: pathname === path })}
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
