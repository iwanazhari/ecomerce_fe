/**
 * Loyalty Adapter — stub.
 *
 * Loyalty points are not exposed by the backend API yet.
 */

import type { LoyaltyAccount, LoyaltyTransaction, LoyaltyListParams, ApiResponse } from '@/types'

export async function getLoyalty(): Promise<ApiResponse<LoyaltyAccount>> {
  return {
    success: false,
    data: undefined as any,
    meta: {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Loyalty points not yet available via the backend API.',
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
