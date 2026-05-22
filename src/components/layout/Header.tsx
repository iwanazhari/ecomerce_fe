'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store'
import { useAuth, useCart, useUnreadCount } from '@/hooks'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShoppingBag, User, Heart, Bell, Menu, X, Search, ChevronRight, Truck, Tag } from 'lucide-react'

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  const navLinks = [
    { href: ROUTES.PRODUCTS, label: 'Produk' },
    { href: ROUTES.FEATURES, label: 'Fitur' },
    { href: ROUTES.REVIEWS, label: 'Ulasan' },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href={ROUTES.HOME} onClick={onClose} className="flex-shrink-0">
            <img src="/logo.png" alt="Waterpro" className="h-7 w-auto" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-foreground-muted hover:bg-surface-hover"
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-4 py-3" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-primary-light text-primary'
                  : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground',
              )}
            >
              {link.label}
              <ChevronRight className="size-4" />
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <Link
                href={ROUTES.ACCOUNT}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover"
              >
                <User className="size-4" />
                {user?.firstName ?? user?.email}
              </Link>
              <Link
                href={ROUTES.ACCOUNT_ORDERS}
                onClick={onClose}
                className="block text-sm text-foreground-muted hover:text-foreground"
              >
                Pesanan Saya
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href={ROUTES.LOGIN} onClick={onClose}>
                <Button variant="primary" fullWidth size="md">
                  Masuk
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER} onClick={onClose}>
                <Button variant="outline" fullWidth size="md">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function Header() {
  const pathname = usePathname()
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen)
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
  const openCartDrawer = useUIStore((s) => s.openCartDrawer)
  const openSearch = useUIStore((s) => s.openSearch)
  const { isAuthenticated, user } = useAuth()
  const { data: cart } = useCart()
  const { data: unreadCount } = useUnreadCount({ enabled: isAuthenticated })

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const navLinks = [
    { href: ROUTES.PRODUCTS, label: 'Produk' },
    { href: ROUTES.FEATURES, label: 'Fitur' },
    { href: ROUTES.REVIEWS, label: 'Ulasan' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className="relative z-50 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-xs font-medium sm:text-sm">
          <Truck className="size-3.5 sm:size-4" />
          <span>Gratis ongkir untuk semua pesanan!</span>
          <span className="hidden sm:inline mx-1 text-white/60">|</span>
          <Tag className="size-3.5 sm:size-4" />
          <span>Garansi 2 tahun seluruh produk</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden rounded-full p-2 text-foreground-muted hover:bg-surface-hover transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex-shrink-0">
              <img src="/logo.png" alt="Waterpro" className="h-8 w-auto" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex lg:items-center lg:gap-8 lg:ml-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-sm font-semibold transition-colors hover:text-foreground',
                    pathname === link.href
                      ? 'text-foreground'
                      : 'text-foreground-muted',
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={openSearch}
                className="rounded-full p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                aria-label="Cari produk"
              >
                <Search className="size-4" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    href={ROUTES.ACCOUNT_WISHLIST}
                    className="rounded-full p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart className="size-4" />
                  </Link>

                  <Link
                    href={ROUTES.ACCOUNT_NOTIFICATIONS}
                    className="relative rounded-full p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                    aria-label="Notifikasi"
                  >
                    <Bell className="size-4" />
                    {(unreadCount?.count ?? 0) > 0 && (
                      <Badge className="absolute right-1 top-1 min-w-4 h-4 px-1 text-[9px] leading-none bg-error text-white">
                        {unreadCount!.count > 9 ? '9+' : unreadCount!.count}
                      </Badge>
                    )}
                  </Link>
                </>
              ) : null}

              <button
                onClick={openCartDrawer}
                className="relative rounded-full p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                aria-label={`Keranjang, ${cartItemCount} item`}
              >
                <ShoppingBag className="size-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 text-[9px] leading-none bg-primary text-white">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </button>

              {isAuthenticated ? (
                <Link
                  href={ROUTES.ACCOUNT}
                  className="ml-1 flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  <User className="size-4" />
                  <span className="hidden sm:inline truncate max-w-20">{user?.firstName || 'Akun'}</span>
                </Link>
              ) : (
                <Link href={ROUTES.LOGIN} className="ml-1">
                  <Button variant="primary" size="sm">
                    Masuk
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </>
  )
}
