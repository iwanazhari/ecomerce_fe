/**
 * Shipping Adapter — TODO: requires custom Medusa module.
 *
 * Medusa uses fulfillment providers for shipping, not a separate shipping API.
 * The current frontend expects a `/store/shipping/calculate` endpoint.
 * This would need a custom Medusa API route or module to implement.
 */

import type {
  ShippingRate,
  ShippingCalculationInput,
  ApiResponse,
} from '@/types'

export async function calculate(input: ShippingCalculationInput): Promise<ApiResponse<ShippingRate[]>> {
  return {
    success: false,
    data: [],
    meta: {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Shipping calculation requires a custom Medusa module. Medusa uses fulfillment providers instead.',
      },
    },
  } as any
}

export async function getCheapest(input: ShippingCalculationInput): Promise<ApiResponse<ShippingRate | null>> {
  return {
    success: false,
    data: null,
    meta: {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Shipping calculation requires a custom Medusa module.',
      },
    },
  } as any
}

export async function getFastest(input: ShippingCalculationInput): Promise<ApiResponse<ShippingRate | null>> {
  return {
    success: false,
    data: null,
    meta: {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Shipping calculation requires a custom Medusa module.',
      },
    },
  } as any
}
