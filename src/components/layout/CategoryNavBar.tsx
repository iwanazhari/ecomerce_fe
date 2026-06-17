'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks'

export function CategoryNavBar() {
  const pathname = usePathname()
  const { data: categories } = useCategories()

  const items = categories ?? []

  return (
    <nav className="hidden lg:block border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-16 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          <Link
            href="/products"
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
              pathname === '/products'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground',
            )}
          >
            Semua
          </Link>
          {items.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                pathname === `/categories/${cat.slug}`
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground',
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
