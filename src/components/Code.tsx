import Prism from 'prismjs'
import 'prismjs/plugins/line-highlight/prism-line-highlight'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import { useEffect } from 'react'

type CodeProps = {
  code: string
  language: string
}

const Code = ({ code, language }: CodeProps) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  return (
    <div className="code">
      <pre className="rounded-2xl line-numbers">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

export default Code
