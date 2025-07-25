import { redirect } from 'next/navigation'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import ChangePasswordForm from '@/components/forms/change-password-form'
import { getUser } from '@/actions/get-user'

const ChangePasswordPage = async () => {
  const user = await getUser()
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
