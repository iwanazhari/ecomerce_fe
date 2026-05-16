'use client'

import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuthContext'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isSuperAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin && !isSuperAdmin) {
      router.push(ROUTES.HOME)
    }
  }, [isLoading, isAdmin, isSuperAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin && !isSuperAdmin) {
    return null
  }

  return <>{children}</>
}
