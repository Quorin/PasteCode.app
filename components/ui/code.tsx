import { languageOptions } from '@/utils/lang'
import { getSingletonHighlighter } from 'shiki'

type CodeProps = {
  code: string
  style: string | null
}

const generateHtml = async ({
  code,
  style,
}: {
  code: string
  style: string
}) => {
  const shiki = await getSingletonHighlighter({
    themes: ['material-theme-darker'],
    langs: languageOptions,
  })

  return shiki.codeToHtml(code, {
    lang: style ?? 'txt',
    theme: 'material-theme-darker',
  })
}

const Code = async ({ code, style }: CodeProps) => {
  const html = await generateHtml({
    code,
    style: style ?? '',
  })

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>
}

export default Code
