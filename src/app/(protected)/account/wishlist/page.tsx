'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useWishlist, useRemoveFromWishlist } from '@/hooks'
import { ROUTES } from '@/constants'
import { formatCurrency, getImageUrl } from '@/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Heart, Trash2 } from 'lucide-react'

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  if (!wishlist?.items?.length) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Wishlist</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="mb-4 size-12 text-foreground-subtle" />
          <p className="text-lg font-bold text-foreground-muted">Wishlist kosong</p>
          <Link href={ROUTES.PRODUCTS} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-violet-600">
            Jelajahi Produk &rarr;
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Wishlist ({wishlist.items.length})</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-surface shadow-soft transition-all hover:shadow-hover">
            <Link href={ROUTES.PRODUCT(item.product.slug)}>
              <div className="relative aspect-square overflow-hidden bg-background">
                {item.product.images?.[0] ? (
                  <Image
                    src={getImageUrl(item.product.images[0].url)}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-4xl text-foreground-subtle">
                    {item.product.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-foreground">{item.product.name}</h3>
                {item.product.variants?.[0] && (
                  <p className="mt-1 text-base font-extrabold text-indigo-600">
                    {formatCurrency(item.product.variants[0].price)}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={() => removeFromWishlist.mutate(item.productId)}
              className="absolute right-2 top-2 rounded-full bg-surface/90 p-2 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-surface"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="size-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
