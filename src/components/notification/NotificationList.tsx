'use client'

import { useNotifications, useMarkNotificationRead, useDeleteNotification } from '@/hooks'
import { formatRelativeTime } from '@/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Bell, Check, Trash2 } from 'lucide-react'

export default function NotificationList() {
  const { data: notifications, isLoading } = useNotifications({ limit: 50 })
  const markRead = useMarkNotificationRead()
  const deleteNotif = useDeleteNotification()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell className="mb-4 size-12 text-foreground-subtle" />
        <p className="text-sm text-foreground-muted">Belum ada notifikasi</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
            n.isRead ? 'border-border bg-surface' : 'border-primary/20 bg-primary-light'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            <Bell className="size-5 text-foreground-muted" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <Badge variant={n.isRead ? 'default' : 'primary'} size="sm">
                {n.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-foreground-muted">{n.message}</p>
            <span className="mt-1 text-[11px] text-foreground-subtle">
              {formatRelativeTime(n.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {!n.isRead && (
              <button
                onClick={() => markRead.mutate(n.id)}
                className="rounded p-1 text-foreground-subtle hover:bg-surface-hover"
                aria-label="Mark as read"
              >
                <Check className="size-4" />
              </button>
            )}
            <button
              onClick={() => deleteNotif.mutate(n.id)}
              className="rounded p-1 text-foreground-subtle hover:bg-surface-hover"
              aria-label="Delete notification"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
