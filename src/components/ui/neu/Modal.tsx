'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onOpenChange, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal */}
      <div
        className={cn(
          'relative w-full rounded-[32px] bg-surface shadow-extruded-xl p-8',
          sizes[size],
          'max-h-[90vh] overflow-y-auto',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{title}</h2>
          )}
          <button
            onClick={() => onOpenChange(false)}
            className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-foreground active:shadow-inset-deep transition-all"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        {/* Content */}
        {children}
      </div>
    </div>
  )
}
