import { redirect } from 'next/navigation'
import { getSession } from '@/utils/auth'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import ChangePasswordForm from '@/components/forms/change-password-form'

const ChangePasswordPage = async () => {
  const { user } = await getSession()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  return (
    <div>
      <PageTitle title="Change Password" />
      <ChangePasswordForm />
    </div>
  )
}

export default ChangePasswordPage
