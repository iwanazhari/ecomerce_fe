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
      primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-button hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]',
      secondary: 'bg-surface text-foreground border border-border hover:bg-surface-hover shadow-sm hover:-translate-y-0.5',
      outline: 'border border-border text-foreground hover:bg-surface-hover hover:border-primary/30',
      ghost: 'text-foreground-muted hover:bg-surface-hover hover:text-foreground',
      danger: 'bg-error text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
      default: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-button hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]',
    }

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'text-sm px-4 py-1.5 h-8 rounded-full',
      md: 'text-sm px-5 py-2 h-9 rounded-full',
      lg: 'text-base px-7 py-2.5 h-10 rounded-full',
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
