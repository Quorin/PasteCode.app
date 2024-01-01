import { notFound } from 'next/navigation'
import PageTitle from '@/components/ui/page-title'
import { checkResetPassword } from '@/actions/check-reset-password'
import Image from 'next/image'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ConfirmResetPasswordForm from '@/components/forms/confirm-reset-password-form'
import { unstable_noStore } from 'next/cache'

const ConfirmResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: {
    id?: string | string[]
    code?: string | string[]
  }
}) => {
  unstable_noStore()

  const id = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id
  const code = Array.isArray(searchParams.code)
    ? searchParams.code[0]
    : searchParams.code

  if (!id || !code) {
    notFound()
  }

  const action = await checkResetPassword({ id, code })

  if (!action?.success) {
    return (
      <div className="flex flex-col justify-center items-center gap-10">
        <PageTitle title="Reset password" />

        <Image
          src="/images/alert.svg"
          alt="Link is incorrect or expired"
          priority
          width={300}
          height={200}
        />
        <div className="text-center flex flex-col gap-10">
          <p>Link is incorrect or expired.</p>
          <Link href={routes.HOME}>
            <Button className="px-20">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Confirm reset password" />
      <ConfirmResetPasswordForm id={id} code={code} />
    </div>
  )
}

export default ConfirmResetPasswordPage
