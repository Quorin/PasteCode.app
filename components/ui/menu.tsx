'use client'

import { routes } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuth } from '@/utils/useAuth'
import Link from 'next/link'

const authorizedPaths = (name: string) => [
  { path: routes.HOME, name: 'Home' },
  { path: routes.PROFILE, name },
  { path: routes.SETTINGS.INDEX, name: 'Settings' },
]

const defaultPaths = [
  { path: routes.HOME, name: 'Home' },
  { path: routes.AUTH.LOGIN, name: 'Login' },
  { path: routes.REGISTER, name: 'Register' },
]

const Menu = () => {
  const { user, status } = useAuth()

  return (
    <ul
      className={cn(
        'transition-opacity duration-300 ease-in hover:opacity-100 flex flex-col p-4 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center',
        status === 'loading' ? 'opacity-0' : 'opacity-100',
      )}
    >
      <>
        {(user ? authorizedPaths(user.name) : defaultPaths).map(
          ({ path, name }) => (
            <Link
              passHref
              href={path}
              key={path}
              className="block py-2 pr-4 pl-3 rounded md:border-0 md:p-0 text-muted-foreground hover:text-foreground hover:bg-muted md:hover:bg-background"
            >
              <li>{name}</li>
            </Link>
          ),
        )}
      </>
    </ul>
  )
}

export default Menu
