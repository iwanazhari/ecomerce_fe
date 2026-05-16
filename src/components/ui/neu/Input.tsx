'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, fullWidth = true, icon: Icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 rounded-2xl bg-white px-4 text-sm text-foreground placeholder:text-foreground-muted',
              'border border-border',
              'transition-all duration-200',
              'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.04)]',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              error && 'focus:ring-error/40 border-error focus:border-error',
              Icon && 'pl-12',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error ml-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-foreground-muted ml-1">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
