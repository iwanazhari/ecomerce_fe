/**
 * Wishlist Adapter — Express backend API → frontend types.
 *
 * The API documentation doesn't expose wishlist endpoints yet.
 * Using localStorage as fallback with API-ready interface.
 */

import type { Wishlist, WishlistItem, Product, ApiResponse } from '@/types'

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
  return {
    success: true,
    data: {
      id: 'wishlist-local',
      userId: '',
      items: getProductIds().map((id) => ({
        id: `wishlist-item-${id}`,
        productId: id,
        product: {} as Product,
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
