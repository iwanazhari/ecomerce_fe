// ============================================================
// API Response Envelope
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    cursor?: string | null
    nextCursor?: string | null
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// ============================================================
// Auth
// ============================================================

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  email: string
  phone: string | null
  firstName: string | null
  lastName: string | null
  avatar: string | null
  role: UserRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

// ============================================================
// Address
// ============================================================

export interface Address {
  id: string
  userId: string
  label: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  country: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressInput {
  label: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  country?: string
  isPrimary?: boolean
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}

// ============================================================
// Product
// ============================================================

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  price: number
  comparePrice: number | null
  costPrice: number | null
  weight: number | null
  options: Record<string, string>
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  thumbnail?: string
  status: ProductStatus
  brand: string | null
  weight: number | null
  isActive: boolean
  categories: Category[]
  variants: ProductVariant[]
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface ProductListParams {
  cursor?: string
  offset?: number
  limit?: number
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}

// ============================================================
// Category
// ============================================================

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
  children?: Category[]
}

// ============================================================
// Cart
// ============================================================

export interface Cart {
  id: string
  userId?: string | null // null/undefined for guest carts
  sessionId?: string | null // present for guest carts
  status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED'
  items: CartItem[]
  subtotal: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  quantity: number
  price: number
  product: Product
  variant: ProductVariant
}

export interface AddCartItemInput {
  productId: string
  variantId: string
  quantity: number
}

export interface UpdateCartItemInput {
  quantity: number
}

// ============================================================
// Checkout / Order
// ============================================================

export interface ShippingRate {
  courier: string
  service: string
  price: number
  estimatedDays: number
}

export interface ShippingCalculationInput {
  destination: {
    city: string
    province: string
    postalCode: string
  }
  items: { weight: number; quantity: number }[]
}

export interface CreateOrderInput {
  /** Customer email (required for guest checkout) */
  email: string
  /** Customer full name (required for guest checkout) */
  fullName: string
  /** Customer phone (required for guest checkout) */
  phone: string
  /** Shipping address details */
  shippingAddress: {
    addressLine: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  shippingMethod: string
  paymentMethod: 'midtrans'
  couponCode?: string
  notes?: string
  useLoyaltyPoints?: boolean
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  address: Address
  customer?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  paymentTransactionId: string | null
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  shippingMethod: string
  trackingNumber: string | null
  notes: string | null
  couponCode: string | null
  loyaltyPointsUsed: number
  loyaltyPointsEarned: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  quantity: number
  price: number
  subtotal: number
  product: Product
  variant: ProductVariant
}

export interface OrderListParams {
  cursor?: string
  limit?: number
  status?: OrderStatus
}

// ============================================================
// Payment
// ============================================================

export interface SnapPayment {
  token: string
  redirectUrl: string
}

export interface PaymentInfo {
  status: PaymentStatus
  providerPaymentId: string | null
}

// ============================================================
// Wishlist
// ============================================================

export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
}

export interface WishlistItem {
  id: string
  productId: string
  product: Product
  addedAt: string
}

// ============================================================
// Loyalty
// ============================================================

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface LoyaltyAccount {
  id: string
  userId: string
  points: number
  tier: LoyaltyTier
  lifetimePoints: number
}

export interface LoyaltyTransaction {
  id: string
  accountId: string
  type: 'EARN' | 'BURN' | 'ADJUST' | 'EXPIRE'
  points: number
  orderId: string | null
  description: string | null
  createdAt: string
}

export interface LoyaltyListParams {
  cursor?: string
  limit?: number
}

// ============================================================
// Notification
// ============================================================

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'SHIPMENT_UPDATED'
  | 'STOCK_LOW'
  | 'PRICE_DROP'
  | 'RESTOCK_ALERT'
  | 'LOYALTY_EARNED'
  | 'LOYALTY_REDEEMED'
  | 'COUPON_AVAILABLE'
  | 'COUPON_EXPIRING'
  | 'REVIEW_REQUEST'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
}

export interface NotificationListParams {
  cursor?: string
  limit?: number
  unreadOnly?: boolean
}

export interface UnreadCount {
  count: number
}

// ============================================================
// Coupon
// ============================================================

export type CouponType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  maxDiscount: number | null
  minPurchase: number
  usageLimit: number | null
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

// ============================================================
// Recently Viewed
// ============================================================

export interface RecentlyViewed {
  id: string
  productId: string
  viewedAt: string
  product: Product
}

// ============================================================
// Review
// ============================================================

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  isVerified: boolean
  createdAt: string
}

// ============================================================
// Analytics (Admin)
// ============================================================

export interface DashboardOverview {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueChange: number
  ordersChange: number
  customersChange: number
  aovChange: number
  recentOrders: Order[]
  topProducts: { product: Product; totalSold: number; revenue: number }[]
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  product: Product
  totalSold: number
  revenue: number
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  averageOrderValue: number
  pending?: number
  processing?: number
  shipped?: number
  completed?: number
  cancelled?: number
  total?: number
}

export interface SalesAnalytics {
  today?: number
  thisWeek?: number
  thisMonth?: number
  total?: number
  data?: SalesData[]
}

export interface ActivityLog {
  id: string
  action: string
  entityType?: string
  entityId?: string
  userId?: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// ============================================================
// Inventory
// ============================================================

export interface InventoryItem {
  id: string
  variantId: string
  quantity: number
  lowStockThreshold: number
  variant?: {
    id: string
    sku: string
    name: string
    product?: {
      id: string
      name: string
    }
  }
}
