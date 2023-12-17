'use server'

import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { routes } from '../../constants/routes'

export const logoutAction = async () => {
  const session = await auth()
  session.destroy()

  redirect(routes.HOME)
}
