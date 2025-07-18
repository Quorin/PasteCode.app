import { queryOptions, useQueryClient } from '@tanstack/react-query'
import { getUser } from './auth'
import { logoutAction } from '@/actions/logout'
import { useRouter } from 'next/navigation'
import { routes } from '@/constants/routes'

export const userQueryOptions = queryOptions({
  queryKey: ['user'],
  queryFn: async () => await getUser(),
  refetchOnWindowFocus: false,
})

export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return async () => {
    await logoutAction()

    queryClient.clear()
    router.push(routes.HOME)
  }
}
