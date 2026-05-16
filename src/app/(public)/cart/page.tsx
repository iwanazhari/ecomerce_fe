'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks'
import { ROUTES } from '@/constants'
import { formatCurrency, getImageUrl } from '@/utils'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { data: cart, isLoading } = useCart()
  const removeItem = useRemoveCartItem()
  const updateItem = useUpdateCartItem()

  // Guard against stale cached cart items without product data
  const validItems = cart?.items?.filter((item) => item?.product) ?? []

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border/60 bg-surface p-4 shadow-soft">
              <Skeleton className="size-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!validItems.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto mb-4 size-16 text-foreground-subtle" />
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Keranjang Kosong</h1>
        <p className="mt-2 text-foreground-muted">Mulai belanja sekarang!</p>
        <Link href={ROUTES.PRODUCTS}>
          <Button variant="primary" className="mt-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-button">
            <ArrowLeft className="mr-2 size-4" />
            Mulai Belanja
          </Button>
        </Link>
      </div>
    )
  }

  const subtotal = cart?.subtotal ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Keranjang <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">({validItems.length})</span>
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {validItems.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-border/60 bg-surface p-4 shadow-soft card-hover">
              <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-lg border border-border/60 bg-background">
                {item.product.images?.[0] ? (
                  <Image
                    src={getImageUrl(item.product.images[0].url)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-foreground-subtle">
                    {item.product.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={ROUTES.PRODUCT(item.product.slug)}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {item.product.name}
                </Link>
                {item.variant && (
                  <p className="text-sm text-foreground-muted">{item.variant.name}</p>
                )}
                <span className="mt-1 font-bold text-foreground">
                  {formatCurrency(item.price)}
                </span>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateItem.mutate({ itemId: item.id, data: { quantity: item.quantity - 1 } })}
                      className="flex size-7 items-center justify-center rounded-md border border-border/60 hover:bg-surface-hover"
                      aria-label="Decrease"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItem.mutate({ itemId: item.id, data: { quantity: item.quantity + 1 } })}
                      className="flex size-7 items-center justify-center rounded-md border border-border/60 hover:bg-surface-hover"
                      aria-label="Increase"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    className="rounded-lg p-1.5 text-error hover:bg-error-light"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border/60 bg-surface p-4 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">Ringkasan</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-foreground-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>Ongkos Kirim</span>
                <span>Dihitung saat checkout</span>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Link href={ROUTES.CHECKOUT}>
              <Button variant="primary" fullWidth size="lg" className="mt-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-button">
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
