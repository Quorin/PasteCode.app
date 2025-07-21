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
import { Tag, TagList } from '@/components/ui/tag'
import { getSession } from '@/utils/auth'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import IncorrectPassword from '@/components/forms/incorrect-password'
import { PasteDeletionDialog } from '@/components/common/paste-deletion-dialog'
import { getPaste } from '@/actions/orpc/get-paste'
import { safe } from '@orpc/client'

dayjs.extend(relativeTime)

const PasteIndex = async (props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ password?: string | string[] }>
}) => {
  const { id } = await props.params
  const { password } = await props.searchParams
  const { user } = await getSession()
  const pastePassword = Array.isArray(password) ? password[0] : password

  const { error, data } = await safe(
    getPaste({ id, password: pastePassword ?? null }),
  )

  if (error) return

  const { paste, secure } = data
  if (!paste) {
    notFound()
  }

  const canEdit = user?.id === paste.userId

  if (secure) {
    if (!pastePassword) {
      return <UnlockForm />
    }

    return (
      <>
        <IncorrectPassword password={pastePassword} />
        <UnlockForm />
      </>
    )
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
            <PasteDeletionDialog pasteId={paste.id} password={pastePassword} />
          </Dialog>
        )}
      </div>
      <div className="py-4">
        <Code code={paste.content} style={paste.style ?? ''} />
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
