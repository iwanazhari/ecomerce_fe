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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const showToast = useUIStore((s) => s.showToast)

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
      <CategoryNavBar />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <SearchModal />
      <Toast />
    </div>
  )
}
