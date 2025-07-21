import { getUserPastes } from '@/actions/orpc/get-user-pastes'
import { PastesTable } from '@/components/pastes-table/pastes-table'
import PageTitle from '@/components/ui/page-title'
import { type PastesSortBy, pastesSortBySchema } from '@/server/schema'
import { safe } from '@orpc/client'
import { z } from 'zod'

const defaultPerPage = 20
const defaultSortBy: PastesSortBy = 'createdAt.desc'

const searchParamsSchema = z.object({
  page: z.coerce.number().int().optional().default(1),
  sort: pastesSortBySchema.optional().default(defaultSortBy),
  per_page: z.coerce.number().int().optional().default(defaultPerPage),
})

const ProfilePage = async (props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}) => {
  const searchParamsData = searchParamsSchema.safeParse(
    await props.searchParams,
  )

  const { error, data } = !searchParamsData.success
    ? await safe(
        getUserPastes({
          page: 1,
          perPage: defaultPerPage,
          sort: defaultSortBy,
        }),
      )
    : await safe(
        getUserPastes({
          page: searchParamsData.data.page,
          perPage: searchParamsData.data.per_page,
          sort: searchParamsData.data.sort,
        }),
      )

  if (error) return

  return (
    <div className="flex flex-col">
      <PageTitle title="Your content" />
      <PastesTable data={data} defaultPerPage={defaultPerPage} />
    </div>
  )
}

export default ProfilePage
