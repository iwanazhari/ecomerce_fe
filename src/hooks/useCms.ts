'use client'

import { api } from '@/lib/api/client'
import type { CmsSection } from '@/types'

interface CmsResponse {
  data: CmsSection[]
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
    { sectionType: 'trust_badges', title: 'Mengapa Waterpro', content: { badges: [{ icon: 'Truck', text: 'Gratis Ongkir Seluruh Indonesia' }, { icon: 'ShieldCheck', text: 'Garansi 2 Tahun' }, { icon: 'Clock', text: 'Respon Cepat 24/7' }, { icon: 'Sparkles', text: 'Kualitas Premium' }] } },
    { sectionType: 'categories', title: 'Kategori Produk', content: { items: [{ name: 'Filter Air', slug: 'filter-air', icon: 'Droplets' }, { name: 'Pemanas Air', slug: 'pemanas-air', icon: 'Flame' }, { name: 'Aksesori', slug: 'aksesori', icon: 'Wrench' }, { name: 'Komersial', slug: 'komersial', icon: 'Building2' }] } },
    { sectionType: 'products', title: 'Produk Rekomendasi', content: { title: 'Rekomendasi untukmu', sortBy: 'newest', limit: 10 } },
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'FDA Approved', icon: 'BadgeCheck' }, { label: 'NSF International', icon: 'Award' }, { label: 'Halal MUI', icon: 'Medal' }] } },
  ],
  products: [
    { sectionType: 'hero', title: 'Hero Produk', content: { slides: [{ imageUrl: '', title: 'Produk Waterpro', subtitle: 'Pilih filter air terbaik untuk kebutuhan Anda', cta: 'Lihat Semua', ctaUrl: '/products' }] } },
    { sectionType: 'trust_badges', title: 'Layanan Kami', content: { badges: [{ icon: 'Truck', text: 'Gratis Ongkir' }, { icon: 'ShieldCheck', text: 'Garansi 2 Tahun' }, { icon: 'Heart', text: 'Terpercaya' }] } },
    { sectionType: 'products', title: 'Semua Produk', content: { title: 'Semua Produk', sortBy: 'newest', limit: 12 } },
  ],
  'product-detail': [
    { sectionType: 'trust_badges', title: 'Mengapa Beli di Sini', content: { badges: [{ icon: 'ShieldCheck', text: 'Garansi Resmi 2 Tahun' }, { icon: 'Truck', text: 'Free Ongkir' }, { icon: 'Sparkles', text: 'Bergaransi' }] } },
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'FDA Approved', icon: 'BadgeCheck' }, { label: 'Halal MUI', icon: 'Medal' }] } },
  ],
  categories: [
    { sectionType: 'trust_badges', title: 'Layanan', content: { badges: [{ icon: 'Truck', text: 'Gratis Ongkir' }, { icon: 'ShieldCheck', text: 'Bergaransi' }, { icon: 'Clock', text: '24/7 Support' }] } },
  ],
  features: [
    { sectionType: 'hero', title: 'Hero Fitur', content: { slides: [{ imageUrl: '', title: 'Fitur Unggulan', subtitle: 'Teknologi terbaik untuk air bersih dan sehat', cta: 'Lihat Produk', ctaUrl: '/products' }] } },
    { sectionType: 'trust_badges', title: 'Keunggulan', content: { badges: [{ icon: 'Sparkles', text: 'Teknologi RO' }, { icon: 'ShieldCheck', text: 'UV Sterilization' }, { icon: 'Star', text: 'Smart Display' }, { icon: 'Heart', text: 'Mineral Enrichment' }] } },
  ],
  reviews: [
    { sectionType: 'trust_badges', title: 'Pelanggan Puas', content: { badges: [{ icon: 'Star', text: 'Rating 5/5' }, { icon: 'Heart', text: '500+ Pelanggan' }, { icon: 'ThumbsUp', text: '99% Puas' }] } },
  ],
  search: [
    { sectionType: 'trust_badges', title: 'Layanan', content: { badges: [{ icon: 'Truck', text: 'Gratis Ongkir' }, { icon: 'ShieldCheck', text: 'Bergaransi' }, { icon: 'Clock', text: 'Responsif' }] } },
  ],
  cart: [
    { sectionType: 'trust_badges', title: 'Jaminan Belanja', content: { badges: [{ icon: 'ShieldCheck', text: 'Pembayaran Aman' }, { icon: 'Truck', text: 'Pengiriman Cepat' }, { icon: 'RefreshCw', text: 'Mudah Dikembalikan' }] } },
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'FDA Approved', icon: 'BadgeCheck' }] } },
  ],
  checkout: [
    { sectionType: 'trust_badges', title: 'Jaminan Checkout', content: { badges: [{ icon: 'ShieldCheck', text: 'Pembayaran Aman' }, { icon: 'Truck', text: 'Pengiriman Cepat' }, { icon: 'Lock', text: 'Data Terenkripsi' }] } },
    { sectionType: 'certification', title: 'Sertifikasi', content: { items: [{ label: 'SNI Certified', icon: 'ShieldCheck' }, { label: 'NSF International', icon: 'Award' }] } },
  ],
  login: [
    { sectionType: 'trust_badges', title: 'Keamanan', content: { badges: [{ icon: 'ShieldCheck', text: 'Login Aman' }, { icon: 'Lock', text: 'Data Terenkripsi' }] } },
  ],
  register: [
    { sectionType: 'trust_badges', title: 'Keamanan', content: { badges: [{ icon: 'ShieldCheck', text: 'Pendaftaran Aman' }, { icon: 'Lock', text: 'Data Terenkripsi' }] } },
  ],
  account: [
    { sectionType: 'trust_badges', title: 'Akun', content: { badges: [{ icon: 'ShieldCheck', text: 'Akun Aman' }, { icon: 'Heart', text: 'Loyalty Points' }, { icon: 'Clock', text: 'Riwayat Pesanan' }] } },
  ],
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
