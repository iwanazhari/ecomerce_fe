'use client'

import Script from 'next/script'
import { useEffect, useCallback, useRef } from 'react'
import { MIDTRANS } from '@/constants'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: Record<string, unknown>) => void
    }
  }
}

export function MidtransSnap({ token, onSuccess, onPending, onError, onClose }: {
  token: string
  onSuccess?: (result: Record<string, unknown>) => void
  onPending?: (result: Record<string, unknown>) => void
  onError?: (result: Record<string, unknown>) => void
  onClose?: () => void
}) {
  const hasPaid = useRef(false)

  const handlePayment = useCallback(() => {
    if (hasPaid.current || !window.snap) return
    hasPaid.current = true

    window.snap.pay(token, {
      onSuccess: (result: Record<string, unknown>) => {
        onSuccess?.(result)
      },
      onPending: (result: Record<string, unknown>) => {
        onPending?.(result)
      },
      onError: (result: Record<string, unknown>) => {
        onError?.(result)
      },
      onClose: () => {
        onClose?.()
      },
    })
  }, [token, onSuccess, onPending, onError, onClose])

  useEffect(() => {
    hasPaid.current = false
    if (window.snap) {
      handlePayment()
    }
  }, [handlePayment, token])

  return (
    <Script
      src={MIDTRANS.SNAP_URL}
      data-client-key={MIDTRANS.CLIENT_KEY}
      onLoad={handlePayment}
    />
  )
}
