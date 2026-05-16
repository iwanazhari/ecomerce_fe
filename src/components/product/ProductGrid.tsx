'use client'

import { useState, useCallback, useEffect } from 'react'
import { useProducts, useCategories } from '@/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '@/components/product/ProductCard'
import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const PAGE_SIZE = 12

interface ProductGridProps {
  initialSearch?: string
}

export function ProductGrid({ initialSearch }: ProductGridProps) {
  const [search, setSearch] = useState(initialSearch ?? '')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  // Sync initialSearch prop when it changes (e.g. from URL on navigation)
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch)
    }
  }, [initialSearch])

  const debouncedSearch = useDebounce(search, 300)
  const { data: products, isLoading: productsLoading } = useProducts({
    search: debouncedSearch || undefined,
    category: category || undefined,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })
  const { data: categories } = useCategories()

  const productList = products?.data ?? []
  const totalProducts = products?.meta?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setCategory('')
    setSort('newest')
    setPage(1)
  }, [])

  const hasFilters = search || category || sort !== 'newest' || page > 1

  // Reset page when filters change
  const handleSearch = (value: string) => { setSearch(value); setPage(1) }
  const handleCategory = (value: string) => { setCategory(value); setPage(1) }
  const handleSort = (value: typeof sort) => { setSort(value); setPage(1) }

  if (productsLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <ListSkeleton count={10} />
      </div>
    )
  }

  return (
    <div>
      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-full border-border/60 py-2.5 pl-10 pr-4 shadow-soft focus:shadow-hover"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-surface px-4 py-2 text-sm text-foreground-muted shadow-soft hover:bg-surface-hover"
          >
            <SlidersHorizontal className="size-4" />
            Filter
          </button>

          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground"
            >
              <X className="size-3" />
              Hapus filter
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Category filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Kategori</label>
              <Select value={category} onValueChange={handleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Urutkan</label>
              <Select value={sort} onValueChange={handleSort}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price_asc">Harga: Rendah ke Tinggi</SelectItem>
                  <SelectItem value="price_desc">Harga: Tinggi ke Rendah</SelectItem>
                  <SelectItem value="popular">Terpopuler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {totalProducts > 0 && (
        <p className="mb-4 text-sm text-foreground-muted">
          Menampilkan {productList.length} dari {totalProducts} produk
        </p>
      )}

      {/* Product Grid */}
      {productList.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-foreground-muted">Tidak ada produk ditemukan</p>
          <p className="mt-1 text-sm text-foreground-subtle">Coba ubah kata kunci atau filter</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1) }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, current, and neighbors
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - page) <= 1) return true
                  return false
                })
                .map((p, idx, arr) => (
                  <PaginationItem key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-2 text-foreground-subtle">...</span>
                    )}
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); setPage(p) }}
                    >
                      {p}
                    </PaginationLink>
                    {idx < arr.length - 1 && arr[idx + 1] !== p + 1 && (
                      <span className="px-2 text-foreground-subtle">...</span>
                    )}
                  </PaginationItem>
                ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1) }}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
