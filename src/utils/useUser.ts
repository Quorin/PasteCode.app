import { useEffect } from 'react'
import Router from 'next/router'
import { trpc } from './trpc'

export type SessionUser = {
  id: string
  isLoggedIn: boolean
  name: string
  credentialsUpdatedAt?: Date | null
}

export default function useUser({
  redirectTo = '',
  redirectIfFound = false,
} = {}) {
  const { data: user } = trpc.useQuery(['auth.checkSession'])

  useEffect(() => {
    if (!redirectTo || !user) return

    if (
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo)
    }
  }, [user, redirectIfFound, redirectTo])

  return { user }
}
