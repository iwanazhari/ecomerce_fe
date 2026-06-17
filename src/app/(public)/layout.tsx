'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store'
import { getSocket } from '@/services/websocket/socket'
import { SOCKET_EVENTS } from '@/constants'
import { Header, Footer } from '@/components/layout'
import { CategoryNavBar } from '@/components/layout/CategoryNavBar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { CartDrawer } from '@/components/cart'
import SearchModal from '@/components/search/SearchModal'
import { Toast } from '@/components/ui'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const showToast = useUIStore((s) => s.showToast)
  const isMobile = useIsMobile()

  useEffect(() => {
    const socket = getSocket()
    if (!socket.connected) return

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (data) => {
      showToast(data.title, 'info')
    })

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW)
    }
  }, [showToast])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {!isMobile && <CategoryNavBar />}
      <main className="flex-1" style={{ paddingBottom: isMobile ? '4rem' : '0' }}>
        {children}
      </main>
      {!isMobile && <Footer />}
      {isMobile && <MobileBottomNav />}
      <CartDrawer />
      <SearchModal />
      <Toast />
    </div>
  )
}
