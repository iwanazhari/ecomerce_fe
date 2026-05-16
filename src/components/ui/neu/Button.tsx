'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all duration-300 ease-out active:translate-y-[0.5px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-extruded hover:shadow-extruded-lg hover:-translate-y-[1px] active:shadow-inset-small active:translate-y-[0.5px]',
        secondary:
          'bg-surface text-foreground shadow-extruded hover:shadow-extruded-lg hover:-translate-y-[1px] active:shadow-inset-small active:translate-y-[0.5px]',
        ghost:
          'bg-transparent text-foreground hover:shadow-inset-small active:shadow-inset-deep',
        danger:
          'bg-error text-white shadow-extruded hover:shadow-[12px_12px_20px_rgb(239,68,68,0.3),-12px_-12px_20px_rgba(255,255,255,0.5)] hover:-translate-y-[1px] active:shadow-inset-small active:translate-y-[0.5px]',
      },
      size: {
        sm: 'h-10 px-4 text-xs',
        md: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, children, fullWidth, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="size-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
