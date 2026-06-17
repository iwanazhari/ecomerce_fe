'use client'

import type { CmsSection } from '@/types'

export function CustomEditor({
  section,
  onChange,
}: {
  section: CmsSection
  onChange: (content: Record<string, unknown>) => void
}) {
  const content = (section.content || {}) as { html?: string }

  return (
    <div>
      <label className="block text-[10px] font-semibold text-foreground-subtle mb-1">Konten HTML</label>
      <p className="text-[10px] text-foreground-subtle mb-2">Tulis HTML bebas untuk section kustom ini.</p>
      <textarea
        value={content.html || ''}
        onChange={(e) => onChange({ html: e.target.value })}
        rows={8}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
        placeholder="<div>Konten HTML di sini...</div>"
      />
    </div>
  )
}
