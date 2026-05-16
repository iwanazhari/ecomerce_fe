/**
 * Order & Checkout Adapter — Medusa Order API → frontend types.
 *
 * Flow:
 * 1. Prepare cart (email, address, shipping)
 * 2. Initialize payment session (creates pending payment)
 * 3. Complete cart → creates Order
 * 4. Retrieve payment collection → get Snap token
 */

import { medusa } from '@/lib/medusa/client'
import { mapMedusaOrder } from '@/lib/medusa/mappers'
import type { Order, OrderListParams, CreateOrderInput, ApiResponse } from '@/types'
import { getCart, clearCart } from '@/lib/medusa/cart'

// ─────────────────────────────────────────────
// List Orders
// ─────────────────────────────────────────────

export async function listOrders(
  params: OrderListParams = {},
): Promise<ApiResponse<Order[]>> {
  try {
    const { orders, count } = await medusa.store.order.list({
      limit: params.limit ?? 20,
      offset: 0,
      fields: '*items,*items.product,*items.variant',
    })

    const mapped = orders.map((o: Record<string, unknown>) => mapMedusaOrder(o))

    return {
      success: true,
      data: mapped,
      meta: { total: count ?? orders.length, limit: params.limit ?? 20 },
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
// Get Order by ID (or order number)
// ─────────────────────────────────────────────

export async function getOrderByNumber(
  orderNumber: string,
): Promise<ApiResponse<Order>> {
  try {
    // Medusa uses order ID, not order number
    // Try to find by ID first, then fall back to searching
    const order = await medusa.store.order.retrieve(orderNumber, {
      fields: '*items,*items.product,*items.variant,*shipping_methods',
    })

    return {
      success: true,
      data: mapMedusaOrder(order as unknown as Record<string, unknown>),
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
// Prepare Cart for Checkout
// Returns cart ID for the next step (initialize payment)
// ─────────────────────────────────────────────

export async function prepareCheckout(
  input: CreateOrderInput,
): Promise<ApiResponse<{ cartId: string }>> {
  try {
    const cartResponse = await getCart()
    if (!cartResponse.success || !cartResponse.data) {
      throw new Error('Cart not found')
    }

    const cartId = cartResponse.data.id

    // 1. Update cart with customer info and shipping/billing address
    await medusa.store.cart.update(cartId, {
      email: input.email,
      shipping_address: {
        first_name: input.fullName,
        last_name: '',
        phone: input.phone,
        address_1: input.shippingAddress.addressLine,
        city: input.shippingAddress.city,
        province: input.shippingAddress.province,
        postal_code: input.shippingAddress.postalCode,
        country_code: 'id',
      },
      billing_address: {
        first_name: input.fullName,
        last_name: '',
        phone: input.phone,
        address_1: input.shippingAddress.addressLine,
        city: input.shippingAddress.city,
        province: input.shippingAddress.province,
        postal_code: input.shippingAddress.postalCode,
        country_code: 'id',
      },
    })

    // 2. Add shipping method
    const shippingOptions = await medusa.store.fulfillment.listCartOptions({
      cart_id: cartId,
    })
    const option = shippingOptions.shipping_options?.[0]
    if (!option) {
      throw new Error('No shipping options available')
    }

    await medusa.store.cart.addShippingMethod(cartId, {
      option_id: option.id,
    })

    return { success: true, data: { cartId } }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'CHECKOUT_PREPARE_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Complete Checkout (creates order from prepared cart)
// ─────────────────────────────────────────────

export async function completeCheckout(
  cartId: string,
): Promise<ApiResponse<Order>> {
  try {
    const cart = await medusa.store.cart.complete(cartId)

    if (!cart || !('order' in cart) || !cart.order) {
      throw new Error('Order not created after checkout completion')
    }

    const order = mapMedusaOrder(cart.order as unknown as Record<string, unknown>)
    clearCart()

    return { success: true, data: order }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'CHECKOUT_COMPLETE_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Create Order (legacy — calls prepare + complete in one shot)
// ─────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput,
): Promise<ApiResponse<Order>> {
  // Step 1: Prepare cart
  const prepResult = await prepareCheckout(input)
  if (!prepResult.success || !prepResult.data) {
    return {
      success: false,
      data: undefined as any,
      meta: prepResult.meta,
    } as any
  }

  // Step 2: Complete checkout
  return completeCheckout(prepResult.data.cartId)
}

// ─────────────────────────────────────────────
// Reorder (add all items from previous order to cart)
// ─────────────────────────────────────────────

export async function reorder(orderId: string): Promise<ApiResponse<Order>> {
  // TODO: Implement reorder by adding items from previous order to cart
  return {
    success: false,
    data: undefined as any,
    meta: { error: { code: 'NOT_IMPLEMENTED', message: 'Reorder not yet implemented' } },
  } as any
}
