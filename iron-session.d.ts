import { SessionUser } from './src/utils/useAuth'

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser
  }
}
