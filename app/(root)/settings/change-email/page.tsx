import { redirect } from 'next/navigation'
import ChangeEmailForm from '@/components/forms/change-email-form'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import { getSession } from '@/actions/get-session'

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
