/**
 * Payment Adapter — Medusa payment flow with Midtrans Snap.
 *
 * Flow:
 * 1. Prepare cart (email, address, shipping)
 * 2. Create Snap token via backend (using cart_id as order_id)
 * 3. Show Snap popup → user pays
 * 4. After Snap callback → call cart.complete() → creates Medusa order
 */

import { config } from '@/config/env'
import type { SnapPayment, PaymentInfo, PaymentStatus, ApiResponse } from '@/types'

// ─────────────────────────────────────────────
// Create Snap token from cart data (pre-order mode)
// ─────────────────────────────────────────────

export async function createSnapFromCart(
  cartId: string,
  grossAmount: number,
  customerDetails: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  },
): Promise<ApiResponse<SnapPayment>> {
  try {
    const response = await fetch(`${config.medusaUrl}/store/payments/dummy/snap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': config.medusaPublishableKey,
      },
      body: JSON.stringify({
        cart_id: cartId,
        gross_amount: grossAmount,
        customer_details: customerDetails,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create Snap token')
    }

    const data = await response.json()
    return {
      success: true,
      data: { token: data.token, redirectUrl: data.redirect_url },
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'SNAP_CREATE_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Get payment status from Medusa
// ─────────────────────────────────────────────

export async function getStatus(paymentId: string): Promise<ApiResponse<PaymentInfo>> {
  try {
    // Medusa doesn't expose payment by ID directly on store API
    // We'd need to find the order and check payment_status
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'NOT_IMPLEMENTED', message: 'Payment status lookup not yet implemented' } },
    } as any
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'PAYMENT_STATUS_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Helper: map Medusa payment_status to frontend PaymentStatus
// ─────────────────────────────────────────────

export function mapPaymentStatus(status?: string): PaymentStatus {
  switch (status) {
    case 'authorized':
      return 'AUTHORIZED'
    case 'captured':
      return 'PAID'
    case 'refunded':
      return 'REFUNDED'
    case 'canceled':
      return 'FAILED'
    default:
      return 'PENDING'
  }
}
