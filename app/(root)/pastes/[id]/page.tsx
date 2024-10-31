import { getPaste } from '@/actions/get-paste'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
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
import { getSession } from '@/utils/auth'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { removePasteAction } from '@/actions/remove-paste'
import IncorrectPassword from '@/components/forms/incorrect-password'
import { PasteDeletionDialog } from '@/components/common/paste-deletion-dialog'

dayjs.extend(relativeTime)

const PasteIndex = async (props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ password?: string | string[] }>
}) => {
  const searchParams = await props.searchParams

  const { password } = searchParams

  const params = await props.params

  const { id } = params

  const { user } = await getSession()

  const pastePassword = Array.isArray(password) ? password[0] : password

  const { paste, secure } = await getPaste(id, pastePassword)

  const canEdit = user?.id === paste?.userId

  if (!paste) {
    notFound()
  }

  if (secure) {
    if (pastePassword) {
      return (
        <>
          <IncorrectPassword password={pastePassword} />
          <UnlockForm />
        </>
      )
    }

    return <UnlockForm />
  }

  const handleDelete = async () => {
    'use server'
    await removePasteAction({ id, password: pastePassword })
  }

  return (
    <div className="flex flex-col gap-6">
      <FormTitle title={paste.title} />

      {paste.description && (
        <h3 className="text-sm text-secondary-400 font-light italic break-all">
          {paste.description}
        </h3>
      )}

      <TagList>
        {paste.tags.map((tag) => (
          <Tag key={tag} value={tag} />
        ))}
      </TagList>

      <div className="flex gap-2 flex-wrap">
        <CopyButton content={paste.content} />
        {canEdit && (
          <Link
            type="button"
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
        >
          <Button className="gap-2" variant={'secondary'}>
            <DocumentTextIcon className="w-6" />
            Raw View
          </Button>
        </Link>
        <Link
          href={{
            pathname: `/pastes/${paste.id}/fork`,
            query: {
              password,
            },
          }}
        >
          <Button className="gap-2" variant={'secondary'}>
            <DocumentDuplicateIcon className="w-6" />
            Fork
          </Button>
        </Link>
        {canEdit && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={'destructive'} className="gap-2">
                <TrashIcon className="w-6" />
                Delete
              </Button>
            </DialogTrigger>
            <PasteDeletionDialog handleDelete={handleDelete} />
          </Dialog>
        )}
      </div>
      <div className="py-4">
        <Code code={paste.content} />
      </div>
      <div>
        <p className="font-normal text-sm text-muted-foreground">
          Created At{' '}
          <span className="font-bold">
            {dayjs(paste.createdAt).format('YYYY/MM/DD')}
          </span>
        </p>
        <p className="font-normal text-sm text-muted-foreground">
          Expires{' '}
          <span className="font-bold">
            {paste.expiresAt ? dayjs(paste.expiresAt).fromNow() : 'Never'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default PasteIndex
