'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ROUTES } from '@/constants'
import { Skeleton } from '@/components/ui/Skeleton'
import { HeroBanner } from '@/components/home/HeroBanner'
import { formatCurrency, getImageUrl } from '@/utils'
import {
  Star, ShoppingCart, Droplets, ArrowRight, Truck, ShieldCheck, Clock,
  Sparkles, Heart, ThumbsUp, BadgeCheck, Flame, Wrench, Building2,
  ShowerHead, Thermometer, Filter as FilterIcon, Package, Award, Medal,
  Verified, FileCheck
} from 'lucide-react'
import type { CmsSection, Product } from '@/types'
import { useProducts, useAddToCart } from '@/hooks'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Truck, ShieldCheck, Clock, Sparkles, Star, Heart, ThumbsUp, BadgeCheck,
  Droplets, Flame, Wrench, Building2, ShowerHead, Thermometer,
  Filter: FilterIcon, Package, Award, Medal, Verified, FileCheck,
}

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = ICON_MAP[name]
  if (!Comp) return <ShieldCheck className={className} />
  return <Comp className={className} />
}

function ProductCardMini({ product }: { product: Product }) {
  const variant = product.variants?.[0]
  const image = product.images?.[0]
  const addToCart = useAddToCart()
  const hasDiscount = variant?.comparePrice && variant.comparePrice > variant.price
  const discountPercent = hasDiscount
    ? Math.floor((((variant!.comparePrice! - variant!.price) / variant!.comparePrice!) * 100) + 0.5)
    : 0
  const rating = (product as any).rating ?? 0
  const soldCount = (product as any).soldCount ?? 0

  return (
    <div className="group w-[140px] min-w-[140px] rounded-xl border border-border/60 bg-surface shadow-soft card-hover overflow-hidden flex flex-col">
      <Link href={ROUTES.PRODUCT(product.slug)}>
        <div className="relative aspect-square w-full">
          {image ? (
            <Image src={getImageUrl(image.url)} alt={image.alt || product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="140px" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
              <Droplets className="size-6 text-primary/25" />
            </div>
          )}
          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 z-10 rounded-full bg-error px-1.5 py-0.5 text-[9px] font-bold text-white shadow">-{discountPercent}%</span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-2.5">
        <div>
          <div className="flex items-center gap-1 h-3">
            {rating > 0 ? (
              <>
                <Star className="size-2.5 shrink-0 fill-amber-400 text-amber-400" />
                <span className="text-[9px] font-semibold text-foreground-muted">{rating.toFixed(1)}</span>
                {soldCount > 0 && <span className="text-[9px] text-foreground-subtle">| {soldCount}</span>}
              </>
            ) : <span className="text-[9px] text-foreground-subtle">&nbsp;</span>}
          </div>
          <Link href={ROUTES.PRODUCT(product.slug)}>
            <h3 className="mt-1 text-[10px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug h-7 overflow-hidden">{product.name}</h3>
          </Link>
          <p className="mt-1 text-[11px] font-bold text-foreground h-4">{variant ? formatCurrency(variant.price) : '\u00A0'}</p>
        </div>
        <button onClick={(e) => { e.preventDefault(); if (variant) addToCart.mutate({ productId: product.id, variantId: variant.id, quantity: 1 }) }} className="h-7 flex w-full items-center justify-center gap-1 rounded-lg bg-primary/10 text-[9px] font-semibold text-primary hover:bg-primary hover:text-white transition-all">
          <ShoppingCart className="size-3" /> + Keranjang
        </button>
      </div>
    </div>
  )
}

export function DynamicSection({ section }: { section: CmsSection }) {
  const sectionType = section.sectionType
  const title = section.title || ''
  const content = section.content || {}

  if (!section.isActive) return null

  if (sectionType === 'hero') {
    const slides = (content as any)?.slides?.filter((s: any) => s.imageUrl || s.title)
    if (!slides?.length) return <HeroBanner />
    return (
      <div className="relative overflow-hidden">
        {slides.map((slide: any, idx: number) => (
          <div key={idx} className="relative flex items-center justify-center h-48 sm:h-72 bg-gradient-to-br from-indigo-100 via-violet-100 to-indigo-50">
            {slide.imageUrl && (
              <Image
                src={getImageUrl(slide.imageUrl)}
                alt={slide.title || ''}
                fill
                className="object-cover"
                sizes="100vw"
              />
            )}
            <div className={`relative z-10 text-center px-6 max-w-lg ${slide.imageUrl ? 'bg-black/40 backdrop-blur-sm rounded-xl p-6 mx-4' : ''}`}>
              <h1 className={`text-xl sm:text-3xl font-extrabold leading-tight ${slide.imageUrl ? 'text-white' : 'text-foreground'}`}>{slide.title}</h1>
              {slide.subtitle && <p className={`mt-2 text-sm sm:text-base ${slide.imageUrl ? 'text-white/80' : 'text-foreground-muted'}`}>{slide.subtitle}</p>}
              {slide.cta && (
                <Link href={slide.ctaUrl || '#'} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
                  {slide.cta} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sectionType === 'trust_badges') {
    const badges = (content as any)?.badges?.filter((b: any) => b.text)
    if (!badges?.length) return null
    return (
      <div className="bg-surface border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-foreground-muted flex-wrap">
            {badges.map((badge: any, idx: number) => (
              <span key={idx} className="flex items-center gap-1.5">
                <Icon name={badge.icon} className="size-3.5 sm:size-4 text-primary" />
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sectionType === 'categories') {
    const items = (content as any)?.items?.filter((c: any) => c.name)
    if (!items?.length) return null
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mb-4 sm:mb-6">{title || 'Kategori Produk'}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {items.map((cat: any) => (
            <Link key={cat.slug} href={cat.slug ? ROUTES.PRODUCTS + `?category=${cat.slug}` : ROUTES.PRODUCTS} className="group flex flex-col items-center rounded-xl border border-border/60 bg-surface p-3 sm:p-4 shadow-soft card-hover">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Icon name={cat.icon} className="size-5 sm:size-6" />
              </div>
              <span className="mt-2 text-[10px] sm:text-xs font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (sectionType === 'products') {
    const sortBy = (content as any)?.sortBy || 'newest'
    const limit = (content as any)?.limit || 10
    return <ProductSectionDynamic title={title} sortBy={sortBy} limit={limit} />
  }

  if (sectionType === 'certification') {
    const items = (content as any)?.items?.filter((c: any) => c.label)
    if (!items?.length) return null
    return (
      <section className="bg-surface border-y border-border/60 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground-subtle mb-4">{title || 'Tersertifikasi & Terpercaya'}</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {items.map((cert: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-foreground-muted">
                <Icon name={cert.icon} className="size-4 sm:size-5 text-primary" />
                <span className="text-xs sm:text-sm font-semibold">{cert.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (sectionType === 'custom') {
    const html = (content as any)?.html || ''
    if (!html) return null
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {title && <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mb-4">{title}</h2>}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    )
  }

  return null
}

function ProductSectionDynamic({ title, sortBy, limit }: { title: string; sortBy: string; limit: number }) {
  const { data: products, isLoading } = useProducts({ sort: sortBy as any, limit })
  const items = products?.data ?? []

  if (!title) return null

  return (
    <section className="pb-6 sm:pb-10">
      <div className="mx-auto max-w-7xl mb-4 flex items-center justify-between px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">{title}</h2>
        <Link href={ROUTES.PRODUCTS} className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
          Lihat Semua <ArrowRight className="size-3 sm:size-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-3 snap-x snap-mandatory pb-1 px-4 sm:px-6 mx-auto max-w-7xl">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[140px] min-w-[140px] shrink-0">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="p-2.5 flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-1/3" /><Skeleton className="h-7 w-full" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-7 w-full rounded-lg" />
                </div>
              </div>
            ))
          ) : items.length > 0 ? (
            items.map((product) => (
              <div key={product.id} className="snap-start shrink-0"><ProductCardMini product={product} /></div>
            ))
          ) : null}
        </div>
      </div>
    </section>
  )
}
