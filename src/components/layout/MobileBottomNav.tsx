'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants'
import { Package, House, User } from 'lucide-react'

const tabs = [
  { href: ROUTES.ACCOUNT_ORDERS, label: 'Pesanan', icon: Package },
  { href: ROUTES.HOME, label: 'Beranda', icon: House },
  { href: ROUTES.ACCOUNT, label: 'Akun', icon: User },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div className="relative bg-background/70 backdrop-blur-2xl border-t border-white/20 dark:border-white/10">
        <div className="flex items-center justify-around h-16 pb-safe">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== ROUTES.HOME && pathname.startsWith(tab.href))
            const isCenter = tab.href === ROUTES.HOME

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative flex flex-col items-center justify-center transition-all duration-300',
                  isCenter ? '-mt-3' : 'pt-1',
                  isCenter ? 'w-16 h-16' : 'flex-1',
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isCenter ? (
                  <div
                    className={cn(
                      'flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 scale-110'
                        : 'bg-surface shadow-soft',
                    )}
                  >
                    <House
                      className={cn(
                        'size-5 transition-all duration-300',
                        isActive ? 'text-white' : 'text-foreground-subtle',
                      )}
                    />
                  </div>
                ) : (
                  <>
                    <tab.icon
                      className={cn(
                        'size-5 transition-all duration-200',
                        isActive ? 'text-primary scale-110' : 'text-foreground-subtle',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[11px] font-semibold mt-0.5 transition-all duration-200',
                        isActive ? 'text-primary' : 'text-foreground-subtle',
                      )}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </Link>
            )
          })}
        </div>

        {/* Animated pill indicator */}
        <div
          className="absolute top-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: '40px',
            left: (() => {
              if (pathname === ROUTES.HOME) return '50%'
              if (pathname.startsWith(ROUTES.ACCOUNT_ORDERS) || pathname.startsWith('/account/orders')) return 'calc(16.67%)'
              if (pathname === ROUTES.ACCOUNT || pathname.startsWith('/account/')) return 'calc(83.33%)'
              return '50%'
            })(),
            transform: 'translateX(-50%)',
            opacity: pathname === ROUTES.HOME || pathname === ROUTES.ACCOUNT || pathname.startsWith(ROUTES.ACCOUNT_ORDERS) ? 1 : 0,
          }}
        />
      </div>
    </nav>
  )
}
