'use server'

import { getSession } from '@/utils/auth'
import { os } from '@orpc/server'
import { z } from 'zod'

export const logout = os
  .input(z.void())
  .output(z.void())
  .handler(async () => {
    const session = await getSession()
    session.destroy()
  })
  .actionable()
