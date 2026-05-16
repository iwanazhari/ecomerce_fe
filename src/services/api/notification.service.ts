/**
 * Notification Service — delegates to Medusa adapter layer.
 *
 * TODO: Requires custom Medusa module. Currently returns empty results.
 */
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/medusa'
import type { Notification, NotificationListParams, UnreadCount } from '@/types'

export const notificationService = {
  list: (params?: NotificationListParams) => listNotifications(params),
  getUnreadCount: () => getUnreadCount(),
  markRead: (id: string) => markNotificationRead(id),
  markAllRead: () => markAllNotificationsRead(),
  delete: (id: string) => deleteNotification(id),
}
