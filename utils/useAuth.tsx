'use client'

import { SessionUser, getUser } from '@/utils/auth'
import { QueryStatus, useQuery } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'

type AuthContextType = {
  user: SessionUser | null
  logout: () => void
  refresh: () => Promise<void>
  status: QueryStatus
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null)

  const query = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const user = await getUser()
      setUser(user)
      return user
    },
    refetchOnWindowFocus: false,
  })

  const logout = async () => {
    setUser(null)
  }

  const refresh = async () => {
    await query.refetch()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        refresh,
        status: query.status,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, useAuth }
