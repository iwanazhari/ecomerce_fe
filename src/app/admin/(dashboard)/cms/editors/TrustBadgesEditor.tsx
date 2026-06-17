'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { CmsSection } from '@/types'

const ICON_OPTIONS = [
  { value: 'Truck', label: 'Truck (Pengiriman)' },
  { value: 'ShieldCheck', label: 'ShieldCheck (Garansi)' },
  { value: 'Clock', label: 'Clock (Cepat)' },
  { value: 'Sparkles', label: 'Sparkles (Kualitas)' },
  { value: 'Star', label: 'Star (Terbaik)' },
  { value: 'Heart', label: 'Heart (Terpercaya)' },
  { value: 'ThumbsUp', label: 'ThumbsUp' },
  { value: 'BadgeCheck', label: 'BadgeCheck' },
]

interface Badge {
  icon: string
  text: string
}

export function TrustBadgesEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as { badges?: Badge[] }
  const [badges, setBadges] = useState<Badge[]>(
    content.badges?.length ? content.badges : [{ icon: 'Truck', text: '' }]
  )

  const update = (idx: number, field: keyof Badge, value: string) => {
    const next = badges.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    setBadges(next)
    onChange({ badges: next })
  }

  const add = () => {
    const next = [...badges, { icon: 'Truck', text: '' }]
    setBadges(next)
    onChange({ badges: next })
  }

  const remove = (idx: number) => {
    if (badges.length <= 1) return
    const next = badges.filter((_, i) => i !== idx)
    setBadges(next)
    onChange({ badges: next })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground-muted">Badge ({badges.length})</p>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
          <Plus className="size-3" /> Tambah Badge
        </button>
      </div>
      {badges.map((badge, idx) => (
        <div key={idx} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
          <select
            value={badge.icon}
            onChange={(e) => update(idx, 'icon', e.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:border-primary outline-none"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            value={badge.text}
            onChange={(e) => update(idx, 'text', e.target.value)}
            placeholder="Teks badge..."
            className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          {badges.length > 1 && (
            <button onClick={() => remove(idx)} className="rounded p-1 text-error hover:bg-error-light transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
