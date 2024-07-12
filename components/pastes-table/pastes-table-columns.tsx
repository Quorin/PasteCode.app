import { getUsersPastes } from '@/actions/get-users-pastes'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Tag } from '@/components/ui/tag'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

type Paste = Awaited<ReturnType<typeof getUsersPastes>>['pastes'][0]

export const getColumns = (): Array<ColumnDef<Paste>> => {
  return [
    {
      accessorKey: 'title',
      accessorFn: (row) => row.title,
      header: ({ column }) => (
        <DataTableColumnHeader className="px-2" column={column} title="Title" />
      ),
      cell: ({ cell }) => {
        return (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger>
                <p className="px-2 max-w-48 overflow-hidden text-ellipsis text-nowrap">
                  {cell.row.original.title}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cell.row.original.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ cell }) => {
        return (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger>
                <p className="text-nowrap">
                  {dayjs
                    .duration(-dayjs().diff(cell.getValue() as Date))
                    .humanize(true)}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cell.row.original.createdAt.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'expiresAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ cell }) => {
        const value = cell.row.original.expiresAt
        if (!value) {
          return 'Never'
        }

        return (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger>
                {dayjs.duration(-dayjs().diff(value)).humanize(true)}
              </TooltipTrigger>
              <TooltipContent>
                <p>{value.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'tags',
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ cell }) => {
        const tags = cell.row.original.tags

        return (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger>
                {tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {tags.slice(0, 2).map((tag) => (
                      <Tag key={tag} value={tag} />
                    ))}
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{tags.join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
  ]
}
