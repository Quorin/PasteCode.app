'use server'

import { os } from '@orpc/server'
import { getSession } from './get-session'

export const getSessionAction = os
  .handler(async () => {
    return await getSession()
  })
  .actionable()
