'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/neu/Button'
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Store } from 'lucide-react'
import { adminLogin as adminLoginApi } from '@/lib/medusa'
import { useQueryClient } from '@tanstack/react-query'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || ROUTES.ADMIN
  const queryClient = useQueryClient()

  const [email, setEmail] = useState('admin@waterpro.id')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await adminLoginApi({ email, password })
      if (!res.success || !res.data) {
        throw new Error((res as any).meta?.error?.message ?? 'Login gagal')
      }

      // Check role from login response user object
      const loginUser = (res.data as any).user
      const userRole = loginUser?.role

      const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_OPERASIONAL', 'ADMIN_MERCHANDISE']
      if (userRole && !adminRoles.includes(userRole)) {
        throw new Error('Akun Anda tidak memiliki akses ke dashboard admin')
      }

      // Store token as cookie for middleware
      const token = (res.data as any).tokens?.accessToken
      if (token && typeof document !== 'undefined') {
        document.cookie = `wp_access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        // Notify AuthProvider that token changed
        window.dispatchEvent(new Event('auth:token-changed'))
      }

      // Redirect to admin dashboard
      router.push(redirect)
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl shadow-[inset_4px_4px_8px_rgb(239,68,68,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] bg-error/5">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="email"
            placeholder="admin@waterpro.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-12 py-3 text-sm text-foreground placeholder:text-foreground-subtle transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={!email || !password}>
        Masuk ke Dashboard
      </Button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative concentric circles — neumorphic background art */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[600px] rounded-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] animate-[float_6s_ease-in-out_infinite]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[400px] h-[400px] rounded-full shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] animate-[float_4s_ease-in-out_infinite_reverse]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[200px] h-[200px] rounded-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] animate-[float_3s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          {/* Icon well — drilled in effect */}
          <div className="inline-flex items-center justify-center size-20 rounded-[32px] shadow-inset-deep mb-6 bg-background">
            <div className="size-12 rounded-2xl shadow-[2px_2px_4px_rgb(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,0.5)] flex items-center justify-center bg-background">
              <Lock className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="mt-2 text-foreground-muted text-sm">Masuk untuk mengelola Waterpro</p>
        </div>

        {/* Login Card */}
        <div className="bg-background rounded-[32px] shadow-extruded-xl p-8 sm:p-10">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          {/* Back to store */}
          <div className="mt-8 pt-6 border-t border-transparent">
            <div className="flex justify-center">
              <Link
                href={ROUTES.HOME}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-2xl shadow-extruded hover:shadow-extruded-lg hover:-translate-y-0.5 active:shadow-inset-small active:translate-y-0.5 transition-all duration-300 text-sm font-bold text-foreground-muted hover:text-primary"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                Kembali ke Toko
                <Store className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Password hint */}
        <p className="mt-6 text-center text-xs text-foreground-subtle">
          Demo: admin@waterpro.id / admin123
        </p>
      </div>
    </div>
  )
}
