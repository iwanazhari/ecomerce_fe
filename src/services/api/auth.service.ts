/**
 * Auth Service — delegates to Medusa adapter layer.
 */
import {
  login,
  register,
  getProfile,
  updateProfile,
  logout,
  refreshToken,
} from '@/lib/medusa'
import { tokenStorage } from '@/lib/medusa/token-storage'
import type {
  User,
  AuthTokens,
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
} from '@/types'

export interface GoogleLoginInput {
  idToken: string
}

export const authService = {
  login: (data: LoginInput) => login(data),
  register: (data: RegisterInput) => register(data),

  // TODO: Google OAuth via Medusa auth provider
  googleLogin: (data: GoogleLoginInput) =>
    Promise.reject(new Error('Google OAuth not yet implemented for Medusa')) as any,
  getGoogleOAuthUrl: () =>
    Promise.reject(new Error('Google OAuth URL not yet implemented for Medusa')) as any,

  logout: () => logout(),

  // TODO: Change password via Medusa
  changePassword: (data: ChangePasswordInput) =>
    Promise.reject(new Error('Change password not yet implemented for Medusa')) as any,

  getProfile: () => getProfile(),
  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) =>
    updateProfile({
      firstName: data.firstName ?? undefined,
      lastName: data.lastName ?? undefined,
      phone: data.phone ?? undefined,
    }),
}

export { tokenStorage }
