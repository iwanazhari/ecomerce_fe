import { cn } from '@/lib/utils'

export interface CardProps {
  className?: string
  children: React.ReactNode
  featured?: boolean
}

export function Card({ className, children, featured }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card shadow-sm',
        featured ? 'shadow-accent border-primary/20' : 'border-border',
        'card-hover',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('mb-3', className)}>{children}</div>
}

export function CardTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <h3 className={cn('text-base font-bold text-foreground tracking-tight', className)}>{children}</h3>
}

export function CardContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('text-sm text-foreground-muted', className)}>{children}</div>
}

export function CardFooter({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('mt-4 pt-3 border-t border-border', className)}>{children}</div>
}
