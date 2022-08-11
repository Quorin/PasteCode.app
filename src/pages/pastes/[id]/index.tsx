import dayjs from 'dayjs'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Code from '../../../components/Code'
import Spinner from '../../../components/Spinner'
import { trpc } from '../../../utils/trpc'

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
          {paste.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {paste.tags.map((tag) => (
                <span
                  key={tag.tag.name}
                  className="text-zinc-100 bg-zinc-700 px-3 py-1 rounded-2xl"
                >
                  {tag.tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="mb-10 grid grid-cols-2 md:grid-cols-4 md:place-items-stretch md:w-2/3 lg:w-1/2 gap-2">
            <button
              className="bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              onClick={() => navigator.clipboard.writeText(paste.content)}
            >
              Copy
            </button>
            <button
              className="bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              onClick={() => {}}
            >
              Edit
            </button>
            <a
              className=" text-center cursor-pointer bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              href={`${router.asPath}/raw`}
            >
              Raw
            </a>
            <button
              className="bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              onClick={() => {}}
            >
              Fork
            </button>
          </div>
          <div className="mb-10">
            <Code code={paste.content} language={paste.style ?? 'txt'} />
          </div>
          <p className="text-zinc-300 text-sm">
            Created at:{' '}
            <span className="font-bold">
              {dayjs(paste.createdAt).format('YYYY/MM/DD')}
            </span>
          </p>
          <p className="text-zinc-300 text-sm">
            Expires at:{' '}
            <span className="font-bold">
              {paste.expiresAt
                ? dayjs(paste.expiresAt).format('YYYY/MM/DD')
                : 'Never'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Paste
