'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'
import { Droplets } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <>
      <CmsPageRenderer page="forgot-password" />
      <div className="rounded-xl border border-border/60 bg-surface p-8 shadow-soft">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600">
          <Droplets className="size-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Lupa Password
        </h1>
      </div>
      <p className="text-center text-sm text-foreground-muted">
        Fitur reset password. Silakan hubungi admin jika membutuhkan bantuan.
      </p>
      <div className="mt-6 text-center">
        <Link href={ROUTES.LOGIN} className="text-sm text-primary font-medium hover:text-primary-hover">
          ← Kembali ke Login
        </Link>
      </div>
    </div>
    </>
  )
}
