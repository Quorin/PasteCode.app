import { notFound } from 'next/navigation'
import PageTitle from '@/components/ui/page-title'
import Image from 'next/image'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ConfirmResetPasswordForm from '@/components/forms/confirm-reset-password-form'
import { unstable_noStore } from 'next/cache'
import { checkResetPassword } from '@/actions/orpc/check-reset-password'
import { safe } from '@orpc/server'

const ConfirmResetPasswordPage = async (props: {
  searchParams: Promise<{
    id?: string | string[]
    code?: string | string[]
  }>
}) => {
  const searchParams = await props.searchParams
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

  const { isSuccess, data: result } = await safe(
    checkResetPassword({ id, code }),
  )

  if (!isSuccess || !result) {
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
