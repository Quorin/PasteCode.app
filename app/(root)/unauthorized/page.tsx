import Image from 'next/image'
import Link from 'next/link'
import PageTitle from '@/components/ui/page-title'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'

const Unauthorized = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <PageTitle title="Unauthorized" />

      <Image
        src="/images/401.svg"
        alt="Unauthorized"
        priority
        width={300}
        height={200}
      />
      <div className="text-center flex flex-col gap-10">
        <p>You are not authorized to access this page.</p>
        <Link href={routes.HOME}>
          <Button className="px-20">Go home</Button>
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
