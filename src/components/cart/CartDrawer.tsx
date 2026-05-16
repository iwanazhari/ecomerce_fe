'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUIStore } from '@/store'
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks'
import { ROUTES } from '@/constants'
import { formatCurrency, cn } from '@/utils'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartDrawerOpen)
  const closeCartDrawer = useUIStore((s) => s.closeCartDrawer)
  const { data: cart, isLoading, refetch } = useCart()
  const removeItem = useRemoveCartItem()
  const updateItem = useUpdateCartItem()

  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem.mutate(itemId)
      } else {
        updateItem.mutate({ itemId, data: { quantity } })
      }
    },
    [removeItem, updateItem],
  )

  const subtotal = cart?.subtotal ?? 0

  // Guard against stale cached cart items without product data
  const validItems = cart?.items?.filter((item) => item?.product) ?? []

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={closeCartDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-surface shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold text-foreground">Keranjang</h2>
            <button
              onClick={closeCartDrawer}
              className="rounded-lg p-2 text-foreground-muted hover:bg-surface-hover"
              aria-label="Close cart"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !validItems.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBag className="mb-4 size-12 text-foreground-subtle" />
                <p className="text-sm text-foreground-muted">Keranjang kosong</p>
                <Link href={ROUTES.PRODUCTS} onClick={closeCartDrawer}>
                  <Button variant="primary" size="sm" className="mt-4">
                    Mulai Belanja
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {validItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-foreground-subtle text-xs">
                          {item.product.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={ROUTES.PRODUCT(item.product.slug)}
                          onClick={closeCartDrawer}
                          className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-foreground-muted">
                            {item.variant.name}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="flex size-7 items-center justify-center rounded-md border border-border hover:bg-surface-hover"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="flex size-7 items-center justify-center rounded-md border border-border hover:bg-surface-hover"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {validItems.length ? (
            <div className="border-t border-border px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Subtotal</span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <Link href={ROUTES.CHECKOUT} onClick={closeCartDrawer}>
                <Button variant="primary" fullWidth size="lg">
                  Checkout
                </Button>
              </Link>
              <button
                onClick={closeCartDrawer}
                className="mt-2 w-full text-center text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                Lanjut Belanja
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
