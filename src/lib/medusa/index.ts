/**
 * Medusa Adapter Layer
 *
 * Wraps the Medusa JS SDK and transforms responses to match the frontend's expected types.
 * Import from here instead of the old services when using Medusa as backend.
 */

// Core
export { medusa } from './client'

// Auth
export {
  login,
  register,
  getProfile,
  updateProfile,
  adminLogin,
  getAdminProfile,
  logout,
  refreshToken,
} from './auth'
export { tokenStorage } from './token-storage'

// Products & Categories
export { listProducts, getProductBySlug, getRecentlyViewed } from './products'
export { listCategories, getCategoryBySlug } from './products'

// Cart
export { getCart, addItem, updateItem, removeItem, clearCart } from './cart'

// Orders & Checkout
export { listOrders, getOrderByNumber, prepareCheckout, completeCheckout, createOrder, reorder } from './orders'

// Payments
export { createSnapFromCart, getStatus as getPaymentStatus, mapPaymentStatus } from './payments'

// Shipping (TODO: needs custom module)
export { calculate as calculateShipping, getCheapest as getCheapestShipping, getFastest as getFastestShipping } from './shipping'

// Wishlist (TODO: needs custom module — currently client-side fallback)
export { getWishlist, addToWishlist, removeFromWishlist } from './wishlist'

// Loyalty (TODO: needs custom module)
export { getLoyalty, getTransactions as getLoyaltyTransactions } from './loyalty'

// Notifications (TODO: needs custom module)
export {
  listNotifications,
  getUnreadCount,
  markRead as markNotificationRead,
  markAllRead as markAllNotificationsRead,
  deleteNotification,
} from './notifications'

// Mappers (for custom usage)
export {
  mapCustomerToUser,
  mapMedusaProduct,
  mapMedusaVariant,
  mapMedusaCategory,
  mapMedusaCart,
  mapMedusaCartItem,
  mapMedusaOrder,
  mapMedusaOrderItem,
  mapMedusaOrderStatus,
  mapMedusaPaymentStatus,
} from './mappers'
