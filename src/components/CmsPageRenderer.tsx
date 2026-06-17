'use client'

import { useEffect, useState } from 'react'
import { fetchSections } from '@/hooks/useCms'
import { DynamicSection } from '@/components/home/DynamicSection'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { CmsSection } from '@/types'

export function CmsPageRenderer({ page }: { page: string }) {
  const [sections, setSections] = useState<CmsSection[] | null>(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchSections(page)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return null

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
