'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginSchema } from '@/validators'
import { Droplets } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of parsed.error.issues) {
        const key = typeof err.path[0] === 'string' ? err.path[0] : 'general'
        fieldErrors[key] = err.message
      }
      setErrors(fieldErrors)
      return
    }

    await login.mutateAsync({ email, password })
    router.push(ROUTES.HOME)
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface p-8 shadow-soft">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600">
          <Droplets className="size-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Masuk
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">Selamat datang kembali</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="email@contoh.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={login.isPending}
        >
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Belum punya akun?{' '}
        <Link href={ROUTES.REGISTER} className="text-primary font-medium hover:text-primary-hover">
          Daftar
        </Link>
      </p>
    </div>
  )
}
