'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      inputRef.current?.blur()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-2xl mx-2 sm:mx-4">
      <div
        className={`
          flex items-center gap-2 rounded-full border transition-all duration-200
          ${isFocused
            ? 'border-primary bg-white shadow-md shadow-primary/10'
            : 'border-border/60 bg-surface/80 shadow-soft hover:shadow-hover'
          }
        `}
      >
        <Search className="ml-4 size-4 shrink-0 text-foreground-subtle" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Cari produk di Waterpro..."
          className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
          aria-label="Cari produk"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mr-2 rounded-full p-1 text-foreground-subtle hover:bg-surface-hover hover:text-foreground transition-colors"
            aria-label="Hapus pencarian"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </form>
  )
}
