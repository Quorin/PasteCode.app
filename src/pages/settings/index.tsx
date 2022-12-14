import Link from 'next/link'
import { useRouter } from 'next/router'
import PageTitle from '../../components/PageTitle'
import { routes } from '../../constants/routes'
import { trpc } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

const Settings = () => {
  const router = useRouter()
  const logoutMutation = trpc.useMutation(['auth.logout'])
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
        <Link href={routes.SETTINGS.CHANGE_PASSWORD}>
          <button className="w-full md:w-1/2 bg-zinc-700 hover:bg-zinc-300 text-zinc-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Change Password
          </button>
        </Link>
        <Link href={routes.SETTINGS.CHANGE_EMAIL}>
          <button className="w-full md:w-1/2 bg-zinc-700 hover:bg-zinc-300 text-zinc-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Change Email
          </button>
        </Link>
        <Link href={routes.SETTINGS.CHANGE_NAME}>
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
        <Link href={routes.SETTINGS.REMOVE_ACCOUNT}>
          <button className="mt-10 w-full md:w-1/2 bg-zinc-700 hover:bg-red-300 text-red-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Remove Account & Data
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Settings
