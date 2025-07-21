import { notFound } from 'next/navigation'
import EditPasteForm from '@/components/forms/edit-paste-form'
import PageTitle from '@/components/ui/page-title'
import UnlockForm from '@/components/forms/unlock-form'
import { getPaste } from '@/actions/get-paste'
import { safe } from '@orpc/client'

const EditPastePage = async (props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    password?: Array<string> | string
  }>
}) => {
  const { id } = await props.params
  const { password } = await props.searchParams
  const currentPassword = Array.isArray(password) ? password[0] : password

  const { error, data } = await safe(
    getPaste({
      id,
      password: currentPassword ?? null,
    }),
  )

  if (error) return

  const { paste, secure } = data

  if (!paste) {
    notFound()
  }

  if (secure) {
    return <UnlockForm />
  }

  return (
    <div>
      <PageTitle title={'Edit Paste'} />
      <EditPasteForm
        initialValues={{
          content: paste.content,
          currentPassword,
          password: currentPassword,
          id,
          description: paste.description ?? '',
          expiration: 'same',
          style: paste.style ?? 'text',
          tag: '',
          tags: paste.tags,
          title: paste.title,
        }}
      />
    </div>
  )
}

export default EditPastePage
