'use client'

import { useState, useCallback } from 'react'
import { useUIStore } from '@/store'
import { useDebounce } from '@/hooks/useDebounce'
import { useProducts } from '@/hooks'
import { ProductCard } from '@/components/product/ProductCard'
import { X, Search } from 'lucide-react'

export default function SearchModal() {
  const isSearchOpen = useUIStore((s) => s.isSearchOpen)
  const closeSearch = useUIStore((s) => s.closeSearch)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data: products, isLoading } = useProducts({
    search: debouncedQuery || undefined,
    limit: 10,
  })

  const productList = products?.data ?? []

  const handleClose = useCallback(() => {
    closeSearch()
    setQuery('')
  }, [closeSearch])

  if (!isSearchOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-surface shadow-lg">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-5 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-foreground-muted hover:bg-surface-hover"
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4">
          {isLoading && <p className="text-center text-sm text-foreground-muted">Mencari...</p>}
          {!isLoading && query && !productList.length && (
            <p className="text-center text-sm text-foreground-muted">Tidak ada hasil</p>
          )}
          {!isLoading && productList.length ? (
            <div className="space-y-2">
              {productList.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={handleClose}
                  className="cursor-pointer rounded-lg border border-border p-3 hover:bg-surface-hover transition-colors"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
