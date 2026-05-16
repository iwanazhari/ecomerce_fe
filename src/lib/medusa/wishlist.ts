/**
 * Wishlist Adapter — TODO: requires custom Medusa module.
 *
 * Wishlist is not a native Medusa feature.
 * Options:
 * 1. Create a custom Medusa module with data model + API routes
 * 2. Keep it client-side (localStorage only)
 * 3. Use a separate service/database for wishlist
 */

import type { Wishlist, WishlistItem, Product, ApiResponse } from '@/types'

// Client-side fallback using localStorage
const WISHLIST_KEY = 'wp_wishlist_product_ids'

function getProductIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
  } catch {
    return []
  }
}

function setProductIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
}

export async function getWishlist(): Promise<ApiResponse<Wishlist>> {
  // Returns empty wishlist with client-side product IDs
  return {
    success: true,
    data: {
      id: 'wishlist-local',
      userId: '',
      items: getProductIds().map((id) => ({
        id: `wishlist-item-${id}`,
        productId: id,
        product: {} as Product, // Product data would need to be fetched separately
        addedAt: new Date().toISOString(),
      })),
    },
  }
}

export async function addToWishlist(productId: string): Promise<ApiResponse<WishlistItem>> {
  const ids = getProductIds()
  if (!ids.includes(productId)) {
    ids.unshift(productId)
    setProductIds(ids)
  }
  return {
    success: true,
    data: {
      id: `wishlist-item-${productId}`,
      productId,
      product: {} as Product,
      addedAt: new Date().toISOString(),
    },
  }
}

export async function removeFromWishlist(productId: string): Promise<ApiResponse<null>> {
  const ids = getProductIds().filter((id) => id !== productId)
  setProductIds(ids)
  return { success: true, data: null }
}
