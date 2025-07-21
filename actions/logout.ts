'use server'

import { os } from '@orpc/server'
import { z } from 'zod'
import { sessionOptions } from '@/server/auth/config'
import { cookies } from 'next/headers'

export const logout = os
  .input(z.void())
  .output(z.void())
  .handler(async () => {
    const cookieStore = await cookies()
    cookieStore.delete(sessionOptions.cookieName)
  })
  .actionable()
