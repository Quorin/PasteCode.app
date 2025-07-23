import { redirect } from 'next/navigation'
import ChangeEmailForm from '@/components/forms/change-email-form'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import { getUser } from '@/actions/shared/get-user'

const ChangeEmailPage = async () => {
  const user = await getUser()
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
