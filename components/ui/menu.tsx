import { routes } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { auth } from '@/utils/auth'
import { cookies } from 'next/headers'
import Link from 'next/link'

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

const LoggedOutMenu = ({ className }: { className?: string }) => {
  return (
    <ul
      className={cn(
        'flex flex-col p-4 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center',
        className,
      )}
    >
      {defaultPaths.map(({ path, name }) => (
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

const Menu = async ({ className }: { className?: string }) => {
  if (!cookies().getAll().length) <LoggedOutMenu />

  const { user } = await auth()

  if (!user) return <LoggedOutMenu />

  return (
    <ul
      className={cn(
        'flex flex-col p-4 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center',
        className,
      )}
    >
      <>
        {authorizedPaths.map(({ path, name }) => (
          <Link
            passHref
            href={path}
            key={path}
            className="block py-2 pr-4 pl-3 rounded transition-colors duration-150 md:border-0 md:p-0 text-muted-foreground hover:text-foreground hover:bg-muted md:hover:bg-background"
          >
            <li>{name}</li>
          </Link>
        ))}
      </>
    </ul>
  )
}

export { Menu, LoggedOutMenu }
