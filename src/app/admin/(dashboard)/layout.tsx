'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuthContext'
import { ROUTES } from '@/constants'
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Boxes, BarChart3, Truck, MapPin,
  LogOut, Menu, X, Store,
} from 'lucide-react'
import { Button } from '@/components/ui/neu/Button'

interface SidebarItem {
  label: string
  href: string
  icon: ReactNode
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: ROUTES.ADMIN, icon: <LayoutDashboard className="size-5" /> },
  { label: 'Produk', href: ROUTES.ADMIN_PRODUCTS, icon: <Package className="size-5" /> },
  { label: 'Pesanan', href: ROUTES.ADMIN_ORDERS, icon: <ShoppingCart className="size-5" /> },
  { label: 'Kategori', href: ROUTES.ADMIN_CATEGORIES, icon: <Tag className="size-5" /> },
  { label: 'Inventori', href: ROUTES.ADMIN_INVENTORY, icon: <Boxes className="size-5" /> },
  { label: 'Ekspedisi', href: ROUTES.ADMIN_EXPEDITIONS, icon: <Truck className="size-5" /> },
  { label: 'Provinsi', href: ROUTES.ADMIN_PROVINCES, icon: <MapPin className="size-5" /> },
  { label: 'Analitik', href: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="size-5" /> },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, isSuperAdmin, isLoading, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && !isLoading && !isAdmin && !isSuperAdmin) {
      router.replace('/admin/login')
    }
  }, [mounted, isLoading, isAdmin, isSuperAdmin, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin && !isSuperAdmin) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface shadow-extruded-lg transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <Link href={ROUTES.ADMIN} className="flex items-center gap-3">
            <div className="size-10 rounded-2xl shadow-inset-deep flex items-center justify-center">
              <Store className="size-5 text-primary" />
            </div>
            <div>
              <span className="text-base font-extrabold text-foreground tracking-tight">Waterpro</span>
              <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest">Admin</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden size-10 rounded-2xl shadow-inset-small flex items-center justify-center">
            <X className="size-4 text-foreground-muted" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            // Exact match, or sub-path for non-root items (e.g. /admin/products/sub-page)
            const isActive = item.href === ROUTES.ADMIN
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-extruded'
                    : 'text-foreground-muted hover:text-foreground hover:shadow-inset-small'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl shadow-inset-deep flex items-center justify-center text-primary font-extrabold text-sm">
                {user?.email?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.email}</p>
                <p className="text-[10px] text-foreground-muted font-bold uppercase">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                // logout
                window.location.href = '/'
              }}
              className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error transition-colors"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-surface shadow-extruded flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden size-12 rounded-2xl shadow-inset-small flex items-center justify-center">
            <Menu className="size-5 text-foreground-muted" />
          </button>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">
            {sidebarItems.find((i) =>
              i.href === ROUTES.ADMIN
                ? pathname === i.href
                : pathname === i.href || pathname?.startsWith(i.href + '/')
            )?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.HOME}>
              <Button variant="secondary" size="sm">
                <Store className="size-4" />
                Toko
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
