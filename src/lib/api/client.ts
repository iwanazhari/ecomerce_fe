/**
 * API Client — direct HTTP client for the Express backend at localhost:4000.
 *
 * All API calls go through this client. It handles:
 * - Bearer token injection via Authorization header
 * - Session ID for guest cart support
 * - Response envelope parsing ({ success, data, message })
 * - Error normalization
 */

import { config } from "@/config/env";
import { getOrCreateSessionId } from "@/utils/session";
import type { ApiResponse } from "@/types";

// ─────────────────────────────────────────────
// Token Storage
// ─────────────────────────────────────────────

const ACCESS_TOKEN_KEY = "wp_access_token";
const REFRESH_TOKEN_KEY = "wp_refresh_token";

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─────────────────────────────────────────────
// Check if JWT token is expired
// ─────────────────────────────────────────────

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// ─────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────

interface RequestInitExtended extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const baseUrl = config.apiUrl.endsWith("/")
    ? config.apiUrl
    : `${config.apiUrl}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(cleanPath, baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorType = data?.type ?? "server_error";
    const message = data?.message ?? response.statusText ?? "Request failed";
    return {
      success: false,
      data: undefined as unknown as T,
      meta: { error: { code: errorType, message } },
    } as unknown as ApiResponse<T>;
  }

  // Backend format: { success: true, data: { ... }, message?: string }
  if (data?.success === true) {
    return {
      success: true,
      data: data.data as T,
    };
  }

  // Fallback: assume data is the payload directly
  return {
    success: true,
    data: (data ?? {}) as T,
  };
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>,
  contentType?: string,
): Promise<ApiResponse<T>> {
  const url = buildUrl(path, params);
  const token = tokenStorage.getAccessToken();
  const sessionId = getOrCreateSessionId();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (sessionId) {
    headers["X-Session-ID"] = sessionId;
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  } else if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = {
    method,
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, init);
    return parseResponse<T>(response);
  } catch (error: any) {
    return {
      success: false,
      data: undefined as unknown as T,
      meta: {
        error: {
          code: "network_error",
          message: error.message ?? "Network request failed",
        },
      },
    } as unknown as ApiResponse<T>;
  }
}

// ─────────────────────────────────────────────
// Typed helper methods
// ─────────────────────────────────────────────

export const api = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ) => apiRequest<T>("GET", path, undefined, params),

  post: <T>(path: string, body?: unknown) => apiRequest<T>("POST", path, body),

  put: <T>(path: string, body?: unknown) => apiRequest<T>("PUT", path, body),

  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>("PATCH", path, body),

  delete: <T>(path: string) => apiRequest<T>("DELETE", path),

  postMultipart: <T>(path: string, formData: FormData) =>
    apiRequest<T>("POST", path, formData, undefined, undefined),
};

// Check if current access token is expired
export function checkTokenExpired(): boolean {
  const token = tokenStorage.getAccessToken();
  if (!token) return true;
  return isTokenExpired(token);
}
