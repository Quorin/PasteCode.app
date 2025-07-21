import { os } from '@orpc/server'
import { getSession } from '@/actions/get-session'
import { unauthorized } from 'next/navigation'

export const loggedIn = os.middleware(async ({ next }) => {
  const session = await getSession()
  if (!session.user) {
    throw unauthorized()
  }

  return next({
    context: {
      session: {
        ...session,
        user: session.user,
      },
    },
  })
})
