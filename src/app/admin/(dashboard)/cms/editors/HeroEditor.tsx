'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { SlideImageUpload } from './SlideImageUpload'
import type { CmsSection } from '@/types'

interface Slide {
  imageUrl: string
  title: string
  subtitle: string
  cta: string
  ctaUrl: string
}

export function HeroEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as { slides?: Slide[] }
  const [slides, setSlides] = useState<Slide[]>(
    content.slides?.length ? content.slides : [{ imageUrl: '', title: '', subtitle: '', cta: '', ctaUrl: '' }]
  )

  const update = (idx: number, field: keyof Slide, value: string) => {
    const next = slides.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    setSlides(next)
    onChange({ slides: next })
  }

  const add = () => {
    const next = [...slides, { imageUrl: '', title: '', subtitle: '', cta: '', ctaUrl: '' }]
    setSlides(next)
    onChange({ slides: next })
  }

  const remove = (idx: number) => {
    if (slides.length <= 1) return
    const next = slides.filter((_, i) => i !== idx)
    setSlides(next)
    onChange({ slides: next })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground-muted">Slide Hero ({slides.length})</p>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
          <Plus className="size-3" /> Tambah Slide
        </button>
      </div>
      {slides.map((slide, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Slide {idx + 1}</span>
            {slides.length > 1 && (
              <button onClick={() => remove(idx)} className="rounded p-1 text-error hover:bg-error-light transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Gambar</label>
              <SlideImageUpload
                value={slide.imageUrl}
                onChange={(url) => update(idx, 'imageUrl', url)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Judul</label>
              <input
                value={slide.title}
                onChange={(e) => update(idx, 'title', e.target.value)}
                placeholder="Judul banner"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Subjudul</label>
              <input
                value={slide.subtitle}
                onChange={(e) => update(idx, 'subtitle', e.target.value)}
                placeholder="Subjudul banner"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Tombol CTA</label>
              <input
                value={slide.cta}
                onChange={(e) => update(idx, 'cta', e.target.value)}
                placeholder="Belanja Sekarang"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">URL CTA</label>
              <input
                value={slide.ctaUrl}
                onChange={(e) => update(idx, 'ctaUrl', e.target.value)}
                placeholder="/products"
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
