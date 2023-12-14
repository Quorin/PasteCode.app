import { getPaste } from '../../_actions/get-paste'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Code from '../../_components/Code'
import NotFound from '../../../pages_old/404'
import FormTitle from '../../_components/FormTitle'
import Link from 'next/link'
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon'
import dayjs from 'dayjs'
import CopyButton from './CopyButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import {
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import UnlockForm from './UnlockForm'
import { Button } from '../../../components/ui/button'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const PasteIndex = async ({
  params: { id, password },
}: {
  params: { id: string; password?: string }
}) => {
  const { paste, secure } = await getPaste(id, password)

  const handleDelete = async (id: string) => {
    console.log('delete', id)
  }

  const canEdit = true

  if (!paste) {
    return redirect('/404')
  }

  if (secure) {
    return <UnlockForm />
  }

  return (
    <div className="flex flex-col gap-6">
      {!paste ? (
        <h2 className="text-2xl text-zinc-100 text-bold text-center">
          {/* // todo */}
          <NotFound />
        </h2>
      ) : (
        <div>
          <FormTitle title={paste.title} />
          {paste.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 my-5">
              {paste.tags.map((tag) => (
                <p
                  key={tag}
                  className="inline-flex items-center py-1 px-2 text-sm font-medium  rounded bg-zinc-500 text-zinc-200"
                >
                  #{tag}
                </p>
              ))}
            </div>
          )}
          {paste.description && (
            <h3 className="text-sm text-zinc-400 mb-10 font-light italic break-all">
              {paste.description}
            </h3>
          )}

          <div className="mb-10 flex gap-2 flex-wrap">
            <CopyButton content={paste.content} />
            {canEdit && (
              <Link
                // className="flex items-center gap-2 justify-center bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
                type="button"
                // onClick={() =>
                //   router.push({
                //     pathname: routes.PASTES.EDIT,
                //     query: {
                //       id: router.query.id,
                //       password: router.query.password,
                //     },
                //   })
                // }
                href={{
                  pathname: `/pastes/${paste.id}/edit`,
                  query: {
                    password: password,
                  },
                }}
              >
                <Button className="gap-2" variant={'secondary'}>
                  <PencilIcon className="w-6" />
                  Edit
                </Button>
              </Link>
            )}
            <Link
              // className="flex items-center gap-2 justify-center text-center cursor-pointer bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
              // type="button"
              href={{
                pathname: `/pastes/${paste.id}/raw`,
                query: {
                  password: password,
                },
              }}
              // href={`${router.asPath.replace(
              //   router.query.id as string,
              //   `${router.query.id}/raw`,
              // )}`}
            >
              <Button className="gap-2" variant={'secondary'}>
                <DocumentTextIcon className="w-6" />
                Raw View
              </Button>
            </Link>
            <Link
              // className="flex items-center gap-2 justify-center bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
              href={{
                pathname: `/pastes/${paste.id}/fork`,
                query: {
                  password: password,
                },
              }}
              // onClick={() =>
              //   router.push({
              //     pathname: routes.HOME,
              //     query: {
              //       fork: paste?.id,
              //       password: router.query.password ?? null,
              //     },
              //   })
              // }
            >
              <Button className="gap-2" variant={'secondary'}>
                <DocumentDuplicateIcon className="w-6" />
                Duplicate
              </Button>
            </Link>
            {canEdit && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant={'destructive'}
                    className="gap-2"
                    // className="flex items-center gap-2 justify-center bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
                  >
                    <TrashIcon className="w-6" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-lg leading-6 font-medium text-zinc-50">
                      Remove
                    </DialogTitle>
                    <DialogDescription className="text-sm text-zinc-300">
                      {
                        "Are you sure you want to remove this paste? It's cannot be undone."
                      }
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="mb-10">
            <Suspense fallback={<div>Loading...</div>}>
              <Code id={paste.id} code={paste.content} style={paste.style} />
            </Suspense>
          </div>
          <p className="text-zinc-300 text-sm">
            Created at:{' '}
            <span className="font-bold">
              {dayjs(paste.createdAt).format('YYYY/MM/DD')}
            </span>
          </p>
          <p className="text-zinc-300 text-sm">
            Expires:{' '}
            <span className="font-bold">
              {paste.expiresAt ? dayjs(paste.expiresAt).fromNow() : 'Never'}
            </span>
          </p>
        </div>
      )}
    </div>
  )

  // return (
  //   <div>
  //     <h1>{paste.title}</h1>
  //     <Suspense fallback={<div>Loading...</div>}>
  //       <Code id={paste.id} code={paste.content} style={paste.style} />
  //     </Suspense>
  //   </div>
  // )
}

export default PasteIndex
