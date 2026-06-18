import { cn } from '@/lib/utils'

const variantStyles: Record<string, string> = {
  default: 'bg-muted text-foreground-muted',
  primary: 'bg-primary-light text-primary ring-1 ring-primary/10',
  success: 'bg-success-light text-success ring-1 ring-success/10',
  warning: 'bg-warning-light text-warning ring-1 ring-warning/10',
  error: 'bg-error-light text-error ring-1 ring-error/10',
}

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
}: {
  className?: string
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SectionLabel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('section-label', className)}>
      <span className="section-label-dot" />
      <span className="section-label-text">{children}</span>
    </div>
  )
}
