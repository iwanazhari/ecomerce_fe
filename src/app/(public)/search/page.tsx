'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
        Cari <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Produk</span>
      </h1>
      {query && (
        <p className="mb-8 text-sm text-foreground-muted">
          Menampilkan hasil untuk: <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
      )}
      <ProductGrid initialSearch={query} />
    </div>
  )
}

function SearchPageContent() {
  return (
    <>
      <CmsPageRenderer page="search" />
      <SearchContent />
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="h-8 w-48 bg-surface rounded-lg shadow-soft mb-8" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <ListSkeleton count={10} />
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
