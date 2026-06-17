'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuthContext'
import { usePermission } from '@/hooks/usePermission'
import { ROUTES } from '@/constants'
import { tokenStorage } from '@/services/api/client'
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Boxes, BarChart3, Truck, MapPin,
  LogOut, Menu, X, Store, Users, ChevronLeft, ChevronRight, Layout,
} from 'lucide-react'

interface SidebarItem {
  label: string
  href: string
  icon: ReactNode
  permission?: string
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, isSuperAdmin, isLoading, user } = useAuth()
  const { can } = usePermission()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && !isLoading && !isAdmin && !isSuperAdmin) {
      router.replace('/admin/login')
    }
  }, [mounted, isLoading, isAdmin, isSuperAdmin, router])

  const sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', href: ROUTES.ADMIN, icon: <LayoutDashboard className="size-5" /> },
    { label: 'Produk', href: ROUTES.ADMIN_PRODUCTS, icon: <Package className="size-5" />, permission: 'products:read' },
    { label: 'Pesanan', href: ROUTES.ADMIN_ORDERS, icon: <ShoppingCart className="size-5" />, permission: 'orders:read' },
    { label: 'Kategori', href: ROUTES.ADMIN_CATEGORIES, icon: <Tag className="size-5" />, permission: 'categories:read' },
    { label: 'Inventori', href: ROUTES.ADMIN_INVENTORY, icon: <Boxes className="size-5" />, permission: 'inventory:read' },
    { label: 'Ekspedisi', href: ROUTES.ADMIN_EXPEDITIONS, icon: <Truck className="size-5" />, permission: 'expeditions:read' },
    { label: 'Provinsi', href: ROUTES.ADMIN_PROVINCES, icon: <MapPin className="size-5" />, permission: 'provinces:read' },
    { label: 'Analitik', href: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="size-5" />, permission: 'analytics:read' },
    { label: 'CMS', href: ROUTES.ADMIN_CMS, icon: <Layout className="size-5" />, permission: 'cms:read' },
    { label: 'Pengguna', href: ROUTES.ADMIN_USERS, icon: <Users className="size-5" />, permission: 'users:read' },
  ]

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-60'

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
      <aside className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-surface shadow-extruded-lg flex flex-col transform transition-all duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo + collapse toggle */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-border shrink-0">
          {sidebarCollapsed ? (
            <div className="w-full flex justify-center">
              <Store className="size-6 text-primary" />
            </div>
          ) : (
            <>
              <Link href={ROUTES.ADMIN} className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-2xl shadow-inset-deep flex items-center justify-center shrink-0">
                  <Store className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-base font-extrabold text-foreground tracking-tight">Waterpro</span>
                  <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest">Admin</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden size-8 rounded-xl shadow-inset-small flex items-center justify-center">
                <X className="size-4 text-foreground-muted" />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center w-full py-2 text-foreground-muted hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* Nav */}
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {sidebarItems
            .filter((item) => {
              if (isSuperAdmin) return true
              if (!item.permission) return true
              return can(item.permission as any)
            })
            .map((item) => {
              const isActive = item.href === ROUTES.ADMIN
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-extruded'
                      : 'text-foreground-muted hover:text-foreground hover:shadow-inset-small'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && item.label}
                </Link>
              )
            })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-border shrink-0 mt-auto ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {sidebarCollapsed ? (
              <button
                onClick={() => {
                  tokenStorage.clearTokens()
                  document.cookie = 'wp_access_token=; path=/; max-age=0'
                  window.dispatchEvent(new Event('auth:token-changed'))
                  router.push('/admin/login')
                }}
                className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error transition-colors"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-2xl shadow-inset-deep flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
                    {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user?.email}</p>
                    <p className="text-[10px] text-foreground-muted font-bold uppercase">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    tokenStorage.clearTokens()
                    document.cookie = 'wp_access_token=; path=/; max-age=0'
                    window.dispatchEvent(new Event('auth:token-changed'))
                    router.push('/admin/login')
                  }}
                  className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error transition-colors shrink-0"
                  aria-label="Logout"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Header */}
        <header className="h-20 bg-surface shadow-extruded flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden size-12 rounded-2xl shadow-inset-small flex items-center justify-center">
              <Menu className="size-5 text-foreground-muted" />
            </button>
            {sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex size-10 rounded-2xl shadow-inset-small items-center justify-center text-foreground-muted hover:text-foreground">
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">
            {sidebarItems.find((i) =>
              i.href === ROUTES.ADMIN
                ? pathname === i.href
                : pathname === i.href || pathname?.startsWith(i.href + '/')
            )?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.HOME}>
              <button className="px-4 py-2 rounded-2xl shadow-inset-small text-sm font-bold text-foreground-muted hover:text-foreground transition-colors">
                <Store className="size-4 inline mr-1.5" />
                Toko
              </button>
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
