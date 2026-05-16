/**
 * Cart Adapter — Medusa Cart API → frontend types.
 *
 * Medusa uses a cart ID stored in localStorage.
 * If no cart exists, one is created on first access.
 */

import { medusa } from '@/lib/medusa/client'
import { mapMedusaCart } from '@/lib/medusa/mappers'
import type { Cart, CartItem, AddCartItemInput, UpdateCartItemInput, ApiResponse } from '@/types'

const CART_ID_KEY = 'wp_cart_id'

function getCartId(): string | null {
  if (typeof window === 'undefined') return null
  const id = localStorage.getItem(CART_ID_KEY)
  // Guard against stale entries like "undefined" or "null"
  if (!id || id === 'undefined' || id === 'null') return null
  return id
}

function setCartId(id: string | undefined): void {
  if (typeof window === 'undefined') return
  if (!id) return
  localStorage.setItem(CART_ID_KEY, id)
}

function clearCartId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_ID_KEY)
}

// ─────────────────────────────────────────────
// Get Cart
// ─────────────────────────────────────────────

export async function getCart(): Promise<ApiResponse<Cart>> {
  try {
    const cartId = getCartId()
    if (!cartId) {
      const { cart } = await medusa.store.cart.create({})
      setCartId(cart?.id)
      return { success: true, data: mapMedusaCart(cart as unknown as Record<string, unknown>) }
    }

    const { cart } = await medusa.store.cart.retrieve(cartId, {
      fields: '*items,*items.product,*items.variant',
    })

    return { success: true, data: mapMedusaCart(cart as unknown as Record<string, unknown>) }
  } catch (error: any) {
    // If cart is invalid, create a new one
    clearCartId()
    try {
      const { cart } = await medusa.store.cart.create({})
      setCartId(cart?.id)
      return { success: true, data: mapMedusaCart(cart as unknown as Record<string, unknown>) }
    } catch (createError: any) {
      return {
        success: false,
        data: undefined as any,
        meta: { error: { code: 'CART_CREATE_FAILED', message: createError.message } },
      } as any
    }
  }
}

// ─────────────────────────────────────────────
// Add Item
// ─────────────────────────────────────────────

export async function addItem(input: AddCartItemInput): Promise<ApiResponse<Cart>> {
  try {
    let cartId = getCartId()
    if (!cartId) {
      const { cart } = await medusa.store.cart.create({})
      setCartId(cart?.id)
      cartId = cart?.id
    }

    const { cart } = await medusa.store.cart.createLineItem(cartId!, {
      variant_id: input.variantId,
      quantity: input.quantity,
    })

    return { success: true, data: mapMedusaCart(cart as unknown as Record<string, unknown>) }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'CART_ADD_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Update Item
// ─────────────────────────────────────────────

export async function updateItem(
  itemId: string,
  input: UpdateCartItemInput,
): Promise<ApiResponse<Cart>> {
  try {
    const cartId = getCartId()
    if (!cartId) {
      throw new Error('No cart found')
    }

    const { cart } = await medusa.store.cart.updateLineItem(cartId, itemId, {
      quantity: input.quantity,
    })

    return { success: true, data: mapMedusaCart(cart as unknown as Record<string, unknown>) }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'CART_UPDATE_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Remove Item
// ─────────────────────────────────────────────

export async function removeItem(itemId: string): Promise<ApiResponse<Cart>> {
  try {
    const cartId = getCartId()
    if (!cartId) {
      throw new Error('No cart found')
    }

    const { cart } = await medusa.store.cart.deleteLineItem(cartId, itemId)

    return { success: true, data: mapMedusaCart(cart as unknown as Record<string, unknown>) }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'CART_REMOVE_FAILED', message: error.message } },
    } as any
  }
}

// ─────────────────────────────────────────────
// Clear cart ID (after checkout)
// ─────────────────────────────────────────────

export function clearCart(): void {
  clearCartId()
}
