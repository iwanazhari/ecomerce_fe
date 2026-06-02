import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that should redirect to home when already authenticated
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.has('access_token') || request.cookies.has('wp_access_token')

  // Redirect /admin/orders/:id to /admin/orders (detail handled via modal)
  if (pathname.startsWith('/admin/orders/') && pathname !== '/admin/orders') {
    return NextResponse.redirect(new URL('/admin/orders', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (hasToken && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Note: Protected path redirects (/account, /admin, /checkout, /payment) are handled
  // client-side in ProtectedLayout and individual page components, since middleware
  // cannot read localStorage where tokens are actually stored.

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/forgot-password', '/reset-password', '/admin/orders/:id'],
}
