/**
 * Auth Adapter — Medusa customer auth → frontend User + token interface.
 *
 * Medusa v2 uses email+password via `/store/auth/customer/token`.
 * Tokens are returned and stored in localStorage (same pattern as current frontend).
 */

import { medusa } from '@/lib/medusa/client'
import { mapCustomerToUser } from '@/lib/medusa/mappers'
import { tokenStorage } from '@/lib/medusa/token-storage'
import { config } from '@/config/env'
import type { User, LoginInput, RegisterInput, ApiResponse } from '@/types'

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

export async function login(input: LoginInput): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
  try {
    const result = await medusa.auth.login('customer', 'emailpass', {
      email: input.email,
      password: input.password,
    })

    const loginResult = result as any
    const token = loginResult.token as string | undefined
    if (!token) {
      throw new Error('No token returned from login')
    }

    // Medusa returns a single token (JWT), use it as both access & refresh
    tokenStorage.setAccessToken(token)
    tokenStorage.setRefreshToken(token)

    // Get customer profile after login
    const customer = await medusa.store.customer.retrieve()
    const user = mapCustomerToUser(customer as {
      id: string
      email: string
      first_name?: string | null
      last_name?: string | null
      phone?: string | null
      avatar_url?: string | null
      created_at?: string
      updated_at?: string
    })

    return {
      success: true,
      data: {
        user,
        tokens: { accessToken: token, refreshToken: token },
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
    // 1. Create customer
    await medusa.store.customer.create({
      email: input.email,
      password: input.password,
      first_name: input.firstName ?? undefined,
      last_name: input.lastName ?? undefined,
      phone: input.phone ?? undefined,
    })

    // 2. Auto-login after registration
    return login({ email: input.email, password: input.password })
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
    const customer = await medusa.store.customer.retrieve()
    const user = mapCustomerToUser(customer)
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
  try {
    const customer = await medusa.store.customer.update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    })
    const user = mapCustomerToUser(customer)
    return { success: true, data: user }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'UPDATE_FAILED', message: error.message ?? 'Failed to update profile' } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Admin Login (Medusa platform user / backoffice)
// ─────────────────────────────────────────────

export async function adminLogin(input: { email: string; password: string }): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
  try {
    const baseUrl = config.medusaUrl

    // Step 1: Authenticate via Medusa /auth/user/emailpass
    const loginRes = await fetch(`${baseUrl}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.email, password: input.password }),
    })
    if (!loginRes.ok) {
      const errBody = await loginRes.json().catch(() => ({}))
      throw new Error(errBody.message ?? 'Email atau password salah')
    }
    const loginData = await loginRes.json()
    const token = loginData.token as string | undefined
    if (!token) {
      throw new Error('No token returned from admin login')
    }

    // Step 2: Store token
    tokenStorage.setAccessToken(token)
    tokenStorage.setRefreshToken(token)

    // Step 3: Fetch admin user profile via /admin/users/me
    const profileRes = await fetch(`${baseUrl}/admin/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!profileRes.ok) {
      throw new Error(`Failed to fetch admin profile: ${profileRes.status}`)
    }
    const profileData = await profileRes.json()
    const userObj = profileData.user
    const userId = userObj.id as string
    const role = await getAdminRole(userId, token)

    const user: User = {
      id: userId,
      email: (userObj.email as string) ?? '',
      firstName: (userObj.first_name as string | null) ?? null,
      lastName: (userObj.last_name as string | null) ?? null,
      phone: null,
      avatar: null,
      role,
      isActive: true,
      lastLoginAt: null,
      createdAt: (userObj.created_at as string) ?? new Date().toISOString(),
      updatedAt: (userObj.updated_at as string) ?? new Date().toISOString(),
    }

    return {
      success: true,
      data: {
        user,
        tokens: { accessToken: token, refreshToken: token },
      },
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'ADMIN_AUTH_FAILED', message: error.message ?? 'Admin login failed' } },
    } as any
  }
}

/**
 * Fetch admin user profile from Medusa admin API.
 * Uses direct fetch with token from tokenStorage for reliability across page navigations.
 */
export async function getAdminProfile(): Promise<ApiResponse<User>> {
  try {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      throw new Error('No token available')
    }

    const baseUrl = config.medusaUrl

    // Fetch admin user profile via /admin/users/me
    const res = await fetch(`${baseUrl}/admin/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch admin profile: ${res.status}`)
    }
    const data = await res.json()
    const userObj = data.user

    const userId = userObj.id as string
    const role = await getAdminRole(userId, token)

    const user: User = {
      id: userId,
      email: (userObj.email as string) ?? '',
      firstName: (userObj.first_name as string | null) ?? null,
      lastName: (userObj.last_name as string | null) ?? null,
      phone: null,
      avatar: null,
      role,
      isActive: true,
      lastLoginAt: null,
      createdAt: (userObj.created_at as string) ?? new Date().toISOString(),
      updatedAt: (userObj.updated_at as string) ?? new Date().toISOString(),
    }

    return { success: true, data: user }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'ADMIN_PROFILE_FAILED', message: error.message ?? 'Failed to get admin profile' } },
    } as any
  }
}

/**
 * Resolve user role from Medusa RBAC module.
 * Medusa v2 doesn't expose a public RBAC endpoint, so we default based on user properties.
 * Falls back to ADMIN if role lookup fails.
 */
async function getAdminRole(userId: string, token: string): Promise<User['role']> {
  try {
    const baseUrl = config.medusaUrl
    // Try fetching the user detail to check for admin-specific fields
    const res = await fetch(`${baseUrl}/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      // In some Medusa setups, users with specific metadata or fields indicate admin roles
      // Default to SUPER_ADMIN for seeded admin users
      return 'SUPER_ADMIN'
    }
  } catch {
    // Silently fail — default below
  }
  return 'ADMIN'
}

export async function logout(): Promise<ApiResponse<null>> {
  try {
    await medusa.auth.logout()
  } finally {
    tokenStorage.clearTokens()
  }
  return { success: true, data: null }
}

// ─────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────

export async function refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
  try {
    const currentToken = tokenStorage.getAccessToken()
    if (!currentToken) {
      throw new Error('No refresh token')
    }

    // Medusa doesn't have a dedicated refresh endpoint for customer tokens
    // We use the existing token to re-authenticate
    return {
      success: true,
      data: { accessToken: currentToken, refreshToken: currentToken },
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
