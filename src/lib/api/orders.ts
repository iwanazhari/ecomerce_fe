/**
 * Order Adapter — Express backend API → frontend types.
 *
 * Endpoints:
 * - POST   /api/orders              (create order)
 * - GET    /api/orders/my-orders    (list current user's orders)
 * - GET    /api/orders/:id          (order detail)
 * - PATCH  /api/orders/:id/cancel   (cancel order)
 */

import { api } from '@/lib/api/client'
import { mapBackendOrder } from '@/lib/api/mappers'
import { getCartItemsForOrder, clearCart } from '@/lib/api/cart'
import type { Order, OrderListParams, CreateOrderInput, ApiResponse } from '@/types'

// ─────────────────────────────────────────────
// Create Order
// ─────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<ApiResponse<Order>> {
  try {
    const cartItems = getCartItemsForOrder()

    if (cartItems.length === 0) {
      return {
        success: false,
        data: undefined as any,
        meta: { error: { code: 'EMPTY_CART', message: 'Cart is empty' } },
      } as any
    }

    // Map shipping method from input
    const shippingMethod = typeof input.shippingMethod === 'string'
      ? {
          courier: input.shippingMethod.split(' ')[0] ?? 'jne',
          service: input.shippingMethod.split(' ')[1] ?? 'REG',
          cost: input.shippingMethod ? 0 : 0,
          etd: '2-3',
        }
      : input.shippingMethod

    // Build order payload matching backend schema
    const orderPayload = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      customerName: input.fullName,
      customerEmail: input.email,
      customerPhone: input.phone,
      shippingAddress: {
        name: input.fullName,
        phone: input.phone,
        address: input.shippingAddress.addressLine,
        province: input.shippingAddress.province,
        city: input.shippingAddress.city,
        district: input.shippingAddress.city,
        postalCode: input.shippingAddress.postalCode,
      },
      shippingMethod: shippingMethod,
      paymentMethod: 'qris',
      notes: input.notes,
    }

    const result = await api.post<Record<string, unknown>>('/orders', orderPayload)

    if (!result.success || !result.data) {
      return result as any
    }

    const data = result.data as Record<string, unknown>
    const orderRaw = (data.order ?? data) as Record<string, unknown>

    // Merge items from response
    const itemsRaw = (data.items ?? orderRaw.OrderItem ?? orderRaw.items) as Record<string, unknown>[] | undefined
    if (itemsRaw) {
      orderRaw.OrderItem = itemsRaw
    }

    clearCart()

    return {
      success: true,
      data: mapBackendOrder(orderRaw),
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'ORDER_CREATE_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// List Orders (current user)
// ─────────────────────────────────────────────

export async function listOrders(
  params: OrderListParams = {},
): Promise<ApiResponse<Order[]>> {
  try {
    const result = await api.get<Record<string, unknown>>('/orders/my-orders', {
      page: 1,
      limit: params.limit ?? 20,
      ...(params.status && { status: params.status }),
    })

    if (!result.success || !result.data) {
      return { success: false, data: [], meta: result.meta } as any
    }

    const data = result.data as Record<string, unknown>
    const ordersRaw = (data.orders ?? data.items ?? []) as Record<string, unknown>[]
    const pagination = data.pagination as Record<string, unknown> | undefined

    const mapped = ordersRaw.map((o) => mapBackendOrder(o))

    return {
      success: true,
      data: mapped,
      meta: {
        total: (pagination?.total as number) ?? mapped.length,
        page: (pagination?.page as number) ?? 1,
        limit: (pagination?.limit as number) ?? 20,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: 'ORDER_LIST_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Get Order by ID / Order Number
// ─────────────────────────────────────────────

export async function getOrderByNumber(
  orderNumber: string,
): Promise<ApiResponse<Order>> {
  try {
    const result = await api.get<Record<string, unknown>>(`/orders/${orderNumber}`)

    if (!result.success || !result.data) {
      return { success: false, data: undefined as any, meta: result.meta } as any
    }

    const data = result.data as Record<string, unknown>
    const orderRaw = (data.order ?? data) as Record<string, unknown>

    return {
      success: true,
      data: mapBackendOrder(orderRaw),
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'ORDER_NOT_FOUND', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Cancel Order
// ─────────────────────────────────────────────

export async function cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const result = await api.patch<Record<string, unknown>>(`/orders/${orderId}/cancel`)

    if (!result.success || !result.data) {
      return result as any
    }

    const data = result.data as Record<string, unknown>
    const orderRaw = (data.order ?? data) as Record<string, unknown>

    return {
      success: true,
      data: mapBackendOrder(orderRaw),
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'ORDER_CANCEL_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Prepare Checkout (compatibility layer — no-op for backend)
// ─────────────────────────────────────────────

export async function prepareCheckout(
  _input: CreateOrderInput,
): Promise<ApiResponse<{ cartId: string }>> {
  // Backend creates orders directly, no cart preparation needed
  return { success: true, data: { cartId: 'local-cart' } }
}

export async function completeCheckout(
  _cartId: string,
): Promise<ApiResponse<Order>> {
  // This is handled by createOrder — this method is a no-op for compatibility
  return {
    success: false,
    data: undefined as any,
    meta: { error: { code: 'NOT_IMPLEMENTED', message: 'Use createOrder instead' } },
  } as any
}

export async function reorder(orderId: string): Promise<ApiResponse<Order>> {
  return {
    success: false,
    data: undefined as any,
    meta: { error: { code: 'NOT_IMPLEMENTED', message: 'Reorder not yet implemented' } },
  } as any
}
