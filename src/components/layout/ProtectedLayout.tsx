'use client'

import { useEffect } from 'react'
import { Header, Footer } from '@/components/layout'
import { CartDrawer } from '@/components/cart'
import SearchModal from '@/components/search/SearchModal'
import { Toast } from '@/components/ui'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/constants'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Package, MapPin, Heart, Star, Bell, Settings, LogOut, Shield } from 'lucide-react'

const navItems = [
  { href: ROUTES.ACCOUNT_ORDERS, label: 'Pesanan', icon: Package },
  { href: ROUTES.ACCOUNT_ADDRESSES, label: 'Alamat', icon: MapPin },
  { href: ROUTES.ACCOUNT_WISHLIST, label: 'Wishlist', icon: Heart },
  { href: ROUTES.ACCOUNT_LOYALTY, label: 'Loyalty', icon: Star },
  { href: ROUTES.ACCOUNT_NOTIFICATIONS, label: 'Notifikasi', icon: Bell },
  { href: ROUTES.ACCOUNT_SETTINGS, label: 'Pengaturan', icon: Settings },
]

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, isSuperAdmin, isLoading } = useAuth()
  const showAdminLink = isAdmin || isSuperAdmin

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname || window.location.pathname)}`
      router.push(loginUrl)
    }
  }, [isLoading, user, router, pathname])

  // Show loading spinner while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar — desktop */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1" aria-label="Account navigation">
            <div className="mb-4 px-3">
              <p className="text-sm font-semibold text-foreground">{user.firstName || 'Akun Saya'}</p>
              <p className="text-xs text-foreground-muted">{user.email}</p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}

            {/* Admin Dashboard Link (only for ADMIN & SUPER_ADMIN) */}
            {showAdminLink && (
              <>
                <div className="my-4 border-t border-border" />
                <Link
                  href={ROUTES.ADMIN}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname?.startsWith('/admin')
                      ? 'bg-secondary text-white'
                      : 'text-secondary hover:bg-secondary-light hover:text-secondary',
                  )}
                >
                  <Shield className="size-4" />
                  Admin Dashboard
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <Toast />
    </div>
  )
}
