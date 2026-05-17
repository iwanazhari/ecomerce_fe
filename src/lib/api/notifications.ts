/**
 * Notifications Adapter — Express backend API → frontend types.
 *
 * The API documentation mentions notifications but doesn't expose dedicated endpoints yet.
 * WebSocket events from the backend handle real-time notifications.
 * Using stub with API-ready interface.
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
