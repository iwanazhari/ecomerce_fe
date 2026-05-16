/**
 * Loyalty Adapter — TODO: requires custom Medusa module.
 *
 * Loyalty points are not a native Medusa feature.
 * Options:
 * 1. Create a custom Medusa module
 * 2. Keep client-side or use a separate service
 */

import type { LoyaltyAccount, LoyaltyTransaction, LoyaltyListParams, ApiResponse } from '@/types'

export async function getLoyalty(): Promise<ApiResponse<LoyaltyAccount>> {
  return {
    success: false,
    data: undefined as any,
    meta: {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Loyalty points requires a custom Medusa module.',
      },
    },
  } as any
}

export async function getTransactions(
  params: LoyaltyListParams = {},
): Promise<ApiResponse<LoyaltyTransaction[]>> {
  return {
    success: true,
    data: [],
    meta: { total: 0, limit: params.limit ?? 20 },
  }
}
