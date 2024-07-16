import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'

export const PasteDeletionDialog = ({
  handleDelete,
}: {
  handleDelete: () => void
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete paste</DialogTitle>
        <DialogDescription>
          {"Are you sure you want to delete this paste? It can't be undone."}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <form action={handleDelete} className="flex sm:flex-row flex-col gap-2">
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
