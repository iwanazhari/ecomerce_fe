'use client'

import type { CmsSection } from '@/types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'price_asc', label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
]

export function ProductsEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as {
    title?: string
    sortBy?: string
    limit?: number
  }

  const set = (field: string, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Judul Section</label>
          <input
            value={content.title || ''}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Rekomendasi untukmu"
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Urutan</label>
          <select
            value={content.sortBy || 'newest'}
            onChange={(e) => set('sortBy', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Jumlah Produk</label>
        <input
          type="number"
          min={1}
          max={50}
          value={content.limit || 10}
          onChange={(e) => set('limit', parseInt(e.target.value) || 10)}
          className="w-24 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
    </div>
  )
}
