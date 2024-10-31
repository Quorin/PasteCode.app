import { getUsersPastes } from '@/actions/get-users-pastes'
import { PastesTable } from '@/components/pastes-table/pastes-table'
import PageTitle from '@/components/ui/page-title'
import { type PastesSortBy, pastesSortBySchema } from '@/server/schema'
import { unstable_noStore } from 'next/cache'
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
  const searchParams = await props.searchParams
  unstable_noStore()

  const searchParamsData = searchParamsSchema.safeParse(searchParams)

  const data = !searchParamsData.success
    ? await getUsersPastes(1, defaultPerPage, defaultSortBy)
    : await getUsersPastes(
        searchParamsData.data.page,
        searchParamsData.data.per_page,
        searchParamsData.data.sort,
      )

  return (
    <div className="flex flex-col">
      <PageTitle title="Your content" />
      <PastesTable data={data} defaultPerPage={defaultPerPage} />
    </div>
  )
}

export default ProfilePage
