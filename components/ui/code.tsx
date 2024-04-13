import { languageOptions } from '@/utils/lang'
import { unstable_cache } from 'next/cache'
import { getHighlighter } from 'shiki'

type CodeProps = {
  id: string
  code: string
  style: string | null
}

const generateHtml = async ({
  code,
  style,
  id,
}: {
  id: string
  code: string
  style: string
}) =>
  unstable_cache(
    async () => {
      const shiki = await getHighlighter({
        themes: ['material-theme-darker'],
        langs: languageOptions,
      })

      return shiki.codeToHtml(code, {
        lang: style ?? 'txt',
        theme: 'material-theme-darker',
      })
    },
    [`code:${id}`],
    {
      revalidate: false,
      tags: [`code:${id}`],
    },
  )()

const Code = async ({ id, code, style }: CodeProps) => {
  const html = await generateHtml({
    id,
    code,
    style: style ?? '',
  })

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>
}

export default Code
