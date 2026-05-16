import { cn } from '@/lib/utils'

export interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Card({ className, children, hover = false, padding = 'lg' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-[32px]',
        'shadow-extruded',
        hover && 'card-hover',
        padding === 'none' && '',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-6',
        padding === 'lg' && 'p-8',
        padding === 'xl' && 'p-12',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-lg font-extrabold text-foreground tracking-tight', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mt-6 pt-6', className)}>
      {children}
    </div>
  )
}

/** Icon well — deep inset container for icons */
export function IconWell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl shadow-inset-deep',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Stat card with icon well */
export function StatCard({
  label,
  value,
  icon,
  iconGradient,
  trend,
  className,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  iconGradient?: string
  trend?: { value: number; label: string }
  className?: string
}) {
  return (
    <div className={cn('bg-surface rounded-[32px] shadow-extruded p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{label}</p>
          <p className="text-2xl font-extrabold tracking-tight text-foreground mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-bold ${trend.value >= 0 ? 'text-success' : 'text-error'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <IconWell className={cn('size-14', iconGradient || 'text-primary')}>
          {icon}
        </IconWell>
      </div>
    </div>
  )
}
