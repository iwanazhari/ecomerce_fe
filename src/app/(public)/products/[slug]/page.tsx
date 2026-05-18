"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useProduct,
  useAddToCart,
  useWishlist,
  useAddToWishlist,
  useAuth,
} from "@/hooks";
import { useRecentlyViewed } from "@/hooks/useProducts";
import { useRecentlyViewedStore } from "@/store";
import { formatCurrency } from "@/utils";
import { ROUTES } from "@/constants";
import {
  Button,
  Badge,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { ImageGallery } from "@/components/product/ImageGallery";
import {
  ShoppingBag,
  Heart,
  ChevronRight,
  Minus,
  Plus,
  PackageCheck,
  ShieldCheck,
  Droplets,
} from "lucide-react";

function QuantitySelector({
  value,
  onChange,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface">
      <button
        type="button"
        className="flex size-9 items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-30 transition-colors"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Kurangi jumlah"
      >
        <Minus className="size-4" />
      </button>
      <span
        className="w-10 text-center text-sm font-semibold text-foreground"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className="flex size-9 items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-30 transition-colors"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Tambah jumlah"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function StockIndicator({ stock }: { stock?: number }) {
  if (stock === undefined || stock === null) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-success">
        <PackageCheck className="size-4" />
        Tersedia
      </p>
    );
  }
  if (stock <= 0) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-error">
        <PackageCheck className="size-4" />
        Stok Habis
      </p>
    );
  }
  if (stock <= 5) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-warning">
        <PackageCheck className="size-4" />
        Sisa {stock} — segera habis!
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-sm text-success">
      <PackageCheck className="size-4" />
      Stok Tersedia ({stock})
    </p>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { data: product, isLoading, error } = useProduct(slug!);
  const addToCart = useAddToCart();
  const { data: wishlist } = useWishlist(isAuthenticated);
  const addToWishlist = useAddToWishlist();
  const addProduct = useRecentlyViewedStore((s) => s.addProduct);
  const { data: recentlyViewed } = useRecentlyViewed(isAuthenticated);

  const [quantity, setQuantity] = useState(1);
  const selectedVariant = product?.variants?.[0];
  // Backend doesn't expose stock/inventory per variant, so we show generic availability
  const stock: number | undefined = undefined;

  // Check if product is in wishlist (only when authenticated)
  const isInWishlist =
    isAuthenticated &&
    wishlist?.items?.some((item) => item.productId === product?.id);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addProduct(product.id);
    }
  }, [product, addProduct]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">
          Produk tidak ditemukan
        </h1>
        <Link href={ROUTES.PRODUCTS}>
          <Button variant="primary" className="mt-4">
            Kembali ke Produk
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav
        className="mb-6 flex items-center gap-1 text-sm text-foreground-muted"
        aria-label="Breadcrumb"
      >
        <Link href={ROUTES.HOME} className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link href={ROUTES.PRODUCTS} className="hover:text-primary">
          Produk
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <ImageGallery
          images={product.images || []}
          productName={product.name}
          aspect="square"
          showThumbnails={true}
        />

        {/* Info */}
        <div>
          {product.brand && (
            <Badge variant="primary" className="mb-2">
              {product.brand}
            </Badge>
          )}
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-2 text-foreground-muted">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          {selectedVariant && (
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(selectedVariant.price)}
              </span>
              {selectedVariant.comparePrice &&
                selectedVariant.comparePrice > selectedVariant.price && (
                  <span className="text-lg text-foreground-subtle line-through">
                    {formatCurrency(selectedVariant.comparePrice)}
                  </span>
                )}
            </div>
          )}

          {/* Stock Indicator */}
          <div className="mt-3">
            <StockIndicator stock={stock} />
          </div>

          {/* Variant selector */}
          {product.variants.length > 1 && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Varian
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      v.id === selectedVariant?.id
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border text-foreground-muted hover:border-primary/50"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Jumlah</span>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={stock ?? 99}
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              isLoading={addToCart.isPending}
              disabled={!selectedVariant || (stock !== undefined && stock <= 0)}
              onClick={() => {
                if (selectedVariant) {
                  const variantId =
                    selectedVariant.id ||
                    `${product.id}-${selectedVariant.sku || "default"}`;
                  addToCart.mutate({
                    productId: product.id,
                    variantId,
                    quantity,
                    productTitle: product.name,
                    productSlug: product.slug,
                    productThumbnail:
                      product.thumbnail || product.images?.[0]?.url,
                    variantTitle: selectedVariant.name || selectedVariant.sku,
                    price: selectedVariant.price,
                  });
                  setQuantity(1);
                }
              }}
            >
              <ShoppingBag className="size-4" />
              Tambah ke Keranjang
            </Button>
            <Button
              variant="secondary"
              size="lg"
              isLoading={addToWishlist.isPending}
              onClick={() => {
                if (product) {
                  addToWishlist.mutate(product.id);
                }
              }}
            >
              <Heart
                className={`size-4 ${isInWishlist ? "fill-error text-error" : ""}`}
              />
            </Button>
          </div>

          {/* Feature badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-2 text-xs font-medium text-primary">
              <Droplets className="size-4" />
              Filter RO 5-Tahap
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-success-light px-3 py-2 text-xs font-medium text-success">
              <ShieldCheck className="size-4" />
              Garansi 2 Tahun
            </div>
          </div>

          {/* Tabs: Description / Specifications */}
          <Tabs defaultValue="description" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="description">Deskripsi</TabsTrigger>
              <TabsTrigger value="specs">Spesifikasi</TabsTrigger>
            </TabsList>
            <TabsContent
              value="description"
              className="text-sm text-foreground-muted leading-relaxed"
            >
              {product.description || "Belum ada deskripsi untuk produk ini."}
            </TabsContent>
            <TabsContent value="specs">
              <dl className="divide-y divide-border text-sm">
                <div className="flex py-2">
                  <dt className="w-1/3 font-medium text-foreground">Merk</dt>
                  <dd className="w-2/3 text-foreground-muted">
                    {product.brand || "-"}
                  </dd>
                </div>
                <div className="flex py-2">
                  <dt className="w-1/3 font-medium text-foreground">
                    Kategori
                  </dt>
                  <dd className="w-2/3 text-foreground-muted">
                    {product.categories?.[0]?.name || "-"}
                  </dd>
                </div>
                <div className="flex py-2">
                  <dt className="w-1/3 font-medium text-foreground">Berat</dt>
                  <dd className="w-2/3 text-foreground-muted">
                    {product.weight ? `${product.weight} kg` : "-"}
                  </dd>
                </div>
                <div className="flex py-2">
                  <dt className="w-1/3 font-medium text-foreground">
                    Tipe Filter
                  </dt>
                  <dd className="w-2/3 text-foreground-muted">
                    Reverse Osmosis (RO) 5-Tahap
                  </dd>
                </div>
                <div className="flex py-2">
                  <dt className="w-1/3 font-medium text-foreground">
                    Debit Air
                  </dt>
                  <dd className="w-2/3 text-foreground-muted">3 Liter/menit</dd>
                </div>
                <div className="flex py-2">
                  <dt className="w-1/3 font-medium text-foreground">Garansi</dt>
                  <dd className="w-2/3 text-foreground-muted">24 Bulan</dd>
                </div>
              </dl>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed?.length ? (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Baru Dilihat
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {recentlyViewed
              .filter((rv) => (rv as any).product?.id !== product.id)
              .slice(0, 5)
              .map((rv) => (
                <ProductCard key={rv.id} product={(rv as any).product} />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
