import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from 'next/image'
import Link from 'next/link'
import Router from 'next/router'
import InfiniteScroll from 'react-infinite-scroll-component'
import PageTitle from '../components/PageTitle'
import Spinner from '../components/Spinner'
import { routes } from '../constants/routes'
import { trpc } from '../utils/trpc'
import useAuth from '../utils/useAuth'

dayjs.extend(relativeTime)

const Profile = () => {
  const { isLoggedIn, isLoading } = useAuth()

  if (!isLoading && !isLoggedIn) {
    Router.push(routes.AUTH.LOGIN)
  }

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading: isLoadingPastes,
  } = trpc.useInfiniteQuery(['paste.getUserPastes', { limit: 25 }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const next = () => {
    !isLoadingPastes && fetchNextPage()
  }

  const count = () => {
    return (
      data?.pages.map((p) => p.pastes.length).reduce((a, b) => a + b, 0) ?? 0
    )
  }

  return (
    <div className="flex flex-col">
      <PageTitle title="Your content" />

      {count() == 0 ? (
        <div className="flex flex-col justify-center items-center">
          {isLoadingPastes ? (
            <Spinner />
          ) : (
            <div className="text-center">
              <Image
                src="/images/empty.svg"
                alt="No images"
                width={500}
                height={400}
              />
              <Link href={routes.HOME}>
                <h3 className="text-lg text-zinc-300 hover:text-zinc-100 cursor-pointer hover:underline">
                  Add your first paste!
                </h3>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={count()}
          next={() => next()}
          hasMore={hasNextPage || false}
          loader={
            <div className="flex justify-center m-4">
              <Spinner />
            </div>
          }
          endMessage={
            <div className="flex justify-center">
              <Image
                src="/images/done.svg"
                alt="No images"
                width={300}
                height={400}
              />
            </div>
          }
          pullDownToRefresh={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data?.pages ?? []).map(({ pastes }) =>
              pastes.map((p) => (
                <div
                  onClick={() =>
                    Router.push({
                      pathname: routes.PASTES.INDEX,
                      query: { id: p.id },
                    })
                  }
                  key={p.id}
                  className="hover:brightness-125 transition cursor-pointer p-6 rounded-lg border shadow-md bg-zinc-800 border-zinc-700"
                >
                  <div className="flex flex-col">
                    <div>
                      <h2 className="mb-2 text-2xl font-semibold text-white truncate">
                        {p.title}
                      </h2>
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 my-4">
                          {p.tags.map((t, i) => (
                            <p
                              key={i}
                              className="inline-flex items-center py-1 px-2 text-sm font-medium bg-zinc-500 rounded text-zinc-200"
                            >
                              #{t.tag.name}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="font-normal text-sm text-zinc-400 truncate italic mb-2">
                        {p.description}
                      </p>
                    </div>
                    <div>
                      <div className="flex gap-1 items-center -ml-1 mt-1 text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-zinc-400 flex-none"
                          viewBox="0 0 512 512"
                        >
                          <title>Expires At</title>
                          <path
                            d="M112.91 128A191.85 191.85 0 0064 254c-1.18 106.35 85.65 193.8 192 194 106.2.2 192-85.83 192-192 0-104.54-83.55-189.61-187.5-192a4.36 4.36 0 00-4.5 4.37V152"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="32"
                          />
                          <path
                            className="fill-zinc-400"
                            d="M233.38 278.63l-79-113a8.13 8.13 0 0111.32-11.32l113 79a32.5 32.5 0 01-37.25 53.26 33.21 33.21 0 01-8.07-7.94z"
                          />
                        </svg>
                        <p className="font-normal text-zinc-400">
                          Expires{' '}
                          <span className="font-bold">
                            {p.expiresAt
                              ? dayjs(p.expiresAt).fromNow()
                              : 'Never'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-1 -ml-1 mt-1 items-center text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-zinc-400 flex-none"
                          viewBox="0 0 512 512"
                        >
                          <title>Created At</title>
                          <rect
                            fill="none"
                            stroke="currentColor"
                            strokeLinejoin="round"
                            strokeWidth="32"
                            x="48"
                            y="80"
                            width="416"
                            height="384"
                            rx="48"
                          />
                          <circle
                            className="fill-zinc-400"
                            cx="296"
                            cy="232"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="376"
                            cy="232"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="296"
                            cy="312"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="376"
                            cy="312"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="136"
                            cy="312"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="216"
                            cy="312"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="136"
                            cy="392"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="216"
                            cy="392"
                            r="24"
                          />
                          <circle
                            className="fill-zinc-600"
                            cx="296"
                            cy="392"
                            r="24"
                          />
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinejoin="round"
                            strokeWidth="32"
                            strokeLinecap="round"
                            d="M128 48v32M384 48v32"
                          />
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinejoin="round"
                            strokeWidth="32"
                            d="M464 160H48"
                          />
                        </svg>
                        <p className="font-normal text-zinc-400 mt-0.5">
                          Created At{' '}
                          <span className="font-bold">
                            {dayjs(p.createdAt).format('YYYY/MM/DD')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )),
            )}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}

export default Profile
