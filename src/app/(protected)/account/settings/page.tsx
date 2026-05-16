'use client'

import { useState } from 'react'
import { useAuth, useUpdateProfile } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SettingsPage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Pengaturan</h1>

      <div className="mt-8 rounded-xl border border-border/60 bg-surface p-6 shadow-soft">
        <h2 className="mb-5 text-lg font-extrabold tracking-tight text-foreground">Profil</h2>
        <div className="max-w-md space-y-4">
          <Input
            label="Nama Depan"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Nama Belakang"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            label="Telepon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input label="Email" value={user?.email ?? ''} disabled />
          <Button
            variant="primary"
            isLoading={updateProfile.isPending}
            onClick={() => updateProfile.mutate({ firstName, lastName, phone })}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  )
}
