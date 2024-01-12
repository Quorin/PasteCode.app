'use client'

import dayjs from 'dayjs'

import relativeTime from 'dayjs/plugin/relativeTime'
import Image from 'next/image'
import Link from 'next/link'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { useInfiniteQuery } from '@tanstack/react-query'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getUsersPastes } from '@/actions/get-users-pastes'
import { Loader2 } from 'lucide-react'
import { Tag, TagList } from '@/components/ui/tag'

dayjs.extend(relativeTime)

const PasteList = () => {
  const {
    isLoading: isLoadingPastes,
    fetchNextPage,
    hasNextPage,
    data,
  } = useInfiniteQuery({
    queryKey: ['pastes'],
    queryFn: async ({ pageParam }) => {
      return await getUsersPastes(25, pageParam)
    },
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  })

  const count = () => {
    return (
      data?.pages.map((p) => p.pastes.length).reduce((a, b) => a + b, 0) ?? 0
    )
  }

  const next = () => {
    !isLoadingPastes && fetchNextPage()
  }

  if (!count()) {
    return (
      <div className="flex flex-col justify-center items-center">
        {isLoadingPastes ? (
          <div className="flex flex-col justify-center items-center gap-4 m-4">
            <p className="text-primary">Loading...</p>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="text-center flex flex-col gap-10">
            <Image
              src="/images/empty.svg"
              alt="No images"
              priority
              width={300}
              height={200}
            />
            <Link href={routes.HOME} passHref>
              <Button>Add your first paste</Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <InfiniteScroll
      dataLength={count()}
      next={() => next()}
      hasMore={hasNextPage || false}
      loader={
        <div className="flex flex-col justify-center items-center gap-4 m-4">
          <p className="text-primary">Loading...</p>
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        </div>
      }
      endMessage={
        <div className="flex justify-center">
          <Image
            src="/images/done.svg"
            alt="No images"
            priority
            width={300}
            height={400}
            className="py-10"
          />
        </div>
      }
      pullDownToRefresh={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data?.pages ?? []).map(({ pastes }) =>
          pastes.map((p) => (
            <Link
              prefetch={false}
              href={`/pastes/${p.id}`}
              key={p.id}
              className="hover:brightness-125 transition cursor-pointer p-6 rounded-lg border shadow-md bg-background"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl pb-2 font-semibold text-primary truncate">
                  {p.title}
                </h2>
                <TagList>
                  {p.tags.map((t) => (
                    <Tag value={t} key={t} />
                  ))}
                </TagList>
                <p className="font-normal text-sm text-muted-foreground truncate italic mb-2">
                  {p.description}
                </p>
                <div>
                  <div className="flex gap-1 items-center -ml-1 mt-1 text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-muted-foreground flex-none"
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
                        className="fill-muted-foreground"
                        d="M233.38 278.63l-79-113a8.13 8.13 0 0111.32-11.32l113 79a32.5 32.5 0 01-37.25 53.26 33.21 33.21 0 01-8.07-7.94z"
                      />
                    </svg>
                    <p className="font-normal text-muted-foreground">
                      Expires{' '}
                      <span className="font-bold">
                        {p.expiresAt ? dayjs(p.expiresAt).fromNow() : 'Never'}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-1 -ml-1 mt-1 items-center text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-muted-foreground flex-none"
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
                        className="fill-primary"
                        cx="296"
                        cy="232"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="376"
                        cy="232"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="296"
                        cy="312"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="376"
                        cy="312"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="136"
                        cy="312"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="216"
                        cy="312"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="136"
                        cy="392"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
                        cx="216"
                        cy="392"
                        r="24"
                      />
                      <circle
                        className="fill-muted-foreground"
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
                    <p className="font-normal text-muted-foreground mt-0.5">
                      Created At{' '}
                      <span className="font-bold">
                        {dayjs(p.createdAt).format('YYYY/MM/DD')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )),
        )}
      </div>
    </InfiniteScroll>
  )
}

export default PasteList
