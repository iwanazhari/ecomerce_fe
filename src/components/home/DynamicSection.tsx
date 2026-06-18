'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ROUTES } from '@/constants'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/components/ui/Badge'
import { HeroBanner } from '@/components/home/HeroBanner'
import { formatCurrency, getImageUrl } from '@/utils'
import {
  Star, ShoppingCart, Droplets, ArrowRight, Truck, ShieldCheck, Clock,
  Sparkles, Heart, ThumbsUp, BadgeCheck, Flame, Wrench, Building2,
  ShowerHead, Thermometer, Filter as FilterIcon, Package, Award, Medal,
  Verified, FileCheck, ChevronLeft, ChevronRight
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
    return <HeroSlider slides={slides} />
  }

  if (sectionType === 'categories') {
    const items = (content as any)?.items?.filter((c: any) => c.name)
    if (!items?.length) return null
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex flex-col items-center sm:items-start gap-4 mb-8 sm:mb-10">
          <SectionLabel>Kategori</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-foreground leading-tight text-center sm:text-left">
            {title || 'Kategori Produk'}
          </h2>
        </div>
        <div className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory sm:flex-wrap sm:justify-start sm:gap-4">
          {items.map((cat: any) => (
            <Link key={cat.slug} href={cat.slug ? ROUTES.PRODUCTS + `?category=${cat.slug}` : ROUTES.PRODUCTS} className="group flex flex-col items-center rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm card-hover w-[calc(33.333%-0.75rem)] shrink-0 snap-start sm:flex-1 sm:min-w-[calc(20%-1rem)] sm:snap-none">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white group-hover:scale-110 transition-transform duration-300">
                <Icon name={cat.icon} className="size-5 sm:size-6" />
              </div>
              <span className="mt-2.5 text-[11px] sm:text-xs font-semibold text-foreground text-center leading-tight">{cat.name}</span>
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

  if (sectionType === 'brands') {
    const brands = (content as any)?.brands?.filter((b: any) => b.name)
    if (!brands?.length) return null
    return (
      <section className="border-y border-border bg-card/50 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 mb-8">
            <SectionLabel>Brand Partner</SectionLabel>
            <p className="text-center text-lg font-heading text-foreground">{title || 'Brand Terpercaya'}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {brands.map((brand: any, idx: number) => (
              <div key={idx} className="group flex flex-col items-center gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted/50 border border-border flex items-center justify-center p-2 transition-all duration-300 grayscale hover:grayscale-0 hover:border-primary/30 hover:shadow-soft">
                  {brand.imageUrl ? (
                    <img src={getImageUrl(brand.imageUrl)} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full rounded-lg" style={{ backgroundColor: ['#EEF2FF', '#F5F3FF', '#F0FDF4', '#FFF7ED', '#ECFEFF', '#FEF2F2'][idx % 6] }}>
                      <span className="text-xs sm:text-sm font-bold font-heading" style={{ color: ['#4F46E5', '#7C3AED', '#059669', '#EA580C', '#0891B2', '#DC2626'][idx % 6] }}>
                        {brand.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground-muted group-hover:text-foreground transition-colors">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (sectionType === 'certification') {
    const items = (content as any)?.items?.filter((c: any) => c.label)
    if (!items?.length) return null
    return (
      <section className="border-y border-border bg-muted/50 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 mb-6">
            <SectionLabel>Sertifikasi</SectionLabel>
            <p className="text-center text-lg font-heading text-foreground">{title || 'Tersertifikasi & Terpercaya'}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {items.map((cert: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-foreground-muted">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white">
                  <Icon name={cert.icon} className="size-4" />
                </div>
                <span className="text-sm font-semibold text-foreground">{cert.label}</span>
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

function HeroSlider({ slides }: { slides: any[] }) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const total = slides.length
  const extendedSlides = [...slides, slides[0]]

  const next = useCallback(() => {
    setCurrent((i) => (i + 1 > total ? 0 : i + 1))
  }, [total])

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 < 0 ? total : i - 1))
  }, [total])

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, total])

  useEffect(() => {
    if (current !== total) return
    const el = trackRef.current
    if (!el) return
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform') return
      el.style.transition = 'none'
      setCurrent(0)
      el.offsetHeight
      el.style.transition = ''
    }
    el.addEventListener('transitionend', onEnd)
    return () => el.removeEventListener('transitionend', onEnd)
  }, [current, total])

  const displaySlides = total > 1 ? extendedSlides : slides
  const dotIndex = current === total ? 0 : current

  return (
      <div className="relative overflow-hidden">
        <div className="relative aspect-[3/2] sm:aspect-[2/1] bg-gradient-to-br from-indigo-100 via-violet-100 to-indigo-50">
          <div
            ref={trackRef}
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {displaySlides.map((slide: any, idx: number) => (
              <div key={idx} className="relative w-full h-full shrink-0 flex items-center justify-center">
                {slide.imageUrl && (
                  <Image
                    src={getImageUrl(slide.imageUrl)}
                    alt={slide.title || ''}
                    fill
                    className="object-contain p-2 sm:p-4"
                    sizes="100vw"
                    priority={idx === 0}
                  />
                )}
              {(slide.title || slide.subtitle || slide.cta) && (
                <div className={`relative z-10 text-center px-6 max-w-lg ${slide.imageUrl ? 'bg-black/40 backdrop-blur-sm rounded-xl p-6 mx-4' : ''}`}>
                  {slide.title && <h1 className={`text-xl sm:text-3xl font-extrabold leading-tight ${slide.imageUrl ? 'text-white' : 'text-foreground'}`}>{slide.title}</h1>}
                  {slide.subtitle && <p className={`mt-2 text-sm sm:text-base ${slide.imageUrl ? 'text-white/80' : 'text-foreground-muted'}`}>{slide.subtitle}</p>}
                  {slide.cta && (
                    <Link href={slide.ctaUrl || '#'} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
                      {slide.cta} <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm hover:bg-white/50 transition-all z-20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm hover:bg-white/50 transition-all z-20"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === dotIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
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
