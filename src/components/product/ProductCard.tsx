import Link from "next/link"
import { memo } from "react"
import { ROUTES } from "@/constants"
import { formatCurrency, cn } from "@/utils"
import { Heart, Star } from "lucide-react"
import { ImageGallery } from "./ImageGallery"
import type { Product, ProductImage } from "@/types"

export const ProductCard = memo(function ProductCard({
  product,
  wishlistAction,
  isInWishlist = false,
  className,
}: {
  product: Product
  wishlistAction?: () => void
  isInWishlist?: boolean
  className?: string
}) {
  const firstVariant = product.variants?.[0]

  let displayImages: ProductImage[] = product.images || []

  if (displayImages.length === 0 && product.thumbnail) {
    displayImages = [
      {
        id: "thumbnail-fallback",
        url: product.thumbnail,
        alt: product.name,
        sortOrder: 0,
        isPrimary: true,
      },
    ]
  }

  const hasDiscount =
    firstVariant?.comparePrice &&
    firstVariant.comparePrice > firstVariant.price
  const discountPercent = hasDiscount
    ? Math.floor(
        (((firstVariant!.comparePrice! - firstVariant!.price) /
          firstVariant!.comparePrice!) *
          100) +
          0.5
      )
    : 0

  const rating = (product as any).rating ?? 0
  const reviewCount = (product as any).reviewCount ?? 0
  const soldCount = (product as any).soldCount ?? 0

  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-surface shadow-soft card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="relative">
        <ImageGallery
          images={displayImages}
          productName={product.name}
          aspect="square"
          showThumbnails={false}
        />

        {/* Discount badge */}
        {hasDiscount && discountPercent > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white shadow-lg z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist button */}
        {wishlistAction && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              wishlistAction()
            }}
            className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "size-3.5 transition-colors",
                isInWishlist
                  ? "fill-error text-error"
                  : "text-foreground-muted"
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="flex-1">
          {/* Rating & Sold */}
          <div className="flex items-center gap-1.5 mb-1">
            {rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-semibold text-foreground-muted">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            {soldCount > 0 && (
              <span className="text-[10px] text-foreground-subtle">
                | Terjual {soldCount}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="pt-1.5">
          {firstVariant ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-foreground">
                {formatCurrency(firstVariant.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-foreground-subtle line-through">
                  {formatCurrency(firstVariant.comparePrice!)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-foreground-muted">
              Harga tidak tersedia
            </span>
          )}
        </div>
      </div>
    </Link>
  )
})
