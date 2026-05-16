import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { XCircle, Home } from 'lucide-react'

export default function PaymentErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-xl border border-border/60 bg-surface p-10 text-center shadow-soft">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-error-light">
          <XCircle className="size-10 text-error" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-foreground tracking-tight">Pembayaran Gagal</h1>
        <p className="mt-3 text-foreground-muted leading-relaxed">
          Terjadi masalah saat memproses pembayaran Anda. Silakan coba lagi atau hubungi kami.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={ROUTES.HOME}>
            <Button variant="primary" fullWidth className="shadow-button">
              <Home className="mr-2 size-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href={ROUTES.PRODUCTS}>
            <Button variant="secondary" fullWidth>
              Kembali Belanja
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
