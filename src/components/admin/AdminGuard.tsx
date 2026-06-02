'use client'

import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuthContext'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants'
import type { Permission } from '@/types'

interface AdminGuardProps {
  children: ReactNode
  /** Minimum required permissions (user must have ALL of these) */
  requirePermissions?: Permission[]
  /** Fallback redirect when not authorized (default: admin login) */
  redirectTo?: string
}

/**
 * Admin access guard with optional granular permission checks.
 *
 * Basic usage (any admin role):
 *   <AdminGuard><OrdersPage /></AdminGuard>
 *
 * With permission check:
 *   <AdminGuard requirePermissions={['products:delete']}>
 *     <DeleteButton />
 *   </AdminGuard>
 */
export function AdminGuard({
  children,
  requirePermissions,
  redirectTo = ROUTES.ADMIN_LOGIN,
}: AdminGuardProps) {
  const { isAdmin, isSuperAdmin, isLoading, can } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAdmin && !isSuperAdmin) {
      router.push(redirectTo)
      return
    }
    // Check granular permissions if specified
    if (requirePermissions && requirePermissions.length > 0) {
      const hasAllRequired = requirePermissions.every((p) => can(p))
      if (!hasAllRequired) {
        router.push(ROUTES.ADMIN)
      }
    }
  }, [isLoading, isAdmin, isSuperAdmin, requirePermissions, can, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin && !isSuperAdmin) {
    return null
  }

  // Check granular permissions
  if (requirePermissions && requirePermissions.length > 0) {
    const hasAllRequired = requirePermissions.every((p) => can(p))
    if (!hasAllRequired) return null
  }

  return <>{children}</>
}

/**
 * Higher-order component for conditionally rendering UI based on permission.
 * Unlike AdminGuard, this does NOT redirect — it simply hides children.
 *
 * @example
 * <RequirePermission permission="products:delete">
 *   <button>Delete Product</button>
 * </RequirePermission>
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) return <>{fallback}</>
  return <>{children}</>
}

/**
 * Check multiple permissions (ANY match).
 */
export function RequireAnyPermission({
  permissions,
  children,
  fallback = null,
}: {
  permissions: Permission[]
  children: ReactNode
  fallback?: ReactNode
}) {
  const { canAny } = useAuth()
  if (!canAny(permissions)) return <>{fallback}</>
  return <>{children}</>
}
