'use client'

import { Button } from '@/components/ui/Button'
import NotificationList from '@/components/notification/NotificationList'
import { useMarkAllNotificationsRead } from '@/hooks'

export default function NotificationsPage() {
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Notifikasi</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          isLoading={markAllRead.isPending}
        >
          Tandai Semua Dibaca
        </Button>
      </div>
      <NotificationList />
    </div>
  )
}
