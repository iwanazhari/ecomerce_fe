import { cn } from '@/lib/utils'

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-surface text-foreground shadow-inset-small',
    success: 'bg-success text-white shadow-[2px_2px_4px_rgb(56,178,172,0.3),-2px_-2px_4px_rgba(255,255,255,0.2)]',
    warning: 'bg-warning text-white shadow-[2px_2px_4px_rgb(245,158,11,0.3),-2px_-2px_4px_rgba(255,255,255,0.2)]',
    error: 'bg-error text-white shadow-[2px_2px_4px_rgb(239,68,68,0.3),-2px_-2px_4px_rgba(255,255,255,0.2)]',
    info: 'bg-primary text-white shadow-[2px_2px_4px_rgb(108,99,255,0.3),-2px_-2px_4px_rgba(255,255,255,0.2)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
