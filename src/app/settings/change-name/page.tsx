import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import PageTitle from '../../../components/ui/page-title'
import { routes } from '../../../constants/routes'
import ChangeNameForm from '../../../components/forms/change-name-form'

const ChangeNamePage = async () => {
  const user = await auth()

  if (!user) {
    redirect(routes.AUTH.LOGIN)
  }

  return (
    <div>
      <PageTitle title="Change Name" />
      <ChangeNameForm />
    </div>
  )
}

export default ChangeNamePage
