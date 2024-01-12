import { unstable_noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import PageTitle from '@/components/ui/page-title'
import Image from 'next/image'
import { routes } from '@/constants/routes'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { confirmAccountAction } from '@/actions/confirm-account'

const ConfirmAccountPage = async ({
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

  const action = await confirmAccountAction({ id, code })
  if (!action) {
    return
  }

  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <PageTitle title="Confirm Account" />

      {action.success ? (
        <Image
          src="/images/confirmed.svg"
          alt="Confirmed"
          priority
          width={300}
          height={200}
        />
      ) : (
        <Image
          src="/images/alert.svg"
          alt="Code is incorrect or expired"
          priority
          width={300}
          height={200}
        />
      )}

      <div className="text-center flex flex-col gap-10">
        <p>
          {action
            ? 'Account has been confirmed.'
            : 'Link is incorrect or expired.'}
        </p>
        <Link href={routes.HOME}>
          <Button className="px-20">Go home</Button>
        </Link>
      </div>
    </div>
  )
}

export default ConfirmAccountPage
