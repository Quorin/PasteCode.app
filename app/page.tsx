import FormTitle from '@/components/ui/form-title'
import PasteForm from '@/components/forms/paste-form'
import { defaultLanguage } from '@/utils/lang'
import { getPaste } from '@/actions/get-paste'

export default async function Home({
  searchParams,
}: {
  searchParams: { fork?: string | string[]; password?: string | string[] }
}) {
  const fork = Array.isArray(searchParams.fork)
    ? searchParams.fork[0]
    : searchParams.fork
  const password = Array.isArray(searchParams.password)
    ? searchParams.password[0]
    : searchParams.password
  let paste: Awaited<ReturnType<typeof getPaste>>['paste'] | null | undefined

  if (fork) {
    paste = (await getPaste(fork, password)).paste
  }

  return (
    <div>
      <FormTitle title="Create new paste" />
      <PasteForm
        initialValues={
          paste
            ? {
                content: paste.content,
                description: paste.description || '',
                style: paste.style || defaultLanguage,
                tags: paste.tags,
                tag: '',
                title: paste.title,
                expiration: 'never',
              }
            : undefined
        }
      />
    </div>
  )
}
