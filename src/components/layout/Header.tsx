'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store'
import { useAuth, useCart, useUnreadCount } from '@/hooks'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SearchBar } from './SearchBar'
import { ShoppingBag, User, Heart, Bell } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const openCartDrawer = useUIStore((s) => s.openCartDrawer)
  const { isAuthenticated, user } = useAuth()
  const { data: cart } = useCart()
  const { data: unreadCount } = useUnreadCount({ enabled: isAuthenticated })

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4">
          {/* Logo — hidden on mobile when search is present */}
          <Link href={ROUTES.HOME} className="flex-shrink-0">
            <img src="/images/logo.png" alt="Waterpro" className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Search Bar — centered, prominent */}
          <SearchBar />

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              {[
                { href: ROUTES.PRODUCTS, label: 'Produk' },
                { href: ROUTES.FEATURES, label: 'Fitur' },
                { href: ROUTES.REVIEWS, label: 'Ulasan' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-light text-primary'
                      : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Wishlist */}
            <Link
              href={ROUTES.ACCOUNT_WISHLIST}
              className="rounded-full p-2 sm:p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="size-4 sm:size-5" />
            </Link>

            {/* Notification (mobile only) */}
            {isAuthenticated && (
              <Link
                href={ROUTES.ACCOUNT_NOTIFICATIONS}
                className="relative rounded-full p-2 sm:p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors lg:hidden"
                aria-label="Notifikasi"
              >
                <Bell className="size-4 sm:size-5" />
                {(unreadCount?.count ?? 0) > 0 && (
                  <Badge className="absolute right-0.5 top-0.5 min-w-4 h-4 px-1 text-[9px] leading-none bg-error text-white">
                    {unreadCount!.count > 9 ? '9+' : unreadCount!.count}
                  </Badge>
                )}
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openCartDrawer}
              className="relative rounded-full p-2 sm:p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
              aria-label={`Keranjang, ${cartItemCount} item`}
            >
              <ShoppingBag className="size-4 sm:size-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 text-[9px] leading-none bg-primary text-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <Link
                href={ROUTES.ACCOUNT}
                className="flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1.5 text-xs sm:text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors ml-1"
              >
                <User className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline truncate max-w-20">
                  {user?.firstName || 'Akun'}
                </span>
              </Link>
            ) : (
              <Link href={ROUTES.LOGIN} className="ml-1">
                <Button variant="primary" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                  Masuk
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
