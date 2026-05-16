import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { config } from '@/config/env'
import { getOrCreateSessionId } from '@/utils/session'
import { tokenStorage } from '@/lib/medusa/token-storage'
import type { ApiResponse, ApiError } from '@/types'

// Re-export tokenStorage so existing imports don't break
export { tokenStorage }

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

// ============================================================
// Axios Instance
// ============================================================

const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// Request Interceptor — inject access token + session ID
// ============================================================

api.interceptors.request.use(
  (cfg: InternalAxiosRequestConfig) => {
    // If data is FormData, delete Content-Type to let browser set it with boundary
    if (cfg.data instanceof FormData) {
      delete cfg.headers['Content-Type'];
    }

    // Session ID — always sent for cart merge & guest cart support
    const sessionId = getOrCreateSessionId()
    if (sessionId && cfg.headers) {
      cfg.headers['X-Session-ID'] = sessionId
    }

    // Auth token — only if logged in
    const token = tokenStorage.getAccessToken()
    if (token && cfg.headers) {
      cfg.headers.Authorization = `Bearer ${token}`
    }
    return cfg
  },
  (error: AxiosError) => Promise.reject(error),
)

// ============================================================
// Response Interceptor — handle 401 with expiry check
// ============================================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 — check if token is actually expired before taking action
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const token = tokenStorage.getAccessToken()

      // No token → public/guest request, let it fail silently
      if (!token) {
        return Promise.reject(error)
      }

      // Token exists but got 401 — check if it's expired
      if (isTokenExpired(token)) {
        tokenStorage.clearTokens()
        // Only redirect if this is a browser navigation (not an API call from a background task)
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Token is not expired but got 401 — this could be:
      // 1. Admin token used on customer endpoint (expected, handled by useProfile)
      // 2. Temporary server issue
      // Don't clear tokens or redirect — let the caller handle it
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

// ============================================================
// Typed Request Helpers
// ============================================================

async function request<T>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any,
): Promise<ApiResponse<T>> {
  const { data: responseData } = await api.request<ApiResponse<T>>({
    method,
    url,
    data,
    params,
  })
  return responseData
}

export const apiClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <T>(url: string, params?: any) => request<T>('get', url, undefined, params),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T>(url: string, data?: any) => request<T>('post', url, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T>(url: string, data?: any) => request<T>('put', url, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T>(url: string, data?: any) => request<T>('patch', url, data),
  delete: <T>(url: string) => request<T>('delete', url),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMultipart: <T>(url: string, formData: FormData) => request<T>('post', url, formData),
  instance: api,
}

export default api
