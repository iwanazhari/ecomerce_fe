import { io, type Socket } from 'socket.io-client'
import { config } from '@/config/env'
import { tokenStorage } from '@/services/api/client'

// ============================================================
// Socket.io Client Singleton
// ============================================================

let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket

  const token = tokenStorage.getAccessToken()
  console.log('[Socket] Initializing connection to:', config.wsUrl, 'Token exists:', !!token)

  socket = io(config.wsUrl, {
    autoConnect: true,
    path: '/socket.io',
    transports: ['websocket'],
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  })

  socket.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket] Connected:', socket?.id)
    }
  })

  socket.on('connect_error', () => {
    // Silently ignore — Socket.IO will retry
  })

  socket.on('disconnect', (reason) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket] Disconnected:', reason)
    }
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// ============================================================
// Socket event names
// ============================================================

export const SOCKET_EVENTS = {
  ORDER_UPDATED: 'order:updated',
  ORDER_CREATED: 'order:created',
  STOCK_UPDATED: 'stock:updated',
  STOCK_LOW: 'stock:low',
  NOTIFICATION_NEW: 'notification:new',
  CART_UPDATED: 'cart:updated',
  SHIPMENT_UPDATED: 'shipment:updated',
  PAYMENT_SUCCESS: 'payment:success',
  ADMIN_ORDER_NEW: 'admin:order:new',
  ADMIN_DASHBOARD_UPDATE: 'admin:dashboard:update',
} as const

// ============================================================
// Typed Event Listener Helper
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function onSocketEvent(event: string, handler: (data: any) => void): () => void {
  const s = getSocket()
  s.on(event, handler)
  return () => s.off(event, handler)
}
