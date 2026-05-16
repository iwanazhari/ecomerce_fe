'use client'

import { useUnreadCount } from '@/hooks'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/constants'

export default function NotificationBell() {
  const { data: unreadCount } = useUnreadCount()

  return (
    <Link href={ROUTES.ACCOUNT_NOTIFICATIONS} className="relative inline-flex">
      <Bell className="size-5 text-foreground-muted" />
      {(unreadCount?.count ?? 0) > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
          {unreadCount!.count > 9 ? '9+' : unreadCount!.count}
        </span>
      )}
    </Link>
  )
}
