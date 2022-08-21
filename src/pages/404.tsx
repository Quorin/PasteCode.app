import Image from 'next/image'
import Link from 'next/link'
import { routes } from '../constants/routes'

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-center text-zinc-100 mb-8">
        Not found
      </h1>

      <Image src="/images/404.svg" alt="Not found" width={500} height={400} />
      <Link href={routes.HOME}>
        <h3 className="text-lg text-zinc-200 cursor-pointer bg-blue-500 hover:bg-blue-700 transition-colors px-10 py-2.5 mt-10 rounded-lg">
          Go home
        </h3>
      </Link>
    </div>
  )
}

export default NotFound
