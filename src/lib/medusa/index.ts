/**
 * Backward-compatibility barrel — re-exports from the new lib/api layer.
 *
 * All imports from '@/lib/medusa' now resolve to '@/lib/api'.
 * The old Medusa SDK layer has been removed.
 */

// Core — alias 'api' as 'medusa' for backward compat
export {
  api as medusa,
  tokenStorage,
  apiRequest,
  checkTokenExpired,
} from "@/lib/api";

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
} from "@/lib/api";

// Products & Categories
export { listProducts, getProductBySlug, getRecentlyViewed } from "@/lib/api";
export { listCategories, getCategoryBySlug } from "@/lib/api";

// Cart
export {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCartItemsForOrder,
} from "@/lib/api";

// Orders & Checkout
export {
  createOrder,
  listOrders,
  getOrderByNumber,
  cancelOrder,
  prepareCheckout,
  completeCheckout,
  reorder,
} from "@/lib/api";

// Payments (lib/api exports getStatus and getPaymentStatus)
export {
  createSnapFromCart,
  createSnapFromOrder,
  getStatus,
  getPaymentStatus,
  mapPaymentStatus,
} from "@/lib/api";

// Shipping (lib/api exports both original and renamed)
export {
  calculate,
  calculateShipping,
  getCheapest,
  getCheapestShipping,
  getFastest,
  getFastestShipping,
  listExpeditions,
} from "@/lib/api";

// Wishlist
export { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api";

// Loyalty (already renamed in lib/api)
export { getLoyalty, getTransactions } from "@/lib/api";

// Notifications (already has original names in lib/api)
export {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "@/lib/api";

// Mappers — alias names for backward compat
export {
  mapBackendUser as mapCustomerToUser,
  mapBackendProduct as mapMedusaProduct,
  mapBackendVariant as mapMedusaVariant,
  mapBackendCategory as mapMedusaCategory,
  mapBackendCart as mapMedusaCart,
  mapBackendCartItem as mapMedusaCartItem,
  mapBackendOrder as mapMedusaOrder,
  mapBackendOrderItem as mapMedusaOrderItem,
  mapBackendOrderStatus as mapMedusaOrderStatus,
  mapBackendPaymentStatus as mapMedusaPaymentStatus,
} from "@/lib/api";
