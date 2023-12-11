import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionUser } from './utils/useAuth'
import { sessionOptions } from './server/auth/config'

export const auth = () =>
  getIronSession<{ user: SessionUser }>(cookies(), sessionOptions)
