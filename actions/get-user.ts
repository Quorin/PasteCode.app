'use server'

import { os } from '@orpc/server'
import { getUser as getUserFn } from './shared/get-user'

export const getUser = os
  .handler(async () => {
    return await getUserFn()
  })
  .actionable()
