'use client'

import { useState, useCallback, useEffect } from 'react'
import { useProducts, useCategories } from '@/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '@/components/product/ProductCard'
import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Product, Category } from '@/types'

const PAGE_SIZE = 12

interface ProductGridProps {
  initialProducts?: Product[]
  initialCategories?: Category[]
  initialMeta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  initialSearch?: string
  initialCategory?: string
  initialSort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}

export function ProductGrid({ 
  initialProducts = [],
  initialCategories = [],
  initialMeta,
  initialSearch = '',
  initialCategory = '',
  initialSort = 'newest'
}: ProductGridProps) {
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory || 'all')
  const [sort, setSort] = useState(initialSort)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(initialMeta?.page || 1)

  const debouncedSearch = useDebounce(search, 300)
  
  // Fetch products — uses SSR data via fallback in productList below
  const { data: products, isLoading: productsLoading } = useProducts({
    search: debouncedSearch || undefined,
    category: category !== 'all' ? category : undefined,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })
  
  const { data: categoriesData } = useCategories()
  const categories = initialCategories.length > 0 ? initialCategories : (categoriesData || [])

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setCategory('all')
    setSort('newest')
    setPage(1)
  }, [])

  // Use server-rendered data on first load, then switch to client data
  const productList = (products?.data ?? initialProducts) 
  const totalProducts = products?.meta?.total ?? initialMeta?.total ?? initialProducts.length
  const totalPages = initialMeta?.totalPages ?? Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))

  // Show skeleton only if NO initial data AND still loading
  if (productsLoading && initialProducts.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <ListSkeleton count={10} />
      </div>
    )
  }

  const hasFilters = search || category !== 'all' || sort !== 'newest' || page > 1

  // Reset page when filters change
  const handleSearch = (value: string) => { setSearch(value); setPage(1) }
  const handleCategory = (value: string) => { setCategory(value); setPage(1) }
  const handleSort = (value: typeof sort) => { setSort(value); setPage(1) }

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
                  <SelectItem value="all">Semua Kategori</SelectItem>
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
    </div>
  )
}
