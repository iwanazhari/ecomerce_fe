/**
 * Notification Service — delegates to API adapter layer.
 */
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "@/lib/api";
import type {
  Notification,
  NotificationListParams,
  UnreadCount,
} from "@/types";

export const notificationService = {
  list: (params?: NotificationListParams) => listNotifications(params),
  getUnreadCount: () => getUnreadCount(),
  markRead: (id: string) => markRead(id),
  markAllRead: () => markAllRead(),
  delete: (id: string) => deleteNotification(id),
};
