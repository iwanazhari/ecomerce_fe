'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/constants'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'
import { Package, MapPin, Heart, Star, Bell, Settings } from 'lucide-react'

const sections = [
  { href: ROUTES.ACCOUNT_ORDERS, label: 'Pesanan Saya', desc: 'Lihat status dan riwayat pesanan', icon: Package },
  { href: ROUTES.ACCOUNT_ADDRESSES, label: 'Alamat', desc: 'Kelola alamat pengiriman', icon: MapPin },
  { href: ROUTES.ACCOUNT_WISHLIST, label: 'Wishlist', desc: 'Produk yang Anda sukai', icon: Heart },
  { href: ROUTES.ACCOUNT_LOYALTY, label: 'Loyalty Points', desc: 'Poin dan reward Anda', icon: Star },
  { href: ROUTES.ACCOUNT_NOTIFICATIONS, label: 'Notifikasi', desc: 'Update dan pengumuman', icon: Bell },
  { href: ROUTES.ACCOUNT_SETTINGS, label: 'Pengaturan', desc: 'Profil dan keamanan akun', icon: Settings },
]

export default function AccountPage() {
  const { user } = useAuth()

  return (
    <>
      <CmsPageRenderer page="account" />
      <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Akun Saya</h1>
      <p className="mt-1 text-base text-foreground-muted">Halo, {user?.firstName || user?.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border/60 bg-surface p-5 shadow-soft transition-all hover:shadow-hover"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10">
                  <Icon className="size-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{item.label}</h3>
                  <p className="mt-0.5 text-sm text-foreground-muted">{item.desc}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
    </>
  )
}
