'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRegister } from '@/hooks'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'
import { registerSchema } from '@/validators'
import { Droplets } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const parsed = registerSchema.safeParse({
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      password: form.password,
    })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of parsed.error.issues) {
        const key = typeof err.path[0] === 'string' ? err.path[0] : 'general'
        fieldErrors[key] = err.message
      }
      setErrors(fieldErrors)
      return
    }

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Password tidak cocok' })
      return
    }

    await register.mutateAsync({
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      password: form.password,
    })
    router.push(ROUTES.HOME)
  }

  return (
    <>
      <CmsPageRenderer page="register" />
      <div className="rounded-xl border border-border/60 bg-surface p-8 shadow-soft">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600">
          <Droplets className="size-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Daftar
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">Buat akun baru untuk memulai</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nama Depan"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
          <Input
            label="Nama Belakang"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="email@contoh.com"
          autoComplete="email"
        />
        <Input
          label="Telepon"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="08123456789"
          autoComplete="tel"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <Input
          label="Konfirmasi Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={register.isPending}
        >
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Sudah punya akun?{' '}
        <Link href={ROUTES.LOGIN} className="text-primary font-medium hover:text-primary-hover">
          Masuk
        </Link>
      </p>
    </div>
    </>
  )
}
