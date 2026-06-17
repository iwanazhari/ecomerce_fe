'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    title: 'RO (Reverse Osmosis)',
    description: 'Teknologi membran semi-permeable yang menyaring hingga 99% kontaminan termasuk bakteri, virus, logam berat, dan zat kimia berbahaya.',
    tags: ['99% Pure', '5-Stage Filter'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'UV Sterilization',
    description: 'Sinar UV-C membunuh 99.9% bakteri dan virus yang lolos dari filter RO, memastikan air 100% steril dan aman diminum.',
    tags: ['99.9% Steril', 'UV-C Light'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Smart Display',
    description: 'Layar digital menampilkan TDS real-time, status filter, dan reminder penggantian. Kontrol penuh di ujung jari Anda.',
    tags: ['TDS Monitor', 'Smart Alert'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    title: 'Hot & Cold Water',
    description: 'Air panas instan (85-95 degree C) dan air dingin (5-10 degree C) siap kapan saja. Sempurna untuk kopi, teh, atau air minum segar.',
    tags: ['Instant Hot', 'Ice Cold'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Mineral Enrichment',
    description: 'Menambahkan mineral esensial seperti kalsium, magnesium, dan potasium yang bermanfaat untuk kesehatan tubuh.',
    tags: ['Healthy Minerals', 'Alkaline pH'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Easy Filter Change',
    description: 'Sistem quick-release filter yang memudahkan penggantian tanpa alat khusus. Hemat waktu dan tenaga.',
    tags: ['Tool-Free', '5-Min Install'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Energy Efficient',
    description: 'Desain hemat energi dengan mode standby otomatis. Konsumsi listrik minimal untuk operasional 24/7.',
    tags: ['Low Power', 'Auto Standby'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Certified Quality',
    description: 'Tersertifikasi NSF, FDA, dan standar internasional. Teruji laboratorium untuk menjamin kualitas air terbaik.',
    tags: ['NSF Certified', 'Lab Tested'],
  },
]

const benefits = [
  { stat: '99%', label: 'Kontaminan Terbuang', desc: 'RO membrane filter out heavy metals, bacteria & chemicals' },
  { stat: '500+', label: 'Pelanggan Puas', desc: 'Trusted by families, offices & businesses across Indonesia' },
  { stat: '24/7', label: 'Air Bersih Siap', desc: 'Clean water available anytime you need it' },
  { stat: '2 Thn', label: 'Garansi Resmi', desc: 'Full warranty & professional after-sales support' },
]

export default function FeaturesPage() {
  return (
    <>
      <CmsPageRenderer page="features" />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* Gradient blobs */}
        <div className="bg-blob -right-32 -top-32 h-96 w-96 bg-indigo-600/10" />
        <div className="bg-blob -bottom-32 -left-32 h-96 w-96 bg-violet-600/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-border/60 bg-surface px-4 py-1.5 text-sm font-medium text-foreground-muted shadow-soft">
              Why Waterpro?
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
              Teknologi Filter Air{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Terbaik</span>{' '}
              untuk Keluarga Anda
            </h1>
            <p className="mt-4 text-lg text-foreground-muted leading-relaxed">
              Setiap fitur dirancang dengan standar tertinggi untuk memberikan air bersih, sehat, dan aman bagi seluruh keluarga.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border/60 bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {benefits.map((item) => (
              <div key={item.stat} className="text-center">
                <p className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent lg:text-4xl">{item.stat}</p>
                <p className="mt-2 font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-sm text-foreground-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Fitur <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Unggulan</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-foreground-muted">
              Teknologi premium yang dikombinasikan dalam setiap produk Waterpro
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border/60 bg-surface p-6 shadow-soft card-hover"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-button">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-foreground-muted">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Water Quality Comparison */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Perbandingan <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Kualitas Air</span>
            </h2>
            <p className="text-foreground-muted">Lihat perbedaan nyata antara air biasa dan air RO Waterpro</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Air Biasa */}
            <div className="rounded-xl border border-border/60 bg-background p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10">
                  <svg className="h-5 w-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Air Keran Biasa</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Mengandung klorin & zat kimia',
                  'Bakteri & virus tidak terfilter',
                  'Logam berat (Pb, Hg) terlarut',
                  'Bau & rasa tidak segar',
                  'TDS tinggi (300-800 ppm)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground-muted">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Air RO Waterpro */}
            <div className="relative rounded-xl border-2 border-primary/30 bg-surface p-8 shadow-soft">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-button">
                  Recommended
                </span>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Air RO Waterpro</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Bebas klorin & zat kimia berbahaya',
                  '99.9% bakteri & virus tereliminasi',
                  'Bebas logam berat 100%',
                  'Bau hilang, rasa segar & jernih',
                  'TDS optimal (10-50 ppm)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground-muted">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="bg-blob right-20 top-10 h-64 w-64 bg-indigo-600/5" />
        <div className="bg-blob -bottom-20 left-20 h-64 w-64 bg-violet-600/5" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
            Siap Menikmati Air <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Bersih & Sehat?</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-foreground-muted">
            Pilih produk Waterpro yang sesuai kebutuhan Anda. Gratis konsultasi & instalasi.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={ROUTES.PRODUCTS}>
              <Button size="lg" className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-button">
                Lihat Produk
              </Button>
            </Link>
            <Link href={ROUTES.REVIEWS}>
              <Button variant="secondary" size="lg" className="rounded-full">
                Baca Ulasan Customer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
