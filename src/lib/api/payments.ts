/**
 * Payment Adapter — Express backend API → frontend types.
 *
 * Endpoints:
 * - POST /api/payments              (create payment, returns Snap token)
 * - POST /api/payments/webhooks/midtrans  (webhook, handled by backend)
 */

import { api } from '@/lib/api/client'
import type { SnapPayment, PaymentInfo, PaymentStatus, ApiResponse } from '@/types'

// ─────────────────────────────────────────────
// Create Snap payment from order
// ─────────────────────────────────────────────

export async function createSnapFromOrder(
  orderId: string,
  amount: number,
  paymentType: 'qris' | 'gopay' | 'bank_transfer' | 'credit_card' = 'qris',
): Promise<ApiResponse<SnapPayment>> {
  try {
    const result = await api.post<Record<string, unknown>>('/payments', {
      orderId,
      amount,
      paymentType,
    })

    if (!result.success || !result.data) {
      return result as any
    }

    const data = result.data as Record<string, unknown>
    const snapToken = (data.snapToken ?? data.token) as string | undefined

    if (!snapToken) {
      return {
        success: false,
        data: undefined as any,
        meta: { error: { code: 'SNAP_CREATE_FAILED', message: 'No Snap token returned' } },
      } as any
    }

    return {
      success: true,
      data: {
        token: snapToken,
        redirectUrl: (data.redirectUrl as string) ?? '',
      },
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'SNAP_CREATE_FAILED', message: error.message } },
    } as any
  }
}

// Compatibility alias — cart-based flow maps to order-based flow
export async function createSnapFromCart(
  _cartId: string,
  grossAmount: number,
  _customerDetails: unknown,
): Promise<ApiResponse<SnapPayment>> {
  // This is called after order creation, so we need the order ID
  // The checkout flow should call createSnapFromOrder instead
  return {
    success: false,
    data: undefined as any,
    meta: { error: { code: 'NOT_IMPLEMENTED', message: 'Use createSnapFromOrder after creating the order' } },
  } as any
}

// ─────────────────────────────────────────────
// Get payment status
// ─────────────────────────────────────────────

export async function getStatus(paymentId: string): Promise<ApiResponse<PaymentInfo>> {
  // Backend doesn't expose a dedicated payment status endpoint
  // Status is retrieved from the order detail
  return {
    success: false,
    data: undefined as any,
    meta: { error: { code: 'NOT_IMPLEMENTED', message: 'Payment status is retrieved from order detail' } },
  } as any
}

// ─────────────────────────────────────────────
// Map backend payment status to frontend enum
// ─────────────────────────────────────────────

export function mapPaymentStatus(status?: string): PaymentStatus {
  switch (status) {
    case 'PAID':
    case 'settlement':
      return 'PAID'
    case 'AUTHORIZED':
      return 'AUTHORIZED'
    case 'FAILED':
    case 'deny':
    case 'expire':
    case 'cancel':
      return 'FAILED'
    case 'REFUNDED':
      return 'REFUNDED'
    case 'PENDING':
    case 'pending':
    default:
      return 'PENDING'
  }
}
