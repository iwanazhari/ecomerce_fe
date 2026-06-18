'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { CmsSection } from '@/types'

interface CmsResponse {
  data: CmsSection[]
}

export function useCmsSections(page = 'home') {
  return useQuery({
    queryKey: ['cms', 'sections', page],
    queryFn: async () => {
      const res = await api.get<CmsResponse>(`/cms/sections?page=${page}`)
      return res.data.data
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })
}

export async function fetchSections(page = 'home'): Promise<CmsSection[]> {
  const res = await api.get<CmsResponse>(`/cms/sections?page=${page}`)
  return res.data.data
}

interface DefaultSection {
  sectionType: string
  title: string
  content: Record<string, unknown>
}

const DEFAULT_SECTIONS: Record<string, DefaultSection[]> = {
  home: [
    { sectionType: 'hero', title: 'Hero Banner', content: { slides: [{ imageUrl: '', title: 'Waterpro Indonesia', subtitle: 'Solusi Air Bersih untuk Keluarga Indonesia sejak 1991', cta: 'Belanja Sekarang', ctaUrl: '/products' }] } },
    { sectionType: 'categories', title: 'Kategori Produk', content: { items: [{ name: 'Filter Air', slug: 'filter-air', icon: 'Droplets' }, { name: 'Pemanas Air', slug: 'pemanas-air', icon: 'Flame' }, { name: 'Aksesori', slug: 'aksesori', icon: 'Wrench' }, { name: 'Komersial', slug: 'komersial', icon: 'Building2' }] } },
    { sectionType: 'products', title: 'Produk Rekomendasi', content: { title: 'Rekomendasi untukmu', sortBy: 'newest', limit: 10 } },
    { sectionType: 'brands', title: 'Brand Partner', content: { brands: [] } },
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'FDA Approved', icon: 'BadgeCheck' }, { label: 'NSF International', icon: 'Award' }, { label: 'Halal MUI', icon: 'Medal' }] } },
  ],
  products: [
    { sectionType: 'hero', title: 'Hero Produk', content: { slides: [{ imageUrl: '', title: 'Produk Waterpro', subtitle: 'Pilih filter air terbaik untuk kebutuhan Anda', cta: 'Lihat Semua', ctaUrl: '/products' }] } },
    { sectionType: 'products', title: 'Semua Produk', content: { title: 'Semua Produk', sortBy: 'newest', limit: 12 } },
  ],
  'product-detail': [
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'FDA Approved', icon: 'BadgeCheck' }, { label: 'Halal MUI', icon: 'Medal' }] } },
  ],
  categories: [],
  features: [
    { sectionType: 'hero', title: 'Hero Fitur', content: { slides: [{ imageUrl: '', title: 'Fitur Unggulan', subtitle: 'Teknologi terbaik untuk air bersih dan sehat', cta: 'Lihat Produk', ctaUrl: '/products' }] } },
  ],
  reviews: [],
  search: [],
  cart: [
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'FDA Approved', icon: 'BadgeCheck' }] } },
  ],
  checkout: [
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'NSF International', icon: 'Award' }] } },
  ],
  login: [],
  register: [],
  account: [],
}

export async function seedDefaultSections(): Promise<{ page: string; count: number }[]> {
  const results: { page: string; count: number }[] = []

  for (const [page, sections] of Object.entries(DEFAULT_SECTIONS)) {
    let created = 0
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i]
      try {
        const res = await api.post<{ data: CmsSection }>('/admin/cms', {
          sectionType: s.sectionType,
          page,
          title: s.title,
          content: s.content,
          device: 'both',
          isActive: true,
          sortOrder: (i + 1) * 10,
        })
        const section = res.data.data
        if (section.page !== page) {
          await api.put(`/admin/cms/${section.id}`, { page })
        }
        created++
      } catch {
        // skip if already exists or error
      }
    }
    results.push({ page, count: created })
  }

  return results
}
