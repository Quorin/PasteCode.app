'use client'

import { getUsersPastes } from '@/actions/get-users-pastes'
import { DataTable } from '@/components/data-table/data-table'
import { getColumns } from '@/components/pastes-table/pastes-table-columns'
import { useDataTable } from '@/lib/hooks/use-data-table'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

export const PastesTable = ({
  data,
  defaultPerPage,
}: {
  data: Awaited<ReturnType<typeof getUsersPastes>>
  defaultPerPage: number
}) => {
  const router = useRouter()
  const columns = useMemo(() => getColumns(), [])

  const { table } = useDataTable({
    data: data.pastes,
    columns,
    pageCount: data.meta.pageCount,
    defaultPerPage,
    defaultSort: 'createdAt.desc',
    filterFields: [],
    enableAdvancedFilter: false,
  })

  return (
    <DataTable
      table={table}
      onRowClick={(row) => router.push(`/pastes/${row.original.id}`)}
    />
  )
}
