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
    autoConnect: true, // Auto-connect on getSocket() call
    path: '/socket.io', // Socket.IO default path, proxied via Nginx
    transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    auth: token ? { token } : {}, // Pass token directly in auth option
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    timeout: 20000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message, err.stack)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
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
