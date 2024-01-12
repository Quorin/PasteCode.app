'use client'

import Link from 'next/link'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import { Button, ButtonVariants } from '@/components/ui/button'
import { logoutAction } from '@/actions/logout'
import DeletionDialog from '@/app/(root)/settings/deletion-dialog'
import { toast } from 'sonner'

type Route = {
  title: string
  route: string
  variant?: ButtonVariants['variant']
}

const settingRoutes: Array<Route> = [
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
  {
    title: 'Change Name',
    route: routes.SETTINGS.CHANGE_NAME,
    variant: 'secondary',
  },
]

const SettingsPage = () => {
  const handleLogout = async () => {
    await logoutAction()

    toast.info('Logged out successfully')

    await logoutAction()
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
            <Link href={settingRoute.route} key={settingRoute.title}>
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
