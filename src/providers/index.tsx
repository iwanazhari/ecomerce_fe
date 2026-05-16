'use client'

import { QueryProvider } from './QueryProvider'
import { WebSocketProvider } from './WebSocketProvider'
import { AuthProvider } from '@/hooks/useAuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
