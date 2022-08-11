import Link from 'next/link'
import { routes } from '../../constants/routes'

const Settings = () => {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl text-zinc-200 mb-10 font-semibold self-center">
        Settings
      </h2>

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
        <Link href={routes.SETTINGS.REMOVE_ACCOUNT}>
          <button className="w-full md:w-1/2 bg-zinc-700 hover:bg-red-300 text-red-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg">
            Remove Account & Data
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Settings
