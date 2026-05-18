import Link from "next/link";
import { memo } from "react";
import { ROUTES } from "@/constants";
import { formatCurrency, cn } from "@/utils";
import { Heart } from "lucide-react";
import { ImageGallery } from "./ImageGallery";
import type { Product, ProductImage } from "@/types";

export const ProductCard = memo(function ProductCard({
  product,
  wishlistAction,
  isInWishlist = false,
  className,
}: {
  product: Product;
  wishlistAction?: () => void;
  isInWishlist?: boolean;
  className?: string;
}) {
  const firstVariant = product.variants?.[0];

  // Safety fallback: Medusa list API often returns 'thumbnail' but omits 'images' array.
  // We construct a fake images array from thumbnail so ImageGallery works correctly.
  let displayImages: ProductImage[] = product.images || [];

  if (displayImages.length === 0 && product.thumbnail) {
    displayImages = [
      {
        id: "thumbnail-fallback",
        url: product.thumbnail,
        alt: product.name,
        sortOrder: 0,
        isPrimary: true,
      },
    ];
  }

  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-surface shadow-soft card-hover",
        className,
      )}
    >
      {/* Image Gallery */}
      <div className="relative">
        <ImageGallery
          images={displayImages}
          productName={product.name}
          aspect="square"
          showThumbnails={false}
        />

        {/* Wishlist button */}
        {wishlistAction && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              wishlistAction();
            }}
            className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface"
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isInWishlist
                  ? "fill-error text-error"
                  : "text-foreground-muted",
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-1 text-xs text-foreground-muted">
              {product.shortDescription}
            </p>
          )}
        </div>
        <div className="pt-2">
          {firstVariant ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">
                {formatCurrency(firstVariant.price)}
              </span>
              {firstVariant.comparePrice &&
                firstVariant.comparePrice > firstVariant.price && (
                  <span className="text-xs text-foreground-subtle line-through">
                    {formatCurrency(firstVariant.comparePrice)}
                  </span>
                )}
            </div>
          ) : (
            <span className="text-sm text-foreground-muted">
              Harga tidak tersedia
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});
