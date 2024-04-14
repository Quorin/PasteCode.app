import { getUser, type SessionUser } from '@/utils/auth'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext } from 'react'

const AuthContext = createContext<{
  user: SessionUser | null
  isLoading: boolean
  refetchUser: () => void
}>({
  user: null,
  isLoading: true,
  refetchUser: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const query = useQuery({
    queryKey: ['user'],
    queryFn: async () => await getUser(),
    refetchOnWindowFocus: false,
  })

  return (
    <AuthContext.Provider
      value={{
        user: query.data || null,
        isLoading: query.isLoading,
        refetchUser: query.refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
