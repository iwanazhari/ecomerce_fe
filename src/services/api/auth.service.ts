/**
 * Auth Service — delegates to new API adapter layer.
 */
import {
  login,
  register,
  getProfile,
  updateProfile,
  logout,
  refreshToken,
} from "@/lib/api";
import { tokenStorage } from "@/lib/api/client";
import type {
  User,
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
} from "@/types";

export interface GoogleLoginInput {
  idToken: string;
}

export const authService = {
  login: (data: LoginInput) => login(data),
  register: (data: RegisterInput) => register(data),

  googleLogin: (data: GoogleLoginInput) =>
    Promise.reject(new Error("Google OAuth not yet implemented")) as any,
  getGoogleOAuthUrl: () =>
    Promise.reject(new Error("Google OAuth URL not yet implemented")) as any,

  logout: () => logout(),

  changePassword: (data: ChangePasswordInput) =>
    Promise.reject(new Error("Change password not yet implemented")) as any,

  getProfile: () => getProfile(),
  updateProfile: (
    data: Partial<Pick<User, "firstName" | "lastName" | "phone">>,
  ) =>
    updateProfile({
      firstName: data.firstName ?? undefined,
      lastName: data.lastName ?? undefined,
      phone: data.phone ?? undefined,
    }),
};

export { tokenStorage };
