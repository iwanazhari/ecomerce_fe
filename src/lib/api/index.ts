/**
 * API Adapter Layer
 *
 * Wraps the Express backend REST API and transforms responses to match the frontend's expected types.
 * Import from here instead of the old Medusa layer.
 */

// Core
export { api, tokenStorage, apiRequest, checkTokenExpired } from "./client";

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
} from "./auth";

// Products & Categories
export { listProducts, getProductBySlug, getRecentlyViewed } from "./products";
export { listCategories, getCategoryBySlug } from "./products";

// Cart
export {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCartItemsForOrder,
} from "./cart";

// Orders & Checkout
export {
  createOrder,
  listOrders,
  getOrderByNumber,
  cancelOrder,
  prepareCheckout,
  completeCheckout,
  reorder,
} from "./orders";

// Payments
export {
  createSnapFromCart,
  createSnapFromOrder,
  getStatus,
  getStatus as getPaymentStatus,
  mapPaymentStatus,
} from "./payments";

// Shipping
export {
  calculate,
  calculate as calculateShipping,
  getCheapest,
  getCheapest as getCheapestShipping,
  getFastest,
  getFastest as getFastestShipping,
  listExpeditions,
} from "./shipping";

// Wishlist
export { getWishlist, addToWishlist, removeFromWishlist } from "./wishlist";

// Loyalty (stub)
export { getLoyalty, getTransactions } from "./loyalty";

// Notifications
export {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "./notifications";

// Mappers (for custom usage)
export {
  mapBackendUser,
  mapBackendProduct,
  mapBackendVariant,
  mapBackendCategory,
  mapBackendCart,
  mapBackendCartItem,
  mapBackendOrder,
  mapBackendOrderItem,
  mapBackendOrderStatus,
  mapBackendPaymentStatus,
} from "./mappers";
