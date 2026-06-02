'use client'

import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/useAuth'
import { tokenStorage } from '@/services/api/client'
import type { User, UserRole, Permission } from '@/types'
import { hasPermission, hasAnyPermission } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  role: UserRole | null
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Check if a JWT token is expired.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000
    return Date.now() >= expiry
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [isClient, setIsClient] = useState(false)
  // Track token changes reactively so the profile query fires after login
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Read initial token
    setToken(tokenStorage.getAccessToken())
  }, [])

  // Listen for token changes (login/logout from other tabs)
  useEffect(() => {
    if (!isClient) return
    const check = () => setToken(tokenStorage.getAccessToken())
    window.addEventListener('storage', check)
    window.addEventListener('auth:token-changed', check)
    return () => {
      window.removeEventListener('storage', check)
      window.removeEventListener('auth:token-changed', check)
    }
  }, [isClient])

  // Clear expired tokens
  useEffect(() => {
    if (!isClient) return
    const t = tokenStorage.getAccessToken()
    if (t && isTokenExpired(t)) {
      tokenStorage.clearTokens()
      queryClient.clear()
      setToken(null)
    }
  }, [isClient, queryClient, token])

  // Only fetch profile when we have a non-expired token
  const shouldFetch = isClient && !!token && !isTokenExpired(token)

  const { data: user, isLoading, isError } = useProfile(shouldFetch)

  // Re-check token when query errors (e.g. 401 — token revoked)
  useEffect(() => {
    if (isError) {
      const t = tokenStorage.getAccessToken()
      if (!t || isTokenExpired(t)) {
        setToken(null)
      }
    }
  }, [isError])

  const value = useMemo<AuthContextValue>(() => {
    if (!user || isError) {
      return {
        user: null,
        isLoading,
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        role: null,
        can: () => false,
        canAny: () => false,
      }
    }

    const role = user.role

    return {
      user,
      isLoading,
      isAuthenticated: true,
      isAdmin: role === 'ADMIN',
      isSuperAdmin: role === 'SUPER_ADMIN',
      role,
      can: (permission: Permission) => hasPermission(role, permission),
      canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    }
  }, [user, isLoading, isError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
