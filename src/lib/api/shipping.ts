/**
 * Shipping Adapter — Express backend API → frontend types.
 *
 * Endpoints:
 * - GET  /api/expeditions               (list available couriers)
 * - GET  /api/expeditions/:id           (courier detail)
 * - POST /api/expeditions/calculate     (calculate shipping cost)
 * - POST /api/expeditions/cheapest      (find cheapest option)
 * - POST /api/expeditions/fastest       (find fastest option)
 *
 * Auth required for calculate/cheapest/fastest.
 */

import { api } from '@/lib/api/client'
import type { ShippingRate, ShippingCalculationInput, ApiResponse } from '@/types'

// ─────────────────────────────────────────────
// List Expeditions (couriers)
// ─────────────────────────────────────────────

export async function listExpeditions(): Promise<ApiResponse<Record<string, unknown>[]>> {
  try {
    const result = await api.get<Record<string, unknown>>('/expeditions')

    if (!result.success || !result.data) {
      return { success: false, data: [], meta: result.meta } as any
    }

    // Response format: { success: true, data: [...] }
    // result.data is already the array from the API
    const expeditions = Array.isArray(result.data) ? result.data : (result.data as any).data ?? []

    return { success: true, data: Array.isArray(expeditions) ? expeditions : [] }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: 'EXPEDITION_LIST_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Calculate Shipping
// ─────────────────────────────────────────────

export async function calculate(input: ShippingCalculationInput): Promise<ApiResponse<ShippingRate[]>> {
  try {
    const result = await api.post<Record<string, unknown>>('/expeditions/calculate', {
      origin: '156', // Default origin (RajaOngkir)
      destination: input.destination.postalCode,
      weight: input.items.reduce((sum, item) => sum + ((item.weight ?? 1) * item.quantity), 0),
      courier: 'jne', // Default courier; UI should let user select
    })

    if (!result.success || !result.data) {
      return { success: false, data: [], meta: result.meta } as any
    }

    const data = result.data as Record<string, unknown>
    const rates = (data.data ?? data.rates ?? data) as Record<string, unknown>[]

    const mapped: ShippingRate[] = Array.isArray(rates)
      ? rates.map((r) => ({
          courier: 'jne',
          service: (r.service as string) ?? 'REG',
          price: (r.cost as number) ?? 0,
          estimatedDays: parseInt((r.etd as string) ?? '3', 10),
        }))
      : []

    return { success: true, data: mapped }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: 'SHIPPING_CALC_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Get Cheapest Shipping
// ─────────────────────────────────────────────

export async function getCheapest(input: ShippingCalculationInput): Promise<ApiResponse<ShippingRate | null>> {
  try {
    const result = await api.post<Record<string, unknown>>('/expeditions/cheapest', {
      origin: '156',
      destination: input.destination.postalCode,
      weight: input.items.reduce((sum, item) => sum + ((item.weight ?? 1) * item.quantity), 0),
      courier: 'jne',
    })

    if (!result.success || !result.data) {
      return { success: false, data: null, meta: result.meta } as any
    }

    const data = result.data as Record<string, unknown>
    const cheapest = (data.cheapest ?? data.data) as Record<string, unknown> | undefined

    if (!cheapest) {
      return { success: true, data: null }
    }

    return {
      success: true,
      data: {
        courier: (cheapest.courier as string) ?? 'jne',
        service: (cheapest.service as string) ?? 'REG',
        price: (cheapest.cost as number) ?? 0,
        estimatedDays: parseInt((cheapest.etd as string) ?? '3', 10),
      },
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      meta: { error: { code: 'SHIPPING_CHEAPEST_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Get Fastest Shipping
// ─────────────────────────────────────────────

export async function getFastest(input: ShippingCalculationInput): Promise<ApiResponse<ShippingRate | null>> {
  try {
    const result = await api.post<Record<string, unknown>>('/expeditions/fastest', {
      origin: '156',
      destination: input.destination.postalCode,
      weight: input.items.reduce((sum, item) => sum + ((item.weight ?? 1) * item.quantity), 0),
      courier: 'jne',
    })

    if (!result.success || !result.data) {
      return { success: false, data: null, meta: result.meta } as any
    }

    const data = result.data as Record<string, unknown>
    const fastest = (data.fastest ?? data.data) as Record<string, unknown> | undefined

    if (!fastest) {
      return { success: true, data: null }
    }

    return {
      success: true,
      data: {
        courier: (fastest.courier as string) ?? 'jne',
        service: (fastest.service as string) ?? 'YES',
        price: (fastest.cost as number) ?? 0,
        estimatedDays: parseInt((fastest.etd as string) ?? '1', 10),
      },
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      meta: { error: { code: 'SHIPPING_FASTEST_FAILED', message: error.message } },
    } as any
  }
}
