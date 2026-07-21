import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useState, type ReactNode } from 'react'

import { getMe, login as apiLogin, type Me, type MePermission } from '@/lib/api'
import { clearTokens, getAccessToken } from '@/lib/auth-tokens'

interface AuthContextValue {
  user: Me | undefined
  permissions: Record<string, MePermission>
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => !!getAccessToken())

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: hasToken,
    retry: false,
  })

  const permissions: Record<string, MePermission> = {}
  for (const p of user?.permissions ?? []) {
    permissions[p.menu_key] = p
  }

  async function login(username: string, password: string) {
    await apiLogin(username, password)
    setHasToken(true)
    await queryClient.invalidateQueries({ queryKey: ['me'] })
  }

  function logout() {
    clearTokens()
    setHasToken(false)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading: hasToken && isLoading,
        isAuthenticated: hasToken && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
