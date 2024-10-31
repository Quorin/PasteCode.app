import { codeToHtml } from 'shiki'

const generateHtml = async ({
  code,
  style,
}: {
  code: string
  style: string
}) => {
  return await codeToHtml(code, {
    lang: style ?? 'txt',
    theme: 'material-theme-darker',
  })
}

const Code = async ({ code, style }: { code: string; style: string }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: await generateHtml({
          code,
          style,
        }),
      }}
    ></div>
  )
}

export default Code
