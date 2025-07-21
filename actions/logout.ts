'use server'

import { os } from '@orpc/server'
import { z } from 'zod'
import { getSession } from './get-session'

export const logout = os
  .input(z.void())
  .output(z.void())
  .handler(async () => {
    const session = await getSession()
    session.destroy()
  })
  .actionable()
