import Image from 'next/image'
import Link from 'next/link'
import PageTitle from '../components/PageTitle'
import { routes } from '../constants/routes'

const InternalServerError = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <PageTitle title="Internal Server Error" />

      <Image
        src="/images/500.svg"
        alt="Internal Server Error"
        width={500}
        height={400}
      />
      <Link href={routes.HOME}>
        <div className="text-center mt-10">
          <p>Something went wrong, please try again later.</p>
          <h3 className="text-lg text-zinc-200 cursor-pointer bg-blue-500 hover:bg-blue-700 transition-colors px-10 py-2.5 mt-10 rounded-lg">
            Go home
          </h3>
        </div>
      </Link>
    </div>
  )
}

export default InternalServerError
