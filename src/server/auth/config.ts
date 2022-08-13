import { IronSessionOptions } from 'iron-session'

export const sessionOptions: IronSessionOptions = {
  cookieName: 'auth_session',
  password: process.env.SESSION_SECRET!,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
