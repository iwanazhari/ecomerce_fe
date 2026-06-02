import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that should redirect to home when already authenticated
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/admin/login']

/**
 * Decode JWT payload without verifying signature.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

/**
 * Get auth token from request cookies.
 */
function getToken(request: NextRequest): string | null {
  return (
    request.cookies.get('wp_access_token')?.value ??
    request.cookies.get('access_token')?.value ??
    null
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = getToken(request)

  // Redirect authenticated users away from auth pages
  if (token && authPaths.some((p) => pathname.startsWith(p))) {
    // For admin login, redirect admins to dashboard
    if (pathname.startsWith('/admin/login')) {
      const payload = decodeJwtPayload(token)
      if (payload) {
        const role = payload.role as string | undefined
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/admin/login',
  ],
}
