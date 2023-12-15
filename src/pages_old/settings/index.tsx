import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageTitle from '../../components/ui/page-title'
import { routes } from '../../constants/routes'
import { api } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

const Settings = () => {
  const router = useRouter()
  const logoutMutation = api.auth.logout.useMutation()
  const { logout } = useAuth()

  const handleLogout = async () => {
    logoutMutation.mutate(undefined, {
      async onSettled() {
        logout()
        await router.push(routes.HOME)
      },
    })
  }

  return (
    <div className="flex flex-col">
      <PageTitle title="Settings" />

      <div className="flex flex-col gap-6 justify-center">
        <Link href={routes.SETTINGS.CHANGE_PASSWORD} className="flex">
          <button className="w-full md:w-1/2 bg-zinc-700 hover:bg-zinc-300 text-zinc-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Change Password
          </button>
        </Link>
        <Link href={routes.SETTINGS.CHANGE_EMAIL} className="flex">
          <button className="w-full md:w-1/2 bg-zinc-700 hover:bg-zinc-300 text-zinc-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Change Email
          </button>
        </Link>
        <Link href={routes.SETTINGS.CHANGE_NAME} className="flex">
          <button className="w-full md:w-1/2 bg-zinc-700 hover:bg-zinc-300 text-zinc-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Change Name
          </button>
        </Link>
        <button
          onClick={() => handleLogout()}
          className="w-full md:w-1/2 bg-zinc-700 hover:bg-red-300 text-red-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg"
        >
          Logout
        </button>
        <Link href={routes.SETTINGS.REMOVE_ACCOUNT} className="flex">
          <button className="mt-10 w-full md:w-1/2 bg-zinc-700 hover:bg-red-300 text-red-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Remove Account & Data
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Settings
