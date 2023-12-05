type CodeProps = {
  code: string
}

const Code = ({ code }: CodeProps) => {
  return <div dangerouslySetInnerHTML={{ __html: code }}></div>
}

export default Code
