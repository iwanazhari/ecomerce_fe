'use client'

import { useCmsSections } from '@/hooks/useCms'
import { DynamicSection } from '@/components/home/DynamicSection'
import { useIsMobile } from '@/hooks/useIsMobile'

export function HomePage() {
  const { data: sections, isLoading } = useCmsSections('home')
  const isMobile = useIsMobile()

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        <div className="h-48 sm:h-72 rounded-xl bg-surface-hover" />
        <div className="h-10 rounded-lg bg-surface-hover" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-surface-hover" />)}
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-56 w-[140px] rounded-xl bg-surface-hover shrink-0" />)}
        </div>
      </div>
    )
  }

  const filtered = (sections ?? []).filter((s) => {
    if (!s.isActive) return false
    if (s.device === 'both') return true
    if (s.device === 'mobile') return isMobile
    if (s.device === 'desktop') return !isMobile
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-foreground-subtle text-sm">
        Belum ada section aktif. Admin dapat mengaturnya di menu CMS.
      </div>
    )
  }

  return (
    <div>
      {filtered.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
    </div>
  )
}
