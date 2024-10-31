import FormTitle from '@/components/ui/form-title'
import PasteForm from '@/components/forms/paste-form'
import { notFound } from 'next/navigation'
import { getPaste } from '@/actions/get-paste'
import UnlockForm from '@/components/forms/unlock-form'
import { defaultLanguage } from '@/utils/lang'

const Fork = async (props: {
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
      <FormTitle title={'Fork Paste'} />
      <PasteForm
        initialValues={{
          content: paste.content,
          description: paste.description || '',
          style: paste.style || defaultLanguage,
          tags: paste.tags,
          tag: '',
          title: paste.title,
          expiration: 'never',
        }}
      />
    </div>
  )
}

export default Fork
