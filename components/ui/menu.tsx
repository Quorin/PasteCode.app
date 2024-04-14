'use client'

import { routes } from '@/constants/routes'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/utils/useAuth'

const authorizedPaths = [
  { path: routes.HOME, name: 'Home' },
  { path: routes.PROFILE, name: 'Profile' },
  { path: routes.SETTINGS.INDEX, name: 'Settings' },
]

const defaultPaths = [
  { path: routes.HOME, name: 'Home' },
  { path: routes.AUTH.LOGIN, name: 'Login' },
  { path: routes.REGISTER, name: 'Register' },
]

const MenuList = ({
  className,
  paths,
}: {
  className?: string
  paths: Array<{ path: string; name: string }>
}) => {
  return (
    <ul
      className={cn(
        'flex flex-col p-4 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center transition-opacity duration-300',
        className,
      )}
    >
      {paths.map(({ path, name }) => (
        <Link
          passHref
          href={path}
          key={path}
          className="block py-2 pr-4 pl-3 rounded transition-colors duration-150 md:border-0 md:p-0 text-muted-foreground hover:text-foreground hover:bg-muted md:hover:bg-background"
        >
          <li>{name}</li>
        </Link>
      ))}
    </ul>
  )
}

const Menu = () => {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <MenuList
        paths={defaultPaths}
        className="opacity-0 pointer-events-none"
      />
    )
  }

  if (!auth.user) return <MenuList paths={defaultPaths} />

  return <MenuList paths={authorizedPaths} />
}

export { Menu }
