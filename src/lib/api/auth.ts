/**
 * Auth Adapter — Express backend API → frontend User + token interface.
 *
 * Endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET  /api/auth/profile
 * - POST /api/auth/refresh-token
 */

import { api, tokenStorage } from '@/lib/api/client'
import { mapBackendUser } from '@/lib/api/mappers'
import type { User, LoginInput, RegisterInput, ApiResponse } from '@/types'

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

export async function login(input: LoginInput): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
  try {
    const result = await api.post<Record<string, unknown>>('/auth/login', {
      email: input.email,
      password: input.password,
    })

    if (!result.success || !result.data) {
      return result as any
    }

    const data = result.data
    const loginData = data as Record<string, unknown>
    const tokenData = loginData.accessToken
      ? loginData
      : (loginData.data as Record<string, unknown>) ?? loginData

    const accessToken = tokenData?.accessToken as string | undefined
    const refreshToken = tokenData?.refreshToken as string | undefined

    if (!accessToken) {
      return {
        success: false,
        data: undefined as any,
        meta: { error: { code: 'AUTH_FAILED', message: 'No token returned from login' } },
      } as any
    }

    tokenStorage.setAccessToken(accessToken)
    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken)
    } else {
      tokenStorage.setRefreshToken(accessToken)
    }

    // Extract user from response
    const userRaw = (tokenData.user ?? loginData.user) as Record<string, unknown>
    const user = userRaw ? mapBackendUser(userRaw) : mapBackendUser({
      id: '',
      email: input.email,
      firstName: null,
      lastName: null,
      phone: null,
      avatarUrl: null,
      role: 'CUSTOMER',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return {
      success: true,
      data: {
        user,
        tokens: { accessToken, refreshToken: refreshToken ?? accessToken },
      },
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'AUTH_FAILED', message: error.message ?? 'Login failed' } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
  try {
    const result = await api.post<Record<string, unknown>>('/auth/register', {
      email: input.email,
      password: input.password,
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      phone: input.phone ?? undefined,
    })

    if (!result.success || !result.data) {
      return result as any
    }

    // Auto-login after successful registration
    const data = result.data as Record<string, unknown>
    const userData = (data.user ?? data.data) as Record<string, unknown>

    if (userData?.id) {
      // Registration returned user data — try to login
      return login({ email: input.email, password: input.password })
    }

    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'REGISTER_FAILED', message: 'Registration succeeded but auto-login failed' } },
    } as any
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'REGISTER_FAILED', message: error.message ?? 'Registration failed' } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Get Profile
// ─────────────────────────────────────────────

export async function getProfile(): Promise<ApiResponse<User>> {
  try {
    const result = await api.get<Record<string, unknown>>('/auth/profile')

    if (!result.success || !result.data) {
      return result as any
    }

    const data = result.data
    const userRaw = (data.user ?? data) as Record<string, unknown>
    const user = mapBackendUser(userRaw)

    return { success: true, data: user }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'PROFILE_FAILED', message: error.message ?? 'Failed to get profile' } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Update Profile
// ─────────────────────────────────────────────

export async function updateProfile(data: {
  firstName?: string
  lastName?: string
  phone?: string
}): Promise<ApiResponse<User>> {
  // TODO: Backend doesn't expose a profile update endpoint yet
  // For now, fetch profile again to maintain interface
  return getProfile()
}

// ─────────────────────────────────────────────
// Admin Login (same endpoint, role comes from response)
// ─────────────────────────────────────────────

export async function adminLogin(input: { email: string; password: string }): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
  // Admin uses the same /api/auth/login endpoint — role is determined by the user object
  return login({ email: input.email, password: input.password })
}

export async function getAdminProfile(): Promise<ApiResponse<User>> {
  return getProfile()
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

export async function logout(): Promise<ApiResponse<null>> {
  try {
    tokenStorage.clearTokens()
    return { success: true, data: null }
  } catch {
    tokenStorage.clearTokens()
    return { success: true, data: null }
  }
}

// ─────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────

export async function refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
  try {
    const currentRefreshToken = tokenStorage.getRefreshToken()
    if (!currentRefreshToken) {
      throw new Error('No refresh token')
    }

    const result = await api.post<Record<string, unknown>>('/auth/refresh-token', {
      refreshToken: currentRefreshToken,
    })

    if (!result.success || !result.data) {
      throw new Error('Token refresh failed')
    }

    const data = result.data as Record<string, unknown>
    const tokenData = (data.data ?? data) as Record<string, unknown>
    const accessToken = tokenData.accessToken as string

    if (!accessToken) {
      throw new Error('No access token in refresh response')
    }

    tokenStorage.setAccessToken(accessToken)

    return {
      success: true,
      data: { accessToken, refreshToken: currentRefreshToken },
    }
  } catch (error: any) {
    tokenStorage.clearTokens()
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'REFRESH_FAILED', message: error.message ?? 'Token refresh failed' } },
    } as any
  }
}
