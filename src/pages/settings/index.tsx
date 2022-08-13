import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Modal from '../../components/Modal'
import { routes } from '../../constants/routes'
import { trpc } from '../../utils/trpc'

const Settings = () => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const { mutateAsync: mutateRemoveAccountAsync } = trpc.useMutation([
    'settings.removeAccount',
  ])
  const router = useRouter()
  const { mutateAsync: mutateLogoutAsync } = trpc.useMutation(['auth.logout'])

  const handleDelete = async () => {
    setIsDeleteModalVisible(false)

    await mutateRemoveAccountAsync(undefined, {
      onSuccess() {
        router.replace(routes.HOME)
      },
    })
  }

  const handleLogout = async () => {
    await mutateLogoutAsync(undefined, {
      async onSuccess() {
        await router.replace(routes.HOME)
        router.reload()
      },
    })
  }

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
        <button
          onClick={() => handleLogout()}
          className="w-full md:w-1/2 bg-zinc-700 hover:bg-red-300 text-red-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg"
        >
          Logout
        </button>
        <button
          onClick={() => setIsDeleteModalVisible(true)}
          className="mt-10 w-full md:w-1/2 bg-zinc-700 hover:bg-red-300 text-red-300 hover:text-zinc-700 transition-colors mx-auto px-10 py-3 rounded-lg"
        >
          Remove Account & Data
        </button>
        <Modal
          visible={isDeleteModalVisible}
          action={() => handleDelete()}
          close={() => setIsDeleteModalVisible(false)}
          accentColor="red"
          title="Remove account"
          actionTitle="Remove"
          description="Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone."
        />
      </div>
    </div>
  )
}

export default Settings
