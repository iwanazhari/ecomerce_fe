'use client'

import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'

export default function AddressesPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Alamat</h1>
        <Button variant="primary" size="sm">
          <Plus className="mr-1 size-4" />
          Tambah Alamat
        </Button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-indigo-600/30 bg-indigo-600/5 p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10">
                <MapPin className="size-4 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Rumah</span>
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">Utama</span>
                </div>
                <p className="mt-1 text-sm text-foreground-muted">
                  {user?.firstName} {user?.lastName}
                  <br />
                  Jl. Contoh No. 123
                  <br />
                  Jakarta, DKI Jakarta 12345
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-border/50 hover:text-foreground" aria-label="Edit">
                <Pencil className="size-4" />
              </button>
              <button className="rounded-lg p-2 text-foreground-subtle transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
