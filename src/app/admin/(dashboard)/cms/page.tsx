'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { seedDefaultSections } from '@/hooks/useCms'
import type { CmsSection } from '@/types'
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Layout, Database, Loader2, GripVertical } from 'lucide-react'
import { HeroEditor } from './editors/HeroEditor'
import { CategoriesEditor } from './editors/CategoriesEditor'
import { ProductsEditor } from './editors/ProductsEditor'
import { BrandsEditor } from './editors/BrandsEditor'
import { CertificationEditor } from './editors/CertificationEditor'
import { CustomEditor } from './editors/CustomEditor'

const PAGES = [
  { value: 'home', label: 'Beranda' },
  { value: 'products', label: 'Produk' },
  { value: 'product-detail', label: 'Detail Produk' },
  { value: 'categories', label: 'Kategori' },
  { value: 'features', label: 'Fitur' },
  { value: 'reviews', label: 'Ulasan' },
  { value: 'search', label: 'Pencarian' },
  { value: 'cart', label: 'Keranjang' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'login', label: 'Login' },
  { value: 'register', label: 'Daftar' },
  { value: 'forgot-password', label: 'Lupa Password' },
  { value: 'reset-password', label: 'Reset Password' },
  { value: 'account', label: 'Akun' },
]

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'categories', label: 'Kategori Produk' },
  { value: 'products', label: 'Produk Rekomendasi' },
  { value: 'brands', label: 'Brand Partner' },
  { value: 'certification', label: 'Sertifikasi' },
  { value: 'custom', label: 'Custom HTML' },
]

const SECTION_EDITORS: Record<string, React.FC<{ section: CmsSection; onChange: (content: Record<string, unknown>) => void }>> = {
  hero: HeroEditor,
  categories: CategoriesEditor,
  products: ProductsEditor,
  brands: BrandsEditor,
  certification: CertificationEditor,
  custom: CustomEditor,
}

export default function CmsPage() {
  const queryClient = useQueryClient()
  const [sections, setSections] = useState<CmsSection[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, { title: string; device: string; content: Record<string, unknown> }>>({})
  const [seeding, setSeeding] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<{ data: CmsSection[] }>(`/admin/cms?page=${currentPage}`)
      setSections(res.data.data)
    } catch {}
    setLoading(false)
  }, [currentPage])

  useEffect(() => { load() }, [load])

  const toggleActive = async (section: CmsSection) => {
    await api.put(`/admin/cms/${section.id}`, { isActive: !section.isActive })
    queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] })
    load()
  }

  const remove = async (id: string) => {
    setExpandedId((prev) => (prev === id ? null : prev))
    await api.delete(`/admin/cms/${id}`)
    queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] })
    load()
  }

  const handleSeed = async () => {
    if (seeding) return
    setSeeding(true)
    const results = await seedDefaultSections()
    setSeeding(false)
    queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] })
    load()
    alert(`Default section berhasil dibuat:\n${results.filter(r => r.count > 0).map(r => `• ${r.page}: ${r.count} section`).join('\n')}`)
  }

  const add = async (sectionType: string) => {
    const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sortOrder)) + 10 : 10
    const res = await api.post<{ data: CmsSection }>('/admin/cms', {
      sectionType,
      page: currentPage,
      title: '',
      content: {},
      device: 'both',
      isActive: true,
      sortOrder: nextOrder,
    })
    const section = res.data.data
    if (section.page !== currentPage) {
      await api.put(`/admin/cms/${section.id}`, { page: currentPage })
    }
    load()
    setTimeout(() => {
      setExpandedId(section.id)
      setDrafts((prev) => ({
        ...prev,
        [section.id]: { title: '', device: 'both', content: {} },
      }))
    }, 100)
  }

  const expand = (section: CmsSection) => {
    if (expandedId === section.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(section.id)
    if (!drafts[section.id]) {
      setDrafts((prev) => ({
        ...prev,
        [section.id]: {
          title: section.title || '',
          device: section.device,
          content: (section.content as Record<string, unknown>) || {},
        },
      }))
    }
  }

  const updateDraft = (id: string, field: string, value: unknown) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const moveSection = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return
    const reordered = [...sections]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const updates = reordered.map((s, i) => ({
      id: s.id,
      sortOrder: (i + 1) * 10,
    }))
    for (const u of updates) {
      await api.put(`/admin/cms/${u.id}`, { sortOrder: u.sortOrder })
    }
    setExpandedId(null)
    setDrafts({})
    load()
  }

  const save = async (section: CmsSection) => {
    const draft = drafts[section.id]
    if (!draft) return
    const payload: Record<string, unknown> = {
      title: draft.title,
      device: draft.device,
      content: draft.content,
    }
    await api.put(`/admin/cms/${section.id}`, payload)
    setExpandedId(null)
    queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] })
    load()
  }

  if (loading) return <div className="p-6 text-foreground-muted">Loading...</div>

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Page Builder</h1>
          <p className="text-sm text-foreground-muted">Atur layout dan konten setiap halaman</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={currentPage}
              onChange={(e) => { setCurrentPage(e.target.value); setExpandedId(null); setDrafts({}); }}
              className="appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
              {PAGES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <Layout className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-foreground-subtle pointer-events-none" />
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            {seeding ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
            {seeding ? 'Menyiapkan...' : 'Seed Default'}
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
              <Plus className="size-4" /> Tambah Section
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
              <div className="rounded-xl border border-border bg-surface py-1 shadow-lg min-w-[180px]">
                {SECTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => add(t.value)}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-surface-hover transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {sections.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center text-foreground-subtle">
          Belum ada section. Klik &quot;Tambah Section&quot; untuk memulai.
        </div>
      )}

      <div className="space-y-2">
        {sections.map((section, index) => {
          const isOpen = expandedId === section.id
          const draft = drafts[section.id]
          const Editor = SECTION_EDITORS[section.sectionType]
          const label = SECTION_TYPES.find((t) => t.value === section.sectionType)?.label || section.sectionType

          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => setDragIdx(index)}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={() => { if (dragIdx !== null && dragIdx !== index) { moveSection(dragIdx, index); setDragIdx(null); } }}
              onDragEnd={() => setDragIdx(null)}
              className={`rounded-xl border border-border bg-surface shadow-soft overflow-hidden transition-opacity ${dragIdx === index ? 'opacity-50' : ''}`}
            >
              <div
                onClick={() => expand(section)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expand(section); } }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover cursor-pointer"
              >
                <div className="shrink-0 cursor-grab active:cursor-grabbing text-foreground-subtle hover:text-foreground transition-colors" onMouseDown={(e) => e.stopPropagation()}>
                  <GripVertical className="size-4" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className={`shrink-0 rounded-lg p-1.5 ${section.isActive ? 'bg-primary/10 text-primary' : 'bg-surface-hover text-foreground-subtle'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{section.sectionType === 'hero' ? 'H' : section.sectionType === 'trust_badges' ? 'TB' : section.sectionType === 'categories' ? 'C' : section.sectionType === 'products' ? 'P' : section.sectionType === 'certification' ? 'S' : '✎'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${section.isActive ? 'text-foreground' : 'text-foreground-muted'}`}>
                      {draft?.title || section.title || label}
                    </p>
                    <p className="text-[11px] text-foreground-subtle">
                      {label} · {section.device === 'both' ? 'Semua' : section.device === 'mobile' ? 'Mobile' : 'Desktop'}
                      {!section.isActive && ' · Tidak aktif'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleActive(section)}
                    className={`rounded-lg p-1.5 transition-colors ${section.isActive ? 'text-foreground-subtle hover:bg-surface-hover' : 'text-foreground-muted hover:bg-surface-hover'}`}
                    title={section.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {section.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </button>
                  <div className="flex items-center gap-0.5 pl-1 border-l border-border">
                    <span className="text-[10px] text-foreground-subtle font-mono">{section.sortOrder}</span>
                    <button onClick={() => remove(section.id)} className="rounded-lg p-1.5 text-error hover:bg-error-light transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-foreground-subtle">
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </div>
              </div>

              {isOpen && draft && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Judul Section</label>
                      <input
                        value={draft.title}
                        onChange={(e) => updateDraft(section.id, 'title', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder={label}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground-subtle mb-0.5">Tampilkan di</label>
                      <select
                        value={draft.device}
                        onChange={(e) => updateDraft(section.id, 'device', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary outline-none"
                      >
                        <option value="both">Semua Perangkat</option>
                        <option value="desktop">Desktop Saja</option>
                        <option value="mobile">Mobile Saja</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-foreground-subtle mb-2 uppercase tracking-wider">Konten</p>
                    {Editor ? (
                      <Editor
                        section={{ ...section, ...draft }}
                        onChange={(content) => updateDraft(section.id, 'content', content)}
                      />
                    ) : (
                      <p className="text-xs text-foreground-subtle italic">Tidak ada editor untuk tipe ini.</p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end border-t border-border pt-3">
                    <button
                      onClick={() => { setExpandedId(null) }}
                      className="rounded-lg border border-border px-4 py-2 text-xs text-foreground-muted hover:bg-surface-hover transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => save(section)}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
