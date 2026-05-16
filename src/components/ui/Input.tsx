import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, fullWidth = true, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-10 rounded-lg border bg-surface px-4 py-2 text-sm text-foreground',
            'placeholder:text-foreground-subtle',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary',
            error && 'border-error focus:ring-error focus:border-error',
            !error && 'border-border',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-foreground-muted">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
