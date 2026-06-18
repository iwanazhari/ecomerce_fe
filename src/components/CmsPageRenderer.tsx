'use client'

import { useCmsSections } from '@/hooks/useCms'
import { DynamicSection } from '@/components/home/DynamicSection'
import { useIsMobile } from '@/hooks/useIsMobile'

export function CmsPageRenderer({ page }: { page: string }) {
  const { data: sections, isLoading } = useCmsSections(page)
  const isMobile = useIsMobile()

  if (isLoading) return null

  const filtered = (sections ?? []).filter((s) => {
    if (!s.isActive) return false
    if (s.device === 'both') return true
    if (s.device === 'mobile') return isMobile
    if (s.device === 'desktop') return !isMobile
    return true
  })

  if (filtered.length === 0) return null

  return (
    <>
      {filtered.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
    </>
  )
}
