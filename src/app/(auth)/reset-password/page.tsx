import { CmsPageRenderer } from '@/components/CmsPageRenderer'
import { Droplets } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <>
      <CmsPageRenderer page="reset-password" />
      <div className="rounded-xl border border-border/60 bg-surface p-8 shadow-soft">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600">
          <Droplets className="size-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">Masukkan token dan password baru Anda.</p>
      </div>
    </div>
    </>
  )
}
