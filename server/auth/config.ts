import { SessionOptions } from 'iron-session'

export type SessionUser = {
  id: string
  credentialsUpdatedAt?: Date | null
}

export const sessionOptions: SessionOptions = {
  cookieName: 'session',
  password: process.env.SESSION_SECRET!,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
