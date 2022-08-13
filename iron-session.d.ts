import { SessionUser } from './src/utils/useUser'

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser
  }
}
