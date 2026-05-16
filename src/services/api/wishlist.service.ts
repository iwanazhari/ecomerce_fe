/**
 * Wishlist & Loyalty Services — delegates to Medusa adapter layer.
 */
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getLoyalty,
  getLoyaltyTransactions,
} from '@/lib/medusa'
import type { Wishlist, LoyaltyAccount, LoyaltyTransaction, LoyaltyListParams } from '@/types'

export const wishlistService = {
  get: () => getWishlist(),
  add: (productId: string) => addToWishlist(productId),
  remove: (productId: string) => removeFromWishlist(productId),
}

export const loyaltyService = {
  get: () => getLoyalty(),
  transactions: (params?: LoyaltyListParams) => getLoyaltyTransactions(params),
}
