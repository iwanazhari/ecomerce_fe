/**
 * Notifications Adapter — TODO: requires custom Medusa module.
 *
 * Notifications are not a native Medusa feature.
 * Options:
 * 1. Create a custom Medusa module with Event Bus + API routes
 * 2. Use Server-Sent Events or polling with a custom module
 * 3. Keep WebSocket with a separate service (current approach)
 */

import type { Notification, NotificationListParams, UnreadCount, ApiResponse } from '@/types'

export async function listNotifications(
  params: NotificationListParams = {},
): Promise<ApiResponse<Notification[]>> {
  return {
    success: true,
    data: [],
    meta: { total: 0, limit: params.limit ?? 20 },
  }
}

export async function getUnreadCount(): Promise<ApiResponse<UnreadCount>> {
  return { success: true, data: { count: 0 } }
}

export async function markRead(id: string): Promise<ApiResponse<null>> {
  return { success: true, data: null }
}

export async function markAllRead(): Promise<ApiResponse<null>> {
  return { success: true, data: null }
}

export async function deleteNotification(id: string): Promise<ApiResponse<null>> {
  return { success: true, data: null }
}
