'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Truck, Shield, Clock } from 'lucide-react'

const slides = [
  {
    title: 'Air Bersih & Sehat untuk Keluarga',
    subtitle: 'Filter air RO 5-tahap — hilangkan 99.9% kontaminan',
    cta: 'Belanja Sekarang',
    href: ROUTES.PRODUCTS,
    gradient: 'from-indigo-600/90 to-violet-600/90',
    accent: 'white',
  },
  {
    title: 'Gratis Ongkir Seluruh Indonesia',
    subtitle: 'Nikmati free shipping untuk semua pesanan',
    cta: 'Lihat Produk',
    href: ROUTES.PRODUCTS,
    gradient: 'from-teal-600/90 to-emerald-600/90',
    accent: 'white',
  },
  {
    title: 'Garansi 2 Tahun Semua Produk',
    subtitle: 'Tenang dengan garansi resmi Waterpro',
    cta: 'Pelajari',
    href: ROUTES.FEATURES,
    gradient: 'from-violet-600/90 to-purple-600/90',
    accent: 'white',
  },
]

export function HeroBanner() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((i) => (i + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((i) => (i - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="relative overflow-hidden rounded-2xl">
          <div className={`relative bg-gradient-to-br ${slide.gradient} px-6 sm:px-12 py-10 sm:py-16`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-xl">
                {slide.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg">
                {slide.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href={slide.href}>
                  <Button
                    size="md"
                    className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg font-bold"
                  >
                    {slide.cta}
                  </Button>
                </Link>

                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Truck className="size-3.5" /> Gratis Ongkir</span>
                  <span className="flex items-center gap-1"><Shield className="size-3.5" /> Garansi 2 Thn</span>
                  <span className="hidden sm:flex items-center gap-1"><Clock className="size-3.5" /> 1-3 Hari</span>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
