'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { getSocket, disconnectSocket } from '@/services/websocket/socket'
import { tokenStorage } from '@/services/api/client'

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const token = tokenStorage.getAccessToken()
    if (!token) return

    const socket = getSocket()

    // Suppress console output when the backend is down
    socket.on('connect_error', () => {
      // Intentionally empty — prevent socket.io-client from logging errors
    })
    socket.on('error', () => {
      // Intentionally empty
    })

    try {
      socket.connect()
    } catch {
      // Suppress connection errors silently
    }

    socket.on('connect', () => {
      // Connected
    })

    socket.on('disconnect', () => {
      // Disconnected
    })

    return () => {
      disconnectSocket()
    }
  }, [])

  return children
}
