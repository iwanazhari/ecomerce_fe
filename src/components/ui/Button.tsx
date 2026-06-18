import { forwardRef } from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none'

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-accent active:scale-[0.98]',
      secondary:
        'bg-white text-foreground border border-border hover:bg-muted hover:-translate-y-0.5 shadow-sm',
      outline:
        'border border-border text-foreground hover:border-primary/40 hover:text-primary',
      ghost:
        'text-foreground-muted hover:bg-muted hover:text-foreground',
      danger:
        'bg-error text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
      default:
        'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-accent active:scale-[0.98]',
    }

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'text-xs px-3.5 py-1.5 h-8 rounded-lg gap-1.5',
      md: 'text-sm px-5 py-2 h-10 rounded-lg',
      lg: 'text-base px-6 py-2.5 h-12 rounded-xl gap-2.5',
    }

    const Comp = asChild ? Slot.Root : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <LoaderIcon className="size-4 animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  },
)

Button.displayName = 'Button'

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="31.4 31.4" />
    </svg>
  )
}

export { Button }
