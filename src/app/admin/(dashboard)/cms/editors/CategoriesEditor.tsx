'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { CmsSection } from '@/types'

const CATEGORY_ICONS = [
  { value: 'Droplets', label: 'Droplets (Air)' },
  { value: 'Flame', label: 'Flame (Pemanas)' },
  { value: 'Wrench', label: 'Wrench (Aksesori)' },
  { value: 'Building2', label: 'Building2 (Komersial)' },
  { value: 'ShowerHead', label: 'ShowerHead' },
  { value: 'Thermometer', label: 'Thermometer' },
  { value: 'Filter', label: 'Filter' },
  { value: 'Package', label: 'Package' },
]

interface CatItem {
  name: string
  slug: string
  icon: string
}

export function CategoriesEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as { items?: CatItem[] }
  const [items, setItems] = useState<CatItem[]>(
    content.items?.length ? content.items : [{ name: '', slug: '', icon: 'Droplets' }]
  )

  const update = (idx: number, field: keyof CatItem, value: string) => {
    const next = items.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    setItems(next)
    onChange({ items: next })
  }

  const add = () => {
    const next = [...items, { name: '', slug: '', icon: 'Droplets' }]
    setItems(next)
    onChange({ items: next })
  }

  const remove = (idx: number) => {
    if (items.length <= 1) return
    const next = items.filter((_, i) => i !== idx)
    setItems(next)
    onChange({ items: next })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground-muted">Kategori ({items.length})</p>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
          <Plus className="size-3" /> Tambah Kategori
        </button>
      </div>
      {items.map((cat, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Item {idx + 1}</span>
            {items.length > 1 && (
              <button onClick={() => remove(idx)} className="rounded p-1 text-error hover:bg-error-light transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Nama</label>
              <input
                value={cat.name}
                onChange={(e) => update(idx, 'name', e.target.value)}
                placeholder="Filter Air"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Slug</label>
              <input
                value={cat.slug}
                onChange={(e) => update(idx, 'slug', e.target.value)}
                placeholder="filter-air"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Ikon</label>
              <select
                value={cat.icon}
                onChange={(e) => update(idx, 'icon', e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary outline-none"
              >
                {CATEGORY_ICONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
