'use server'

import { getSession } from '@/utils/auth'

export const logoutAction = async () => {
  const session = await getSession()
  session.destroy()
}
