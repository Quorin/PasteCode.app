'use client'

import { ClipboardIcon } from '@heroicons/react/24/outline'
import { Button } from '../../../components/ui/button'

const CopyButton = ({ content }: { content: string }) => {
  return (
    <Button
      // className="bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
      type="button"
      className="gap-2"
      variant={'secondary'}
      onClick={() => navigator.clipboard.writeText(content)}
    >
      <ClipboardIcon className="w-6" />
      Copy
    </Button>
  )
}

export default CopyButton
