import { os } from '@orpc/server'
import { getUser } from '@/actions/shared/get-user'
import { unauthorized } from 'next/navigation'

export const loggedIn = os.middleware(async ({ next }) => {
  const user = await getUser()
  if (!user) {
    throw unauthorized()
  }

  return next({
    context: {
      user,
    },
  })
})
