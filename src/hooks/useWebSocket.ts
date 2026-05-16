'use client'

import { useEffect, useRef, useCallback } from 'react'
import { getSocket } from '@/services/websocket/socket'

/**
 * Hook to subscribe to WebSocket events.
 */
export function useWebSocket(
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (data: any) => void,
  enabled: boolean = true,
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const subscribe = useCallback(() => {
    if (!enabled) return

    const socket = getSocket()
    if (!socket.connected) return

    socket.on(event, handlerRef.current)
    return () => {
      socket.off(event, handlerRef.current)
    }
  }, [event, enabled])

  useEffect(() => {
    const cleanup = subscribe()
    return cleanup
  }, [subscribe])
}

/**
 * Hook to get the socket instance.
 */
export function useSocketInstance() {
  return getSocket()
}
