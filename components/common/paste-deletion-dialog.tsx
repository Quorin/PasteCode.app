'use client'

import { removePaste } from '@/actions/remove-paste'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
import { routes } from '@/constants/routes'
import { onError, onSuccess } from '@orpc/client'
import { useServerAction } from '@orpc/react/hooks'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const PasteDeletionDialog = ({
  pasteId,
  password,
}: {
  pasteId: string
  password: string | undefined
}) => {
  const router = useRouter()

  const { execute } = useServerAction(removePaste, {
    interceptors: [
      onSuccess(async () => {
        toast.success('Paste has been deleted')
        router.push(routes.HOME)
      }),
      onError(async () => {
        toast.error('Failed to delete paste')
      }),
    ],
  })
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete paste</DialogTitle>
        <DialogDescription>
          {"Are you sure you want to delete this paste? It can't be undone."}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await execute({ id: pasteId, password })
          }}
          className="flex sm:flex-row flex-col gap-2"
        >
          <DialogClose asChild>
            <Button type="button" variant={'secondary'}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" variant={'destructive'}>
            Delete
          </Button>
        </form>
      </DialogFooter>
    </DialogContent>
  )
}
