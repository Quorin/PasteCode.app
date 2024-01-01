'use server'

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/server/auth/config'

export type SessionUser = {
  id: string
  name: string
  credentialsUpdatedAt?: Date | null
}

export const auth = () =>
  getIronSession<{ user: SessionUser | null }>(cookies(), sessionOptions)
