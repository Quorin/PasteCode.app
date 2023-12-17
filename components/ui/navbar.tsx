import { routes } from '@/constants/routes'
import Link from 'next/link'
import { SessionUser, auth } from '@/utils/auth'
import CollapsableButton from '@/components/ui/collapsable-button'

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

const Navbar = async () => {
  const { user } = await auth()

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
          <ul className="flex flex-col p-4 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 text-center">
            <>
              {(user ? authorizedPaths(user.name) : unauthorizedPaths).map(
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
        </div>
      </div>
    </div>
  )
}

export default Navbar
