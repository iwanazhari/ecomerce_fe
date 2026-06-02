// ============================================================
// API Paths
// ============================================================

export const API = {
  // Auth
  AUTH: {
    LOGIN: '/store/auth/login',
    REGISTER: '/store/auth/register',
    REFRESH: '/store/auth/refresh',
    LOGOUT: '/store/auth/logout',
    CHANGE_PASSWORD: '/store/auth/change-password',
    GOOGLE: '/store/auth/google',
    GOOGLE_URL: '/store/auth/google/url',
  },

  // User
  USER: {
    PROFILE: '/store/user/profile',
    ADDRESSES: '/store/user/addresses',
    ADDRESS: (id: string) => `/store/user/addresses/${id}`,
  },

  // Products
  PRODUCTS: {
    LIST: '/store/products',
    DETAIL: (slug: string) => `/store/products/${slug}`,
    RECENTLY_VIEWED: '/store/products/recently-viewed',
  },

  // Categories
  CATEGORIES: {
    LIST: '/store/categories',
    DETAIL: (slug: string) => `/store/categories/${slug}`,
  },

  // Cart
  CART: {
    GET: '/store/cart',
    ADD_ITEM: '/store/cart/items',
    UPDATE_ITEM: (itemId: string) => `/store/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/store/cart/items/${itemId}`,
  },

  // Checkout
  CHECKOUT: {
    CREATE_ORDER: '/store/checkout',
  },

  // Orders
  ORDERS: {
    LIST: '/store/orders',
    DETAIL: (orderNumber: string) => `/store/orders/${orderNumber}`,
    REORDER: (orderId: string) => `/store/orders/${orderId}/reorder`,
  },

  // Wishlist
  WISHLIST: {
    GET: '/store/wishlist',
    ADD: (productId: string) => `/store/wishlist/${productId}`,
    REMOVE: (productId: string) => `/store/wishlist/${productId}`,
  },

  // Loyalty
  LOYALTY: {
    GET: '/store/loyalty',
    TRANSACTIONS: '/store/loyalty/transactions',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/store/notifications',
    UNREAD_COUNT: '/store/notifications/unread-count',
    MARK_READ: (id: string) => `/store/notifications/${id}/read`,
    READ_ALL: '/store/notifications/read-all',
    DELETE: (id: string) => `/store/notifications/${id}`,
  },

  // Payments
  PAYMENTS: {
    SNAP: (paymentId: string) => `/store/payments/${paymentId}/snap`,
    STATUS: (paymentId: string) => `/store/payments/${paymentId}/status`,
  },

  // Shipping
  SHIPPING: {
    CALCULATE: '/store/shipping/calculate',
    CHEAPEST: '/store/shipping/cheapest',
    FASTEST: '/store/shipping/fastest',
  },
} as const

// ============================================================
// Socket Events
// ============================================================

export const SOCKET_EVENTS = {
  // Incoming
  ORDER_UPDATED: 'order:updated',
  ORDER_CREATED: 'order:created',
  STOCK_UPDATED: 'stock:updated',
  STOCK_LOW: 'stock:low',
  NOTIFICATION_NEW: 'notification:new',
  CART_UPDATED: 'cart:updated',
  SHIPMENT_UPDATED: 'shipment:updated',

  // Admin socket events
  ADMIN_ORDER_NEW: 'admin:order:new',
  ADMIN_DASHBOARD_UPDATE: 'admin:dashboard:update',
} as const

// ============================================================
// Admin API Paths
// ============================================================

export const ADMIN_API = {
  OVERVIEW: '/admin/analytics/overview',
  PRODUCTS: '/admin/products',
  PRODUCT: (id: string) => `/admin/products/${id}`,
  CREATE_VARIANT: (id: string) => `/admin/products/${id}/variants`,
  UPDATE_VARIANT: (variantId: string) => `/admin/products/variants/${variantId}`,
  DELETE_VARIANT: (variantId: string) => `/admin/products/variants/${variantId}`,
  ORDERS: '/admin/orders',
  ORDER: (orderId: string) => `/admin/orders/${orderId}`,
  UPDATE_ORDER_STATUS: (orderId: string) => `/admin/orders/${orderId}/status`,
  CATEGORIES: '/admin/categories',
  CATEGORY: (id: string) => `/admin/categories/${id}`,
  INVENTORY_LOW_STOCK: '/admin/inventory/low-stock',
  INVENTORY_VARIANT: (variantId: string) => `/admin/inventory/variant/${variantId}`,
  RESTOCK: (variantId: string) => `/admin/inventory/variant/${variantId}/restock`,
  ANALYTICS_SALES: '/admin/analytics/sales',
  ANALYTICS_TOP_PRODUCTS: '/admin/analytics/top-products',
  ANALYTICS_ORDER_STATS: '/admin/analytics/order-stats',
  ANALYTICS_ACTIVITY: '/admin/analytics/activity',
  USERS: '/admin/users',
  USER: (id: string) => `/admin/users/${id}`,
  UPDATE_USER_ROLE: (id: string) => `/admin/users/${id}/role`,
} as const

// ============================================================
// Error Codes
// ============================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  WEBHOOK_INVALID: 'WEBHOOK_INVALID',
} as const

// ============================================================
// App Config
// ============================================================

export const APP = {
  NAME: 'Waterpro',
  CURRENCY: 'IDR',
  CURRENCY_SYMBOL: 'Rp',
  DEFAULT_PAGE_SIZE: 20,
  MAX_RECENTLY_VIEWED: 20,
} as const

// ============================================================
// Midtrans Config
// ============================================================

export const MIDTRANS = {
  CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
  IS_PRODUCTION: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  SNAP_URL: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js',
} as const

// ============================================================
// Route Paths
// ============================================================

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/products/${slug}`,
  FEATURES: '/features',
  REVIEWS: '/reviews',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ACCOUNT: '/account',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_ORDER: (orderNumber: string) => `/account/orders/${orderNumber}`,
  ACCOUNT_ADDRESSES: '/account/addresses',
  ACCOUNT_WISHLIST: '/account/wishlist',
  ACCOUNT_LOYALTY: '/account/loyalty',
  ACCOUNT_NOTIFICATIONS: '/account/notifications',
  ACCOUNT_SETTINGS: '/account/settings',
  PAYMENT_FINISH: '/payment/finish',
  PAYMENT_ERROR: '/payment/error',
  PAYMENT_PENDING: '/payment/pending',
  SEARCH: '/search',
  CATEGORY: (slug: string) => `/categories/${slug}`,
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_EXPEDITIONS: '/admin/expeditions',
  ADMIN_PROVINCES: '/admin/provinces',
  ADMIN_USERS: '/admin/users',
  ADMIN_LOGIN: '/admin/login',
} as const
