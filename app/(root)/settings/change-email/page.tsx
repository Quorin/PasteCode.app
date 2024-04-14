import { redirect } from 'next/navigation'
import { getSession } from '@/utils/auth'
import ChangeEmailForm from '@/components/forms/change-email-form'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'

const ChangeEmailPage = async () => {
  const { user } = await getSession()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  return (
    <div>
      <PageTitle title="Change Email" />
      <ChangeEmailForm />
    </div>
  )
}

export default ChangeEmailPage
