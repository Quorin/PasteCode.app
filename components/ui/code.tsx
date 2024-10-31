const Code = async ({ code }: { code: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: code }}></div>
}

export default Code
