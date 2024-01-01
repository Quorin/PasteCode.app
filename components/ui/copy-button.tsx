'use client'

import { ClipboardIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

const CopyButton = ({ content }: { content: string }) => {
  return (
    <Button
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
