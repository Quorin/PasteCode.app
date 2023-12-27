import Image from 'next/image'
import Link from 'next/link'
import { routes } from '@/constants/routes'
import PageTitle from '@/components/ui/page-title'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <PageTitle title="Not found" />

      <Image
        src="/images/404.svg"
        priority
        alt="Not found"
        width={300}
        height={200}
      />
      <div className="text-center flex flex-col gap-10">
        <p>Page not found.</p>
        <Link href={routes.HOME}>
          <Button className="px-20">Go home</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
