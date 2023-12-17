import { unstable_cache } from 'next/cache'
import { bundledLanguages, getHighlighter } from 'shikiji/index.mjs'

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
        langs: Object.keys(bundledLanguages),
      })

      return shiki.codeToHtml(code, {
        lang: style ?? 'txt',
        theme: 'material-theme-darker',
      })
    },
    [`code-${id}`],
    {
      revalidate: 3600,
      tags: [`paste:${id}`, `code:${id}`],
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
