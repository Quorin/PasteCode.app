'use client'

import Image from 'next/image'
import Link from 'next/link'
import { routes } from '@/constants/routes'
import PageTitle from '@/components/ui/page-title'
import { Button } from '@/components/ui/button'

const AppError = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <PageTitle title="App Error" />

      <Image
        src="/images/500.svg"
        alt="App Error"
        priority
        width={300}
        height={200}
      />
      <div className="text-center flex flex-col gap-10">
        <p>Something went wrong, please try again later.</p>
        <Link href={routes.HOME}>
          <Button className="px-20">Go home</Button>
        </Link>
      </div>
    </div>
  )
}

export default AppError
