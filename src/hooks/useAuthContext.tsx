'use client'

import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/useAuth'
import { tokenStorage } from '@/services/api/client'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  role: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Check if a JWT token is expired.
 * Returns true if the token is expired or invalid.
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

  // Ensure we're on the client before reading tokens
  // This prevents hydration mismatch between server and client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Always call useProfile with the same hook count
  // Use `enabled` to control whether the query actually runs
  const shouldFetchProfile = isClient && (() => {
    const token = tokenStorage.getAccessToken()
    return !!token && !isTokenExpired(token)
  })()

  const { data: user, isLoading, isError } = useProfile(shouldFetchProfile)

  // Clear expired tokens on client
  useEffect(() => {
    if (!isClient) return
    const token = tokenStorage.getAccessToken()
    if (token && isTokenExpired(token)) {
      tokenStorage.clearTokens()
      queryClient.clear()
    }
  }, [isClient, queryClient])

  const value = useMemo<AuthContextValue>(() => {
    if (!user || isError) {
      return { user: null, isLoading, isAuthenticated: false, isAdmin: false, isSuperAdmin: false, role: null }
    }

    return {
      user,
      isLoading,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      role: user.role,
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
