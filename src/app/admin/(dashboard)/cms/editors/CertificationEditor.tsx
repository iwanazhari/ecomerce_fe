'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { CmsSection } from '@/types'

const CERT_ICONS = [
  { value: 'ShieldCheck', label: 'ShieldCheck' },
  { value: 'BadgeCheck', label: 'BadgeCheck' },
  { value: 'Award', label: 'Award' },
  { value: 'Medal', label: 'Medal' },
  { value: 'Verified', label: 'Verified' },
  { value: 'FileCheck', label: 'FileCheck' },
]

interface CertItem {
  label: string
  icon: string
}

export function CertificationEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as { items?: CertItem[] }
  const [items, setItems] = useState<CertItem[]>(
    content.items?.length ? content.items : [{ label: '', icon: 'ShieldCheck' }]
  )

  const update = (idx: number, field: keyof CertItem, value: string) => {
    const next = items.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    setItems(next)
    onChange({ items: next })
  }

  const add = () => {
    const next = [...items, { label: '', icon: 'ShieldCheck' }]
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
        <p className="text-xs font-semibold text-foreground-muted">Sertifikasi ({items.length})</p>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
          <Plus className="size-3" /> Tambah
        </button>
      </div>
      {items.map((cert, idx) => (
        <div key={idx} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
          <select
            value={cert.icon}
            onChange={(e) => update(idx, 'icon', e.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:border-primary outline-none"
          >
            {CERT_ICONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            value={cert.label}
            onChange={(e) => update(idx, 'label', e.target.value)}
            placeholder="SNI Certified"
            className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          {items.length > 1 && (
            <button onClick={() => remove(idx)} className="rounded p-1 text-error hover:bg-error-light transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
