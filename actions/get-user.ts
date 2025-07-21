'use server'

import { os } from '@orpc/server'
import { getSession } from './get-session'

export const getUser = os
  .handler(async () => {
    return (await getSession()).user
  })
  .actionable()
