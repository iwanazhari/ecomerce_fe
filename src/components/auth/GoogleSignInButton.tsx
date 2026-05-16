'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useGoogleLogin } from '@/hooks/useAuth'
import { config } from '@/config/env'
import { cn } from '@/lib/utils'

// Google Identity Services type declarations
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token: string; error?: string }) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GoogleSignInButton({
  className,
  variant = 'default',
  size = 'md',
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const googleLogin = useGoogleLogin()
  const router = useRouter()

  const handleGoogleLogin = () => {
    if (!window.google) {
      console.error('Google Identity Services not loaded')
      onError?.('Google SDK tidak tersedia')
      return
    }

    setIsLoading(true)

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: config.googleClientId,
      scope: 'email profile',
      callback: async (response) => {
        if (response.error) {
          setIsLoading(false)
          onError?.(response.error)
          return
        }

        try {
          await googleLogin.mutateAsync({
            idToken: response.access_token,
          })
          onSuccess?.()
          router.push('/')
          router.refresh()
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Login Google gagal'
          onError?.(message)
        } finally {
          setIsLoading(false)
        }
      },
    })

    client.requestAccessToken()
  }

  const variantClasses = {
    default: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading || googleLogin.isPending}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {/* Google SVG icon */}
      <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {isLoading || googleLogin.isPending ? 'Memproses...' : 'Masuk dengan Google'}
    </button>
  )
}
