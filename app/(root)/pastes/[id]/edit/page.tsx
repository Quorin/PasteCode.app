import { notFound } from 'next/navigation'
import EditPasteForm from '@/components/forms/edit-paste-form'
import PageTitle from '@/components/ui/page-title'
import { getPaste } from '@/actions/get-paste'
import UnlockForm from '@/components/forms/unlock-form'

const EditPastePage = async (props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    password?: Array<string> | string
  }>
}) => {
  const searchParams = await props.searchParams

  const { password } = searchParams

  const params = await props.params

  const { id } = params

  const currentPassword = Array.isArray(password) ? password[0] : password
  const { paste, secure } = await getPaste(id, currentPassword)

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
