'use client'

import Link from 'next/link'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import { Button, ButtonVariants } from '@/components/ui/button'
import { logoutAction } from '@/actions/logout'
import DeletionDialog from '@/app/(root)/settings/deletion-dialog'
import { toast } from 'sonner'
import { useAuth } from '@/utils/useAuth'

type Route = {
  title: string
  route: string
  variant?: ButtonVariants['variant']
}

const settingRoutes = [
  {
    title: 'Change Password',
    route: routes.SETTINGS.CHANGE_PASSWORD,
    variant: 'secondary',
  },
  {
    title: 'Change Email',
    route: routes.SETTINGS.CHANGE_EMAIL,
    variant: 'secondary',
  },
] satisfies Array<Route>

const SettingsPage = () => {
  const { refetchUser } = useAuth()

  const handleLogout = async () => {
    await logoutAction()

    toast.info('Logged out successfully')

    refetchUser()
  }

  return (
    <div className="text-center">
      <PageTitle title="Settings" />
      <div className="flex flex-col gap-6">
        {settingRoutes.map((settingRoute) => (
          <Button
            key={settingRoute.route}
            asChild
            className="w-full md:w-1/2 transition-colors mx-auto"
            variant={settingRoute.variant}
          >
            <Link
              href={settingRoute.route}
              prefetch={false}
              key={settingRoute.title}
            >
              {settingRoute.title}
            </Link>
          </Button>
        ))}

        <DeletionDialog className="w-full md:w-1/2 transition-colors mx-auto" />

        <div></div>

        <Button
          className="w-full md:w-1/2 transition-colors mx-auto"
          variant="outline"
          onClick={handleLogout}
          type="submit"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage
