'use client'

import { useAuth } from '@/hooks/useAuthContext'
import type { Permission, UserRole } from '@/types'
import { hasPermission, hasAnyPermission } from '@/types'

/**
 * Hook for checking permissions in components.
 * Returns helper functions to check if the current user has specific permissions.
 *
 * @example
 * const { can, canAny, role } = usePermission()
 * if (can('products:delete')) { ... }
 * if (canAny(['users:update', 'users:updateRole'])) { ... }
 */
export function usePermission() {
  const { role, can, canAny } = useAuth()

  return {
    role,
    can,
    canAny,
    /** Check if role matches one of the given roles */
    isAtLeast: (...roles: UserRole[]) => {
      if (!role) return false
      return roles.includes(role)
    },
  }
}

/**
 * Utility to check permissions for a given role (without hook).
 * Useful in non-component code or for static checks.
 */
export { hasPermission, hasAnyPermission }
