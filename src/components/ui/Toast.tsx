'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

export function Toast() {
  const toast = useUIStore((s) => s.toast)
  const hideToast = useUIStore((s) => s.hideToast)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => hideToast(), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  if (!toast) return null

  const variants = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    info: 'bg-foreground text-white',
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-2"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg',
          variants[toast.type],
        )}
      >
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={hideToast}
          className="ml-auto rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Tutup notifikasi"
        >
          ×
        </button>
      </div>
    </div>
  )
}
