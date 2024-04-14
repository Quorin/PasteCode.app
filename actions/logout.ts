'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/utils/auth'
import { routes } from '@/constants/routes'

export const logoutAction = async () => {
  const session = await getSession()
  session.destroy()

  redirect(routes.HOME)
}
