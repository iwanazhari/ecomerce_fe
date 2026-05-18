"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { useProducts, useAddToCart } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ImageGallery } from "@/components/product/ImageGallery";
import { formatCurrency, getImageUrl } from "@/utils";
import {
  Star,
  Droplets,
  Shield,
  Truck,
  Zap,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
  ShieldCheck,
  Leaf,
  Thermometer,
  Award,
  ShoppingCart,
  Sparkles,
  Search,
  ArrowUpRight,
  ShowerHead,
  Baby,
  Briefcase,
  Waves,
} from "lucide-react";
import type { Product } from "@/types";

// Review data
const heroReviews = [
  { avatar: "👤", name: "Sarah" },
  { avatar: "👤", name: "Ahmad" },
  { avatar: "👤", name: "Dewi" },
];

const brandLogos = ["TUV Certified", "SNI Standard", "ISO 9001"];

const featureStats = [
  {
    value: "5",
    unit: "Stage",
    label: "Filtrasi",
    description: "Sistem filtrasi 5 tahap untuk air paling bersih.",
  },
  {
    value: "99.9",
    unit: "%",
    label: "Bakteri Terhilangkan",
    description: "Menghilangkan bakteri dan kontaminan berbahaya.",
  },
  {
    value: "24",
    unit: "Bulan",
    label: "Garansi",
    description: "Garansi resmi 2 tahun untuk semua komponen.",
  },
  {
    value: "3",
    unit: "L/menit",
    label: "Debit Air",
    description: "Debit air besar tanpa tekanan pompa tambahan.",
  },
];

const testimonial1 = {
  text: "Kualitas air luar biasa untuk filter sekecil ini! Bass-nya... eh, rasa airnya segar dan bersih. Sangat cocok untuk keluarga kami.",
  author: "Budi Santoso",
  date: "12 Mei 2026",
};

const trustBadges = [
  { icon: Check, label: "Stok Tersedia" },
  { icon: Truck, label: "Gratis Ongkir" },
  { icon: ShieldCheck, label: "Garansi 2 Tahun" },
  { icon: Clock, label: "Pengiriman 1-3 Hari" },
];

const whyChooseFeatures = [
  {
    title: "Filtrasi 5 Tahap Canggih",
    description:
      "Sistem filtrasi berlapis menghilangkan klorin, bakteri, logam berat, dan partikel mikro untuk air yang benar-benar bersih dan aman.",
    icon: Filter,
    features: [
      "Pre-Filter Sedimen",
      "Carbon Block",
      "UF Membrane",
      "Post-Carbon",
      "Mineral Stage",
    ],
  },
  {
    title: "Kualitas Air Terjamin",
    description:
      "Air hasil filtrasi memenuhi standar WHO dan SNI. Setiap batch produk diuji di laboratorium terakreditasi.",
    icon: ShieldCheck,
    features: [
      "Standar WHO",
      "Sertifikasi SNI",
      "Uji Lab Terakreditasi",
      "Laporan Kualitas",
    ],
  },
  {
    title: "Hemat & Ramah Lingkungan",
    description:
      "Tidak butuh listrik, tidak menghasilkan limbah plastik. Investasi jangka panjang untuk kesehatan keluarga dan bumi.",
    icon: Leaf,
    features: [
      "Tanpa Listrik",
      "Zero Waste",
      "Hemat Biaya",
      "Ramah Lingkungan",
    ],
  },
];

const customerReviews = [
  {
    stars: 5,
    date: "10 Mei 2026",
    text: "Air dari filter ini benar-benar jernih dan segar. Anak-anak jadi suka minum air putih!",
    author: "Sarah Wulandari",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    stars: 5,
    date: "8 Mei 2026",
    text: "Pemasangan mudah, hasilnya langsung terasa. Air keran jadi layak minum.",
    author: "Ahmad Fauzi",
    avatar: "https://i.pravatar.cc/150?u=ahmad",
  },
  {
    stars: 4,
    date: "5 Mei 2026",
    text: "Kualitas bagus, harga sebanding. Garansi 2 tahun bikin tenang.",
    author: "Dewi Lestari",
    avatar: "https://i.pravatar.cc/150?u=dewi",
  },
  {
    stars: 5,
    date: "1 Mei 2026",
    text: "Sudah 6 bulan pakai, tidak pernah kecewa. Filter ganti juga gampang.",
    author: "Rizky Pratama",
    avatar: "https://i.pravatar.cc/150?u=rizky",
  },
];

const howToSteps = [
  {
    step: "01",
    title: "Pesan Filter Anda",
    description:
      "Pilih produk Waterpro dan checkout dengan mudah melalui website kami.",
  },
  {
    step: "02",
    title: "Pasang di Keran",
    description:
      "Pasang filter di keran dapur Anda dalam hitungan menit tanpa alat khusus.",
  },
  {
    step: "03",
    title: "Alirkan Air Bersih",
    description:
      "Buka keran dan nikmati air bersih langsung dari filter Waterpro.",
  },
  {
    step: "04",
    title: "Nikmati Setiap Tetes",
    description:
      "Air bersih, segar, dan aman untuk minum langsung seluruh keluarga.",
  },
];

const blogPosts = [
  {
    title: "Panduan Lengkap Memilih Filter Air untuk Rumah",
    date: "6 Des 2024",
  },
  {
    title: "5 Fitur Penting yang Harus Ada di Filter Air",
    date: "4 Des 2024",
  },
  {
    title: "Cara Memilih Filter Air Terbaik Sesuai Budget",
    date: "6 Des 2024",
  },
  {
    title: "Cara Merawat Filter Air Agar Awet dan Efektif",
    date: "4 Des 2024",
  },
  {
    title: "Filter Air untuk Setiap Budget: Apa yang Harus Diharapkan",
    date: "4 Des 2024",
  },
  {
    title: "Tempat Terbaik Menggunakan Filter Air di Rumah",
    date: "4 Des 2024",
  },
];

const useCases = [
  { title: "Dapur", description: "Air bersih untuk memasak dan minum" },
  { title: "Minum Langsung", description: "Tanpa perlu merebus air lagi" },
  { title: "Bayi & Anak", description: "Aman untuk MPASI dan susu formula" },
  { title: "Kantor", description: "Solusi air bersih di tempat kerja" },
];

const categoryItems = [
  { name: "Filter Air Praktis", icon: ShowerHead, slug: "filter-air-praktis" },
  { name: "Filter Air Dapur", icon: Shield, slug: "filter-air-dapur" },
  { name: "Filter Air PVDF", icon: Droplets, slug: "filter-air-pvdf" },
  {
    name: "Filter Pleated Membran",
    icon: Filter,
    slug: "filter-pleated-membran",
  },
  { name: "Filter Air Minum", icon: Droplets, slug: "filter-air-minum" },
  {
    name: "Filter Air Rumah Tangga",
    icon: Waves,
    slug: "filter-air-rumah-tangga",
  },
];

/** Featured Product Card — Large, conversion-focused */
function FeaturedProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const variant = product.variants?.[0];
  const image = product.images?.[0];
  const addToCart = useAddToCart();

  const hasDiscount =
    variant?.comparePrice && variant.comparePrice > variant.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((variant!.comparePrice! - variant!.price) / variant!.comparePrice!) *
          100,
      )
    : 0;

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-surface overflow-hidden shadow-soft card-hover perspective-card">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <Link
          href={ROUTES.PRODUCT(product.slug)}
          className="relative block w-full sm:w-1/2 aspect-square sm:aspect-auto overflow-hidden"
        >
          {image ? (
            <Image
              src={getImageUrl(image.url)}
              alt={image.alt || product.name}
              fill
              className="object-cover p-4 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <Droplets className="size-20 text-primary/30" />
            </div>
          )}
          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-error px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              -{discountPercent}%
            </span>
          )}
          {/* Bestseller Badge */}
          <span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            Terlaris
          </span>
        </Link>

        {/* Info + Actions */}
        <div className="flex flex-col justify-between p-5 sm:w-1/2">
          <div>
            <p className="text-xs text-foreground-subtle uppercase tracking-wider">
              {product.brand || "Waterpro"}
            </p>
            <Link href={ROUTES.PRODUCT(product.slug)}>
              <h3 className="text-lg font-bold text-foreground mt-1 leading-tight hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            {product.shortDescription && (
              <p className="text-sm text-foreground-muted mt-2 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-primary text-primary"
                  />
                ))}
              </div>
              <span className="text-xs text-foreground-subtle">(128)</span>
            </div>

            {/* Price */}
            <div className="mt-4">
              {variant && (
                <>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(variant.price)}
                  </p>
                  {hasDiscount && (
                    <p className="text-sm text-foreground-subtle line-through mt-0.5">
                      {formatCurrency(variant.comparePrice!)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              isLoading={addToCart.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (variant) {
                  addToCart.mutate({
                    productId: product.id,
                    variantId: variant.id,
                    quantity: 1,
                  });
                } else {
                  router.push(ROUTES.PRODUCT(product.slug));
                }
              }}
            >
              <ShoppingCart className="size-4" />
              Beli
            </Button>
            <Link href={ROUTES.PRODUCT(product.slug)}>
              <Button variant="outline" size="sm">
                Detail
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small Product Card — Compact, for secondary products */
function SmallProductCard({ product }: { product: Product }) {
  const variant = product.variants?.[0];
  const image = product.images?.[0];

  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className="group relative rounded-2xl border border-border/60 bg-surface overflow-hidden shadow-soft transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5"
    >
      <div className="relative aspect-square p-2">
        {image ? (
          <Image
            src={getImageUrl(image.url)}
            alt={image.alt || product.name}
            fill
            className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, 15vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl">
            <Droplets className="size-8 text-primary/30" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-foreground-subtle truncate">
          {product.brand || "Waterpro"}
        </p>
        <h4 className="text-sm font-semibold text-foreground truncate mt-0.5">
          {product.name}
        </h4>
        {variant && (
          <p className="text-sm font-bold text-primary mt-1">
            {formatCurrency(variant.price)}
          </p>
        )}
      </div>
    </Link>
  );
}

export function HomePage() {
  const { data: products, isLoading: productsLoading } = useProducts({
    sort: "newest",
    limit: 8,
  });
  const [useCaseIndex, setUseCaseIndex] = useState(0);

  const nextUseCase = () => setUseCaseIndex((i) => (i + 1) % useCases.length);
  const prevUseCase = () =>
    setUseCaseIndex((i) => (i - 1 + useCases.length) % useCases.length);

  const featuredProducts = (products?.data ?? []).slice(0, 4);
  const [heroSearch, setHeroSearch] = useState("");

  return (
    <div className="overflow-hidden">
      {/* ==================== HERO — Corporate Trust ==================== */}
      <section className="relative bg-background overflow-hidden">
        {/* Atmospheric gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/40 to-violet-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/30 to-indigo-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="order-1 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm mb-6">
                <Sparkles className="size-4 text-primary" />
                <span className="text-primary font-semibold">
                  New 2026 Collection
                </span>
              </div>

              {/* Headline with gradient text */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground">
                Air Bersih{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  & Sehat
                </span>
                <br />
                untuk Keluarga
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg text-foreground-muted leading-relaxed max-w-xl">
                Filter air RO 5-tahap yang menghilangkan 99.9% kontaminan.
                Nikmati air jernih, segar, dan aman langsung dari keran Anda.
              </p>

              {/* Hero Search Bar */}
              <div className="mt-8 max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground-subtle" />
                  <input
                    type="text"
                    placeholder="Cari produk filter air..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && heroSearch.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(heroSearch.trim())}`;
                      }
                    }}
                    className="w-full rounded-full border border-border bg-surface py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    aria-label="Cari produk"
                  />
                </div>
              </div>

              {/* Trust metrics */}
              <div className="mt-8 flex flex-wrap gap-8">
                <div className="flex items-center gap-2">
                  <Star className="size-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-foreground">4.9</span>
                  <span className="text-foreground-muted text-sm">
                    (2,560 ulasan)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <span className="text-foreground font-semibold text-sm">
                    SNI & WHO
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href={ROUTES.PRODUCTS}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-button"
                  >
                    <ShoppingCart className="size-5" />
                    Belanja Sekarang
                  </Button>
                </Link>
                <Link href={ROUTES.FEATURES}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto group"
                  >
                    Pelajari Lebih Lanjut
                    <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-foreground-muted">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-primary" />
                  <span>Gratis Ongkir</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  <span>Garansi 2 Tahun</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span>Pengiriman 1-3 Hari</span>
                </div>
              </div>
            </div>

            {/* Right: Featured Product + Grid */}
            <div className="order-2 lg:order-2">
              {featuredProducts.length > 0 ? (
                <div className="flex flex-col gap-4 max-w-lg mx-auto lg:max-w-none">
                  {/* Featured Product (Large Card) */}
                  <FeaturedProductCard product={featuredProducts[0]} />

                  {/* Secondary Products Row */}
                  {featuredProducts.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                      {featuredProducts.slice(1, 4).map((product) => (
                        <SmallProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 shadow-soft">
                  <Droplets className="size-16 text-primary/20 mb-4" />
                  <p className="text-foreground-muted text-sm">
                    Produk segera hadir
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT SHOWCASE ==================== */}
      <section className="bg-background py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {featuredProducts[0] ? (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Product image */}
              <div className="relative overflow-hidden rounded-2xl bg-surface shadow-soft border border-border/60 perspective-card">
                {featuredProducts[0].images?.[0] ? (
                  <div className="aspect-square relative">
                    <Image
                      src={getImageUrl(featuredProducts[0].images[0].url)}
                      alt={
                        featuredProducts[0].images[0].alt ||
                        featuredProducts[0].name
                      }
                      fill
                      className="object-cover transform hover:rotate-x-[2deg] transition-transform duration-500"
                      sizes="50vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 transform hover:rotate-x-[2deg] transition-transform duration-500">
                    <Droplets className="size-28 text-primary/25" />
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex flex-col justify-center">
                {/* Rating */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-foreground">
                      4.9
                    </span>
                  </div>
                  <span className="text-sm text-foreground-subtle">
                    256 Ulasan
                  </span>
                </div>

                {/* Name & Price */}
                <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl tracking-tight">
                  {featuredProducts[0].name}
                </h2>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-foreground">
                    {formatCurrency(
                      featuredProducts[0].variants?.[0]?.price ?? 0,
                    )}
                  </span>
                  {featuredProducts[0].variants?.[0]?.comparePrice && (
                    <span className="text-lg text-foreground-subtle line-through">
                      {formatCurrency(
                        featuredProducts[0].variants[0].comparePrice,
                      )}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-6 text-foreground-muted leading-relaxed">
                  {featuredProducts[0].shortDescription ||
                    featuredProducts[0].description}
                </p>

                {/* Buy button */}
                <div className="mt-8">
                  <Link href={ROUTES.PRODUCTS}>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="shadow-button"
                    >
                      Beli Sekarang
                    </Button>
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {trustBadges.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-sm text-foreground-muted"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Specification link */}
                <button className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group">
                  Lihat Spesifikasi
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ) : productsLoading ? (
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="aspect-square rounded-2xl bg-surface shadow-soft border border-border/60" />
              <div className="space-y-4">
                <CardSkeleton />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-10">
            Kategori Filter Air
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categoryItems.map((cat) => (
              <Link
                key={cat.slug}
                href={ROUTES.PRODUCTS}
                className="group flex flex-col items-center rounded-2xl border border-border/60 bg-surface p-6 text-center shadow-soft card-hover"
              >
                <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300">
                  <cat.icon className="size-7" />
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== NEW PRODUCTS ==================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Produk Terbaru
          </h2>
          <Link
            href={ROUTES.PRODUCTS}
            className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors group flex items-center gap-1"
          >
            Lihat Semua
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (products?.data ?? []).length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(products?.data ?? []).slice(0, 8).map((product: Product) => {
              const firstVariant = product.variants?.[0];
              const image = product.images?.[0];

              return (
                <Link
                  key={product.id}
                  href={ROUTES.PRODUCT(product.slug)}
                  className="group rounded-xl border border-border/60 bg-surface p-4 shadow-soft card-hover"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 mb-3 relative">
                    {image ? (
                      <Image
                        src={getImageUrl(image.url)}
                        alt={image.alt || product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Droplets className="size-8 text-primary/25" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  {firstVariant?.price && (
                    <p className="mt-1 text-sm font-extrabold text-foreground">
                      {formatCurrency(firstVariant.price)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* ==================== BRAND LOGOS ==================== */}
      <section className="bg-surface border-y border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-foreground-subtle mb-6">
            Tersertifikasi & Terpercaya
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              { icon: ShieldCheck, label: "SNI Certified" },
              { icon: Award, label: "WHO Standard" },
              { icon: Shield, label: "ISO 9001" },
              { icon: Check, label: "TUV Tested" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-foreground-muted"
              >
                <Icon className="size-5 text-primary" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== KEY FEATURES / STATS ==================== */}
      <section id="features" className="bg-background py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Fitur{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Utama
              </span>
            </h2>
            <p className="mt-4 text-lg text-foreground-muted max-w-xl">
              Filtrasi 5 tahap, bebas bakteri, dan rasa segar — air bersih untuk
              keluarga Anda.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {featureStats.map((stat) => (
              <div key={stat.label} className="group">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {stat.unit}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-foreground">
                  {stat.label}
                </h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial with image */}
          <div className="mt-20 grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative perspective-card">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-soft border border-border/60 transform rotate-x-[5deg] rotate-y-[-12deg] hover:rotate-x-[2deg] hover:rotate-y-[-8deg] transition-transform duration-500">
                <Image
                  src="https://picsum.photos/seed/waterpro-hero/600/600"
                  alt="Air bersih dan segar"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  unoptimized
                />
              </div>
            </div>
            <div>
              <blockquote className="text-xl italic text-foreground leading-relaxed font-medium">
                &ldquo;{testimonial1.text}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  src={`https://ui-avatars.com/api/?name=Budi+Santoso&background=6366f1&color=fff&size=40&rounded=true&bold=true`}
                  alt={testimonial1.author}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {testimonial1.author}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {testimonial1.date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE ==================== */}
      <section className="bg-background py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Mengapa Memilih{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Waterpro Filter?
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground-muted text-lg">
              Dirancang untuk gaya hidup aktif Anda. Performa, durabilitas, dan
              kenyamanan dalam satu filter.
            </p>
          </div>

          {/* Feature cards — alternating zigzag */}
          <div className="space-y-20">
            {whyChooseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isReversed = index % 2 === 1;

              return (
                <div
                  key={feature.title}
                  className={`grid gap-12 lg:grid-cols-2 lg:gap-16 items-center ${isReversed ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  {/* Image */}
                  <div className="relative perspective-card">
                    <div
                      className={`aspect-square overflow-hidden rounded-2xl shadow-soft border border-border/60 transition-transform duration-500 ${index % 2 === 0 ? "transform rotate-y-[6deg] hover:rotate-y-[2deg]" : "transform rotate-y-[-6deg] hover:rotate-y-[-2deg]"}`}
                    >
                      <Image
                        src={`https://picsum.photos/seed/waterpro-feature-${index}/600/600`}
                        alt={feature.title}
                        fill
                        className="object-cover"
                        sizes="50vw"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-foreground-muted leading-relaxed text-base">
                      {feature.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {feature.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 text-sm text-foreground-muted"
                        >
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                            <Check className="size-3.5 text-primary" />
                          </div>
                          <span className="font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== CUSTOMER REVIEWS ==================== */}
      <section id="reviews" className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Apa Kata{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Pelanggan Kami
              </span>
            </h2>
            <p className="mt-4 text-lg text-foreground-muted">
              Pelanggan kami menyukai Waterpro. Berikut alasannya trusted oleh
              banyak keluarga Indonesia.
            </p>
          </div>

          {/* Reviews grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {customerReviews.map((review, i) => (
              <div
                key={i}
                className="rounded-xl bg-background border border-border/60 p-6 shadow-soft card-hover"
              >
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`size-4 ${j < review.stars ? "fill-amber-400 text-amber-400" : "text-border"}`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-foreground-subtle">
                    {review.date}
                  </span>
                </div>
                <p className="mt-4 text-sm text-foreground leading-relaxed">
                  {review.text}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Image
                    src={review.avatar}
                    alt={review.author}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="text-sm font-bold text-foreground">
                    {review.author}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Overall rating */}
          <div className="mt-10 rounded-xl bg-background border border-border/60 p-8 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="size-6 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-extrabold text-foreground">
                  4.8
                </span>
              </div>
              <div className="flex -space-x-2">
                {["Sarah", "Ahmad", "Dewi", "Rizky"].map((name, i) => (
                  <Image
                    key={i}
                    src={`https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&size=36&rounded=true&bold=true`}
                    alt={name}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-background"
                    unoptimized
                    style={{ marginLeft: i > 0 ? "-0.5rem" : undefined }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground-muted">
              Dipercaya oleh banyak, dicintai oleh semua — Waterpro untuk semua!
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="primary" size="md" className="shadow-button">
                Tulis Ulasan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PENGGUNAAN SEHARI-HARI ==================== */}
      <section className="bg-surface py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 max-w-xl">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Penggunaan Sehari-hari —{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Air Bersih di Mana Saja!
              </span>
            </h2>
            <p className="mt-4 text-lg text-foreground-muted">
              Waterpro dirancang untuk fleksibilitas. Nikmati air bersih
              berkualitas di setiap sudut rumah Anda.
            </p>
          </div>

          {/* Use Cases Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Dapur", icon: Droplets, desc: "Masak & Minum Segar" },
              {
                title: "Kamar Mandi",
                icon: ShowerHead,
                desc: "Kulit & Rambut Sehat",
              },
              { title: "Bayi", icon: Baby, desc: "Aman untuk MPASI" },
              { title: "Kantor", icon: Briefcase, desc: "Hidrasi Produktif" },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border/60 bg-background p-6 shadow-soft card-hover text-center"
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="size-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW TO GET STARTED ==================== */}
      <section className="bg-background py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Cara Memulai dengan{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Waterpro
              </span>
            </h2>
            <p className="mt-4 text-lg text-foreground-muted">
              Memasang Waterpro itu mudah dan cepat! Ikuti langkah sederhana
              ini.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howToSteps.map((step) => (
              <div key={step.step} className="group flex gap-4">
                <div className="flex-shrink-0">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BLOG ==================== */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              The Water Lab —{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Tips & Panduan
              </span>
            </h2>
            <p className="mt-4 text-lg text-foreground-muted">
              Jelajahi tips ahli, panduan produk, dan inspirasi untuk
              mendapatkan manfaat maksimal dari filter Waterpro.
            </p>
          </div>

          {/* Blog grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, i) => (
              <div
                key={i}
                className="group rounded-xl bg-background border border-border/60 p-4 shadow-soft card-hover"
              >
                <div className="aspect-video overflow-hidden rounded-xl relative">
                  <Image
                    src={`https://picsum.photos/seed/waterpro-blog-${i}/600/340`}
                    alt={post.title}
                    width={600}
                    height={340}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-foreground-subtle">
                  {post.date}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button variant="secondary" size="md">
              Lihat Semua
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== USE CASES ==================== */}
      <section className="bg-background py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Penggunaan Sehari-hari — Air Bersih,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                di Mana Saja!
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground-muted text-lg">
              Lihat bagaimana Waterpro masuk ke setiap aspek kehidupan Anda.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative mt-14">
            <div className="overflow-hidden rounded-2xl">
              <div className="aspect-[16/9] relative border border-border/60 shadow-soft">
                <Image
                  src={`https://picsum.photos/seed/waterpro-usecase-${useCaseIndex}/1200/675`}
                  alt={useCases[useCaseIndex].title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <h3 className="text-3xl font-extrabold text-white">
                    {useCases[useCaseIndex].title}
                  </h3>
                  <p className="mt-3 text-white/90 text-lg">
                    {useCases[useCaseIndex].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={prevUseCase}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-surface border border-border/60 shadow-soft hover:shadow-hover transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={nextUseCase}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-surface border border-border/60 shadow-soft hover:shadow-hover transition-all"
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Dots */}
            <div className="mt-6 flex justify-center gap-2">
              {useCases.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setUseCaseIndex(i)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    i === useCaseIndex
                      ? "w-8 bg-gradient-to-r from-indigo-600 to-violet-600"
                      : "w-2 bg-border"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOUNDER / CTA ==================== */}
      <section className="bg-surface py-20 sm:py-28 hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
              Dibuat dengan Tujuan. Didukung oleh{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Passion.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground-muted text-lg">
              Setiap detail Waterpro dibuat untuk membawa air bersih ke momen
              sehari-hari Anda.
            </p>
          </div>

          {/* Founder letter */}
          <div className="mx-auto mt-14 max-w-lg rounded-xl bg-background border border-border/60 p-8 shadow-soft">
            <div className="text-left">
              <p className="text-foreground leading-relaxed font-medium">
                Hai, saya Alex.
              </p>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                Ketika saya memulai Waterpro, saya punya satu tujuan: membuat
                filter air yang pas ke kehidupan Anda — tanpa kompromi kualitas,
                gaya, atau durabilitas.
              </p>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                Saya selalu percaya bahwa air bersih adalah hak semua orang.
                Dengan Waterpro, kami fokus pada apa yang benar-benar penting:
                filtrasi 5 tahap, tanpa listrik, desain tangguh yang siap
                mengikuti petualangan Anda.
              </p>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                Setiap fitur dipertimbangkan dengan matang, karena saya percaya
                air bersih tidak boleh jadi kompromi.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Image
                  src="https://ui-avatars.com/api/?name=Alex+M&background=6366f1&color=fff&size=44&rounded=true&bold=true"
                  alt="Alex M."
                  width={44}
                  height={44}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-bold text-foreground">Alex M.</p>
                  <p className="text-xs text-foreground-subtle">
                    CEO & Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-indigo-950" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Siap Mendapatkan Air Bersih?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-indigo-200 text-lg">
            Bergabunglah dengan ribuan keluarga Indonesia yang sudah mempercayai
            Waterpro.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={ROUTES.PRODUCTS}>
              <Button
                size="lg"
                className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Belanja Sekarang
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES — HIDDEN (replaced) ==================== */}
      {/* Old category section removed — replaced by new categoryItems grid above */}

      {/* ==================== NEW PRODUCTS — HIDDEN (replaced) ==================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 hidden">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Produk Terbaru
          </h2>
          <Link
            href={ROUTES.PRODUCTS}
            className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors group flex items-center gap-1"
          >
            Lihat Semua
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (products?.data ?? []).length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(products?.data ?? []).slice(0, 8).map((product: Product) => {
              const firstVariant = product.variants?.[0];
              const image = product.images?.[0];

              return (
                <Link
                  key={product.id}
                  href={ROUTES.PRODUCT(product.slug)}
                  className="group rounded-xl border border-border/60 bg-surface p-4 shadow-soft card-hover"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 mb-3 relative">
                    {image ? (
                      <Image
                        src={getImageUrl(image.url)}
                        alt={image.alt || product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Droplets className="size-8 text-primary/25" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  {firstVariant?.price && (
                    <p className="mt-1 text-sm font-extrabold text-foreground">
                      {formatCurrency(firstVariant.price)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
