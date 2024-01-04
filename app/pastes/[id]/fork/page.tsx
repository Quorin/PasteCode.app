import FormTitle from '@/components/ui/form-title'
import PasteForm from '@/components/forms/paste-form'
import { notFound } from 'next/navigation'
import { getPaste } from '@/actions/get-paste'
import UnlockForm from '@/components/forms/unlock-form'
import { defaultLanguage } from '@/utils/lang'

const Fork = async ({
  params: { id },
  searchParams: { password },
}: {
  params: { id: string }
  searchParams: {
    password?: Array<string> | string
  }
}) => {
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
