import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Code from '../../components/Code'
import Spinner from '../../components/Spinner'
import { trpc } from '../../utils/trpc'

const Paste: NextPage = () => {
  const router = useRouter()
  const {
    data: paste,
    isLoading,
    error,
  } = trpc.useQuery([
    'paste.getPaste',
    {
      id: router.query.id as string,
    },
  ])

  return (
    <div className="flex flex-col gap-6">
      {isLoading || error ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : !paste ? (
        <h2 className="text-2xl text-zinc-100 text-bold text-center">
          Paste not found
        </h2>
      ) : (
        <div>
          <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
            {paste.title}
          </h2>
          {paste.description && (
            <h3 className="text-lg text-zinc-400 mb-10 font-light italic bg-zinc-700 p-5 rounded-2xl">
              {paste.description}
            </h3>
          )}
          <Code code={paste.content} language={paste.style ?? 'txt'} />
        </div>
      )}
    </div>
  )
}

export default Paste
