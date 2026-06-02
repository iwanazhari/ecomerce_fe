/**
 * Wishlist Adapter — Express backend API → frontend types.
 *
 * Uses Express backend /wishlist endpoints when authenticated.
 * Falls back to localStorage for unauthenticated users.
 */

import { api } from '@/lib/api/client'
import { tokenStorage } from '@/lib/api/client'
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

function isAuthenticated(): boolean {
  return !!tokenStorage.getAccessToken()
}

function mapBackendWishlistItem(item: Record<string, unknown>): WishlistItem {
  const productRaw = (item.product ?? item) as Record<string, unknown>
  const images = (productRaw.ProductImage ?? []) as Record<string, unknown>[]
  const name = (productRaw.name as string) ?? ""
  return {
    id: (item.id as string) ?? `wi-${productRaw.id}`,
    productId: (item.productId as string) ?? (productRaw.id as string) ?? "",
    product: {
      id: (productRaw.id as string) ?? "",
      name,
      slug: (productRaw.slug as string) ?? "",
      description: null,
      shortDescription: null,
      thumbnail: images.length > 0 ? (images[0].url as string) : undefined,
      status: (productRaw.status as Product['status']) ?? "draft",
      brand: null,
      weight: null,
      isActive: (productRaw.status as string) === "active",
      categories: [],
      variants: [],
      images: images.map((img: any, i: number) => ({
        id: img.id ?? `img-${i}`,
        url: img.url ?? "",
        alt: img.altText ?? null,
        sortOrder: img.position ?? i,
        isPrimary: i === 0 || img.isPrimary === true,
      })),
      createdAt: (productRaw.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (productRaw.updatedAt as string) ?? new Date().toISOString(),
    } as Product,
    addedAt: (item.addedAt as string) ?? (item.createdAt as string) ?? new Date().toISOString(),
  }
}

export async function getWishlist(): Promise<ApiResponse<Wishlist>> {
  // Try Express backend if authenticated
  if (isAuthenticated()) {
    try {
      const result = await api.get<Record<string, unknown>[]>('/wishlist')
      if (result.success && result.data) {
        const items = Array.isArray(result.data)
          ? result.data.map((item: any) => mapBackendWishlistItem(item))
          : []
        return {
          success: true,
          data: {
            id: 'wishlist-server',
            userId: '',
            items,
          },
        }
      }
    } catch {
      // Fallback to localStorage on error
    }
  }

  // localStorage fallback
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
  // Try Express backend if authenticated
  if (isAuthenticated()) {
    try {
      const result = await api.post<Record<string, unknown>>(`/wishlist/${productId}`)
      if (result.success && result.data) {
        const data = result.data as Record<string, unknown>
        return {
          success: true,
          data: mapBackendWishlistItem(data),
        }
      }
    } catch {
      // Fallback to localStorage on error
    }
  }

  // localStorage fallback
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
  // Try Express backend if authenticated
  if (isAuthenticated()) {
    try {
      const result = await api.delete<Record<string, unknown>>(`/wishlist/${productId}`)
      if (result.success) {
        return { success: true, data: null }
      }
    } catch {
      // Fallback to localStorage on error
    }
  }

  // localStorage fallback
  const ids = getProductIds().filter((id) => id !== productId)
  setProductIds(ids)
  return { success: true, data: null }
}
