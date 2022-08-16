import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { trpc } from './trpc'

export type SessionUser = {
  id: string
  name: string
  credentialsUpdatedAt?: Date | null
}

interface AuthContextType {
  user: SessionUser | null
  isLoading: boolean
  isLoggedIn: boolean
  refresh: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const query = trpc.useQuery(['auth.checkSession'], {
    enabled: false,
    onSuccess: (user) => {
      if (user && user.id) {
        setUser(user)
        setIsLoading(false)
        setIsLoggedIn(true)
      } else {
        logout()
      }
    },
    onError: () => {
      logout()
    },
  })

  useEffect(() => {
    refresh()
  }, [])

  const logout = () => {
    setUser(null)
    setIsLoading(false)
    setIsLoggedIn(false)
  }

  const refresh = async () => {
    setIsLoading(true)
    await query.refetch()
  }

  const memoValue = useMemo(
    () => ({
      user,
      isLoading,
      isLoggedIn,
      refresh,
      logout,
    }),
    [user, isLoading, isLoggedIn],
  )

  return (
    <AuthContext.Provider value={memoValue}>{children}</AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext)
}
