import { getPaste } from '@/actions/get-paste'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Code from '@/components/ui/code'
import FormTitle from '@/components/ui/form-title'
import Link from 'next/link'
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon'
import dayjs from 'dayjs'
import CopyButton from '@/components/ui/copy-button'
import {
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import UnlockForm from '@/components/forms/unlock-form'
import { Button } from '@/components/ui/button'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Skeleton } from '@/components/ui/skeleton'
import { Tag, TagList } from '@/components/ui/tag'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { routes } from '@/constants/routes'

dayjs.extend(relativeTime)

const PasteIndex = async ({
  params: { id },
  searchParams: { password },
}: {
  params: { id: string }
  searchParams: { password?: string | string[] }
}) => {
  const { paste, secure } = await getPaste(
    id,
    Array.isArray(password) ? password[0] : password,
  )

  // todo: check if user can edit paste
  const canEdit = true

  if (!paste) {
    return redirect('/404')
  }

  if (secure) {
    return <UnlockForm id={id} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <FormTitle title={paste.title} />

        {paste.description && (
          <h3 className="text-sm text-zinc-400 mb-10 font-light italic break-all">
            {paste.description}
          </h3>
        )}

        <div className="mb-10 flex gap-2 flex-wrap">
          <CopyButton content={paste.content} />
          {canEdit && (
            <Link
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
                  password,
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
            href={{
              pathname: `/pastes/${paste.id}/raw`,
              query: {
                password,
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
            href={{
              pathname: routes.HOME,
              query: {
                fork: paste?.id,
                password,
              },
            }}
          >
            <Button className="gap-2" variant={'secondary'}>
              <DocumentDuplicateIcon className="w-6" />
              Duplicate
            </Button>
          </Link>
          {canEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={'destructive'} className="gap-2">
                  <TrashIcon className="w-6" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete paste</AlertDialogTitle>
                  <AlertDialogDescription>
                    {
                      "Are you sure you want to delete this paste? It's cannot be undone."
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="mb-10">
          <Suspense fallback={<Skeleton className="shiki"></Skeleton>}>
            <Code id={paste.id} code={paste.content} style={paste.style} />
          </Suspense>
        </div>
        <TagList>
          {paste.tags.map((tag) => (
            <Tag key={tag} value={tag} />
          ))}
        </TagList>
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
    </div>
  )
}

export default PasteIndex