import { createContext, ReactNode, useContext, useState } from 'react'
import { api } from './trpc'

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

  const query = api.auth.checkSession.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: true,
    onSuccess: (user) => {
      if (user?.id) {
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

  const logout = () => {
    setUser(null)
    setIsLoading(false)
    setIsLoggedIn(false)
  }

  const refresh = async () => {
    setIsLoading(true)
    await query.refetch()
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isLoggedIn, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext)
}
