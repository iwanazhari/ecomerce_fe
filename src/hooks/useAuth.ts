'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/api'
import { loginSchema, registerSchema, changePasswordSchema } from '@/validators'
import type { LoginInput, RegisterInput, ChangePasswordInput, User } from '@/types'
import { tokenStorage } from '@/services/api/client'
import type { GoogleLoginInput } from '@/services/api/auth.service'

// ============================================================
// Auth Keys
// ============================================================

const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

// ============================================================
// Profile Query
// ============================================================

export function useProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async (): Promise<User | null> => {
      // Try customer profile first
      const customerResult = await authService.getProfile()
      if (customerResult.success && customerResult.data) {
        return customerResult.data
      }
      // Fallback: try admin profile (Medusa platform user)
      const { getAdminProfile } = await import('@/lib/medusa')
      const adminResult = await getAdminProfile()
      if (adminResult.success && adminResult.data) {
        return adminResult.data
      }
      // Both failed — return null instead of throwing (avoids 401 console spam)
      return null
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 min
    retry: false, // Don't retry on 401 (admin token vs customer endpoint)
    throwOnError: false, // Prevent React Query from logging expected failures
  })
}

// ============================================================
// Login Mutation
// ============================================================

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginInput) => {
      const parsed = loginSchema.parse(data)
      return authService.login(parsed)
    },
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        throw new Error((res as any).meta?.error?.message ?? 'Login failed')
      }
      const { accessToken, refreshToken } = (res.data as any).tokens || {}
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid response format from login')
      }
      tokenStorage.setAccessToken(accessToken)
      tokenStorage.setRefreshToken(refreshToken)
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// ============================================================
// Register Mutation
// ============================================================

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterInput) => {
      const parsed = registerSchema.parse(data)
      return authService.register(parsed)
    },
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        throw new Error((res as any).meta?.error?.message ?? 'Registration failed')
      }
      const { accessToken, refreshToken } = (res.data as any).tokens || {}
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid response format from registration')
      }
      tokenStorage.setAccessToken(accessToken)
      tokenStorage.setRefreshToken(refreshToken)
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// ============================================================
// Google Login Mutation
// ============================================================

export function useGoogleLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GoogleLoginInput) => authService.googleLogin(data),
    onSuccess: (res: any) => {
      if (!res.success || !res.data) {
        throw new Error(res.meta?.error?.message ?? 'Google login failed')
      }
      const { accessToken, refreshToken } = res.data.tokens || {}
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid response format from Google login')
      }
      tokenStorage.setAccessToken(accessToken)
      tokenStorage.setRefreshToken(refreshToken)
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// ============================================================
// Logout Mutation
// ============================================================

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      tokenStorage.clearTokens()
      queryClient.clear()
    },
  })
}

// ============================================================
// Change Password Mutation
// ============================================================

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => {
      const parsed = changePasswordSchema.parse(data)
      return authService.changePassword(parsed)
    },
  })
}

// ============================================================
// Update Profile Mutation
// ============================================================

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) =>
      authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}
