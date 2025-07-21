import { queryOptions, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { routes } from '@/constants/routes'
import { useServerAction } from '@orpc/react/hooks'
import { logout } from '@/actions/logout'

export const userQueryOptions = queryOptions({
  queryKey: ['user'],
  refetchOnWindowFocus: false,
})

export const useLogout = () => {
  const { execute } = useServerAction(logout)

  const queryClient = useQueryClient()
  const router = useRouter()

  return async () => {
    await execute()

    queryClient.clear()
    router.push(routes.HOME)
  }
}
