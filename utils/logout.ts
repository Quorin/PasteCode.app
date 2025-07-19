import { queryOptions, useQueryClient } from '@tanstack/react-query'
import { getUser } from './auth'
import { useRouter } from 'next/navigation'
import { routes } from '@/constants/routes'
import { client } from '@/lib/orpc'

export const userQueryOptions = queryOptions({
  queryKey: ['user'],
  queryFn: async () => await getUser(),
  refetchOnWindowFocus: false,
})

export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return async () => {
    await client.auth.logout()

    queryClient.clear()
    router.push(routes.HOME)
  }
}
