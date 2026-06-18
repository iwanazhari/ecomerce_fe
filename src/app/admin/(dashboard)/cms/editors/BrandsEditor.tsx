'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { SlideImageUpload } from './SlideImageUpload'
import type { CmsSection } from '@/types'

interface Brand {
  imageUrl: string
  name: string
}

const DEFAULT_BRANDS: Brand[] = [
  { name: 'Brand 1', imageUrl: '' },
  { name: 'Brand 2', imageUrl: '' },
  { name: 'Brand 3', imageUrl: '' },
  { name: 'Brand 4', imageUrl: '' },
  { name: 'Brand 5', imageUrl: '' },
  { name: 'Brand 6', imageUrl: '' },
]

export function BrandsEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as { brands?: Brand[] }
  const [brands, setBrands] = useState<Brand[]>(
    content.brands?.length ? content.brands : DEFAULT_BRANDS
  )

  const update = (idx: number, field: keyof Brand, value: string) => {
    const next = brands.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    setBrands(next)
    onChange({ brands: next })
  }

  const add = () => {
    const next = [...brands, { imageUrl: '', name: '' }]
    setBrands(next)
    onChange({ brands: next })
  }

  const remove = (idx: number) => {
    const next = brands.filter((_, i) => i !== idx)
    setBrands(next)
    onChange({ brands: next })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground-muted">Brand ({brands.length})</p>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
          <Plus className="size-3" /> Tambah Brand
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {brands.map((brand, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-foreground-subtle">Logo {idx + 1}</span>
              <button onClick={() => remove(idx)} className="rounded p-0.5 text-error hover:bg-error-light transition-colors">
                <Trash2 className="size-3" />
              </button>
            </div>
            <SlideImageUpload
              value={brand.imageUrl}
              onChange={(url) => update(idx, 'imageUrl', url)}
            />
            <input
              value={brand.name}
              onChange={(e) => update(idx, 'name', e.target.value)}
              placeholder="Nama brand"
              className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
