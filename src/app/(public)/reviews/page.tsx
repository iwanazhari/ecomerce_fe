'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'

const reviews = [
  {
    id: 1,
    name: 'Sarah Wijaya',
    location: 'Jakarta Selatan',
    avatar: 'SW',
    rating: 5,
    date: '2026-04-28',
    verified: true,
    title: 'Airnya benar-benar bersih & segar!',
    content: 'Sudah pakai Waterpro RO selama 3 bulan. Perbedaannya terasa banget, air keran sebelumnya bau klorin dan rasa agak metallic. Sekarang airnya jernih, tidak berbau, dan rasanya segar. Anak-anak juga jadi doyan minum air putih. Worth every penny!',
    product: 'Waterpro RO-600 Plus',
    helpful: 24,
  },
  {
    id: 2,
    name: 'Budi Santoso',
    location: 'Bandung',
    avatar: 'BS',
    rating: 5,
    date: '2026-04-20',
    verified: true,
    title: 'Instalasi cepat, hasil memuaskan',
    content: 'Tim instalasi profesional, datang tepat waktu dan selesai dalam 1 jam. TDS meter yang ditampilkan di smart display sangat membantu. Dari TDS 350 sekarang jadi 25. Filter change reminder juga sangat berguna. Recommended!',
    product: 'Waterpro RO-800 Smart',
    helpful: 18,
  },
  {
    id: 3,
    name: 'Diana Putri',
    location: 'Surabaya',
    avatar: 'DP',
    rating: 5,
    date: '2026-04-15',
    verified: true,
    title: 'Kopi dan teh jadi lebih nikmat',
    content: 'Fitur hot & cold water-nya game changer! Air panasnya langsung 90 degree C, perfect untuk seduh kopi. Air dinginnya juga segar banget. Sebelumnya harus beli galon terus, sekarang hemat banyak. Plus airnya jauh lebih bersih daripada air galon.',
    product: 'Waterpro RO-HC Pro',
    helpful: 31,
  },
  {
    id: 4,
    name: 'Ahmad Fauzi',
    location: 'Medan',
    avatar: 'AF',
    rating: 4,
    date: '2026-04-10',
    verified: true,
    title: 'Bagus, tapi perlu maintenance rutin',
    content: 'Produknya excellent, air bersih dan sehat. Satu-satunya hal yang perlu diperhatikan adalah ganti filter secara rutin sesuai schedule. Kalau telat, TDS mulai naik. Tapi customer service-nya responsif dan selalu ingatkan via notifikasi. Overall puas!',
    product: 'Waterpro RO-600 Plus',
    helpful: 12,
  },
  {
    id: 5,
    name: 'Linda Tanaka',
    location: 'Bali',
    avatar: 'LT',
    rating: 5,
    date: '2026-04-05',
    verified: true,
    title: 'Best investment untuk kesehatan keluarga',
    content: 'Setelah riset panjang, akhirnya pilih Waterpro. Hasilnya luar biasa! Bayi saya yang dulu sering sakit perut sekarang jauh lebih sehat. UV sterilization-nya memberikan ketenangan pikiran ekstra. Desainnya juga elegan, cocok untuk dapur modern.',
    product: 'Waterpro RO-UV Premium',
    helpful: 27,
  },
  {
    id: 6,
    name: 'Rudi Hermawan',
    location: 'Semarang',
    avatar: 'RH',
    rating: 5,
    date: '2026-03-28',
    verified: true,
    title: 'Hemat jangka panjang',
    content: 'Hitung-hitungan dulu sebelum beli. Kalau bandingin dengan beli air galon Rp 20.000 x 2 galon/minggu = Rp 160.000/bulan. Waterpro sudah balik modal dalam 6 bulan! Plus kualitas airnya jauh lebih terjamin karena kita bisa lihat TDS-nya real-time.',
    product: 'Waterpro RO-800 Smart',
    helpful: 19,
  },
]

const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest')

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }))

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <>
      <CmsPageRenderer page="reviews" />
      <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="bg-blob -right-32 -top-32 h-96 w-96 bg-indigo-600/10" />
        <div className="bg-blob -bottom-32 -left-32 h-96 w-96 bg-violet-600/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-border/60 bg-surface px-4 py-1.5 text-sm font-medium text-foreground-muted shadow-soft">
              Customer Reviews
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
              Apa Kata{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pelanggan</span>{' '}
              Kami?
            </h1>
            <p className="mt-4 text-lg text-foreground-muted">
              Testimoni nyata dari pengguna Waterpro di seluruh Indonesia
            </p>
          </div>
        </div>
      </section>

      {/* Rating Overview */}
      <section className="border-b border-border/60 bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-2">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">{averageRating.toFixed(1)}</div>
              <StarRating rating={Math.floor(averageRating + 0.5)} size="lg" />
              <p className="mt-2 text-foreground-muted">{reviews.length} ulasan terverifikasi</p>
            </div>

            {/* Rating Bars */}
            <div className="space-y-3">
              {ratingCounts.map(({ star, count, percentage }) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`flex w-full items-center gap-3 ${filterRating === star ? 'opacity-100' : filterRating ? 'opacity-50 hover:opacity-75' : 'opacity-100'}`}
                >
                  <span className="w-8 text-sm text-foreground-muted">{star} star</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-foreground-muted">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Filters */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-muted">Sort by:</span>
              <button
                onClick={() => setSortBy('newest')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${sortBy === 'newest' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-button' : 'bg-surface text-foreground-muted hover:text-foreground shadow-soft'}`}
              >
                Terbaru
              </button>
              <button
                onClick={() => setSortBy('helpful')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${sortBy === 'helpful' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-button' : 'bg-surface text-foreground-muted hover:text-foreground shadow-soft'}`}
              >
                Most Helpful
              </button>
            </div>
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="text-sm text-primary hover:text-primary-hover"
              >
                Clear filter ({filterRating} star) x
              </button>
            )}
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-border/60 bg-surface p-6 shadow-soft card-hover"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 font-semibold text-white shadow-button">
                    {review.avatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{review.name}</h3>
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-success">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                          <span>{review.location}</span>
                          <span>-</span>
                          <span>{new Date(review.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium text-foreground">{review.title}</h4>
                      <p className="leading-relaxed text-foreground-muted text-sm">{review.content}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="rounded-full bg-background px-3 py-1 text-xs text-foreground-muted">
                        {review.product}
                      </span>
                      <button className="flex items-center gap-1 text-sm text-foreground-muted transition-colors hover:text-primary">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-surface py-20 sm:py-28">
        <div className="bg-blob right-20 top-10 h-64 w-64 bg-indigo-600/5" />
        <div className="bg-blob -bottom-20 left-20 h-64 w-64 bg-violet-600/5" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground">
            Bergabung dengan Ribuan{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pelanggan Puas</span>
          </h2>
          <p className="mb-8 text-foreground-muted">
            Rasakan sendiri kualitas air RO Waterpro. Garansi 2 tahun & free instalasi.
          </p>
          <Link href={ROUTES.PRODUCTS}>
            <Button size="lg" className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-button">
              Belanja Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
    </>
  )
}
