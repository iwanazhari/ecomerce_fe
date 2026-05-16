/**
 * Mappers: transform Medusa API responses → Frontend expected types.
 */

import type {
  User,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ApiResponse,
} from '@/types'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toFrontendMoney(amount: number | undefined | null): number {
  return amount ?? 0
}

function safeDate(val: string | undefined | null): string {
  return val ?? new Date().toISOString()
}

function wrapSuccess<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return { success: true, data, meta }
}

// ─────────────────────────────────────────────
// Auth / User
// ─────────────────────────────────────────────

export function mapCustomerToUser(
  customer: {
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    avatar_url?: string | null
    created_at?: string
    updated_at?: string
  },
  role?: string,
): User {
  return {
    id: customer.id,
    email: customer.email,
    phone: customer.phone ?? null,
    firstName: customer.first_name ?? null,
    lastName: customer.last_name ?? null,
    avatar: customer.avatar_url ?? null,
    role: (role as User['role']) ?? 'CUSTOMER',
    isActive: true,
    lastLoginAt: null,
    createdAt: safeDate(customer.created_at),
    updatedAt: safeDate(customer.updated_at),
  }
}

// ─────────────────────────────────────────────
// Product / Variant / Image
// ─────────────────────────────────────────────

export function mapMedusaProduct(product: Record<string, unknown>): Product {
  const variants = (product.variants as Record<string, unknown>[] ?? []).map((v) =>
    mapMedusaVariant(v, product.id as string),
  )

  // Map images from API
  let images = (product.images as Record<string, unknown>[] ?? []).map((img, i) => ({
    id: (img.id as string) ?? `img-${i}`,
    url: (img.url as string) ?? '',
    alt: (img.alt as string | null) ?? null,
    sortOrder: i,
    isPrimary: i === 0,
  }))

  // Fallback to thumbnail if images is empty (common in Medusa list API)
  if (images.length === 0) {
    const thumbnail = product.thumbnail as string | undefined
    if (thumbnail) {
      images = [
        {
          id: 'thumb-fallback',
          url: thumbnail,
          alt: null,
          sortOrder: 0,
          isPrimary: true,
        },
      ]
    }
  }

  const categories = (product.categories as Record<string, unknown>[] ?? []).map(
    (c) =>
      ({
        id: c.id as string,
        name: (c.name as string) ?? '',
        slug: (c.handle as string) ?? (c.name as string)?.toLowerCase() ?? '',
        description: null,
        image: null,
        parentId: null,
        isActive: (c.is_active as boolean) ?? true,
        sortOrder: 0,
      }) as Category,
  )

  return {
    id: product.id as string,
    name: (product.title as string) ?? '',
    slug: (product.handle as string) ?? '',
    description: (product.description as string | null) ?? null,
    shortDescription: null,
    thumbnail: (product.thumbnail as string) ?? undefined,
    status: ((product.status as string) === 'published' ? 'ACTIVE' : 'DRAFT') as Product['status'],
    brand: null,
    weight: (product.weight as number | null) ?? null,
    isActive: (product.status as string) === 'published',
    categories,
    variants,
    images,
    createdAt: safeDate(product.created_at as string),
    updatedAt: safeDate(product.updated_at as string),
  }
}

export function mapMedusaVariant(
  variant: Record<string, unknown>,
  productId: string,
): ProductVariant {
  const prices = (variant.prices as Record<string, unknown>[] ?? [])
  const firstPrice = prices[0] as Record<string, unknown> | undefined

  // Medusa v2 may return a flattened `price` directly on the variant
  // when `fields` includes `variants.price`, or we fall back to `prices[0].amount`.
  const directPrice = variant.price as number | undefined
  const priceFromList = firstPrice?.amount as number | undefined

  return {
    id: variant.id as string,
    productId,
    sku: (variant.sku as string) ?? '',
    name: (variant.title as string) ?? '',
    price: toFrontendMoney(directPrice ?? priceFromList),
    comparePrice: null,
    costPrice: null,
    weight: (variant.weight as number | null) ?? null,
    options: (variant.options as Record<string, string>) ?? {},
    isActive: true,
  }
}

// ─────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────

export function mapMedusaCategory(cat: Record<string, unknown>): Category {
  const children = (cat.category_children as Record<string, unknown>[] ?? []).map((c) =>
    mapMedusaCategory(c),
  )

  return {
    id: cat.id as string,
    name: (cat.name as string) ?? '',
    slug: (cat.handle as string) ?? (cat.name as string)?.toLowerCase() ?? '',
    description: (cat.description as string | null) ?? null,
    image: null,
    parentId: null,
    isActive: (cat.is_active as boolean) ?? true,
    sortOrder: 0,
    children: children.length > 0 ? children : undefined,
  }
}

// ─────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────

export function mapMedusaCart(cart: Record<string, unknown>): Cart {
  const items = (cart.items as Record<string, unknown>[] ?? []).map((item) =>
    mapMedusaCartItem(item),
  )

  return {
    id: cart.id as string,
    userId: (cart.customer_id as string | null) ?? undefined,
    sessionId: undefined,
    status: (cart.status as Cart['status']) ?? 'ACTIVE',
    items,
    subtotal: toFrontendMoney(cart.subtotal as number),
    createdAt: safeDate(cart.created_at as string),
    updatedAt: safeDate(cart.updated_at as string),
  }
}

export function mapMedusaCartItem(item: Record<string, unknown>): CartItem {
  const product = (item.product as Record<string, unknown>) ?? {}
  const variant = (item.variant as Record<string, unknown>) ?? {}

  // Medusa v2 returns flattened product/variant fields on the line item itself.
  // Use these to build a usable product object for the cart UI.
  const productId = (item.product_id as string) ?? (product.id as string) ?? ''
  const variantId = (item.variant_id as string) ?? (variant.id as string) ?? ''
  const thumbnail = (item.thumbnail as string) ?? ''
  const productTitle = (item.product_title as string) ?? (product.title as string) ?? ''
  const productHandle = (item.product_handle as string) ?? (product.handle as string) ?? ''
  const productDescription = (item.product_description as string | null) ?? null
  const variantTitle = (item.variant_title as string) ?? (variant.title as string) ?? ''
  const variantSku = (item.variant_sku as string) ?? (variant.sku as string) ?? ''

  return {
    id: item.id as string,
    productId,
    variantId,
    quantity: (item.quantity as number) ?? 1,
    price: toFrontendMoney((item.unit_price as number) ?? (item.total as number)),
    product: {
      id: productId,
      name: productTitle,
      slug: productHandle,
      description: productDescription,
      shortDescription: null,
      status: 'ACTIVE' as const,
      brand: null,
      weight: null,
      isActive: true,
      categories: [],
      variants: [],
      images: thumbnail
        ? [{ id: 'thumb', url: thumbnail, alt: null, sortOrder: 0, isPrimary: true }]
        : [],
      createdAt: safeDate(item.created_at as string),
      updatedAt: safeDate(item.updated_at as string),
    },
    variant: {
      id: variantId,
      productId,
      sku: variantSku,
      name: variantTitle,
      price: toFrontendMoney(item.unit_price as number),
      comparePrice: null,
      costPrice: null,
      weight: null,
      options: {},
      isActive: true,
    },
  }
}

// ─────────────────────────────────────────────
// Order
// ─────────────────────────────────────────────

export function mapMedusaOrderStatus(status?: string): OrderStatus {
  switch (status) {
    case 'completed':
      return 'DELIVERED'
    case 'pending':
      return 'PENDING'
    case 'canceled':
      return 'CANCELLED'
    default:
      return 'PROCESSING'
  }
}

export function mapMedusaPaymentStatus(status?: string): PaymentStatus {
  switch (status) {
    case 'authorized':
      return 'AUTHORIZED'
    case 'captured':
      return 'PAID'
    case 'refunded':
      return 'REFUNDED'
    case 'canceled':
      return 'FAILED'
    case 'not_paid':
    default:
      return 'PENDING'
  }
}

export function mapMedusaOrder(order: Record<string, unknown>): Order {
  const items = (order.items as Record<string, unknown>[] ?? []).map((item) =>
    mapMedusaOrderItem(item),
  )

  const total = toFrontendMoney(order.total as number)
  const subtotal = toFrontendMoney(order.subtotal as number)
  const shippingTotal = toFrontendMoney(order.shipping_total as number)
  const discountTotal = toFrontendMoney(order.discount_total as number)
  const taxTotal = toFrontendMoney(order.tax_total as number)

  return {
    id: order.id as string,
    orderNumber: (order.display_id
      ? `ORD-${order.display_id}`
      : (order.id as string).slice(-8).toUpperCase()) as string,
    userId: (order.customer_id as string) ?? '',
    user: {
      id: (order.customer_id as string) ?? '',
      email: ((order.email as string) ?? '') as string,
      firstName: null,
      lastName: null,
    },
    address: {} as Order['address'],
    customer: {
      id: (order.customer_id as string) ?? '',
      email: (order.email as string) ?? '',
      firstName: null,
      lastName: null,
    },
    status: mapMedusaOrderStatus(order.status as string),
    paymentStatus: mapMedusaPaymentStatus(order.payment_status as string),
    paymentMethod: (() => {
      const collections = (order.payment_collections as Record<string, unknown>[]) ?? []
      const first = collections[0] as Record<string, unknown> | undefined
      const payments = ((first?.payments as Record<string, unknown>[]) ?? [])
      const firstPayment = payments[0] as Record<string, unknown> | undefined
      return (firstPayment?.provider_id as string) ?? ''
    })(),
    paymentTransactionId: (() => {
      const collections = (order.payment_collections as Record<string, unknown>[]) ?? []
      const first = collections[0] as Record<string, unknown> | undefined
      const payments = ((first?.payments as Record<string, unknown>[]) ?? [])
      const firstPayment = payments[0] as Record<string, unknown> | undefined
      const data = firstPayment?.data as Record<string, unknown> | undefined
      return (data?.transaction_id as string) ?? null
    })(),
    subtotal,
    taxAmount: taxTotal,
    shippingAmount: shippingTotal,
    discountAmount: discountTotal,
    totalAmount: total,
    currency: (order.currency_code as string) ?? 'idr',
    shippingMethod: (() => {
      const methods = (order.shipping_methods as Record<string, unknown>[]) ?? []
      const first = methods[0] as Record<string, unknown> | undefined
      return (first?.name as string) ?? (first?.shipping_option_id as string) ?? ''
    })(),
    trackingNumber: null,
    notes: null,
    couponCode: null,
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 0,
    items,
    createdAt: safeDate(order.created_at as string),
    updatedAt: safeDate(order.updated_at as string),
  }
}

export function mapMedusaOrderItem(item: Record<string, unknown>): OrderItem {
  const product = (item.product as Record<string, unknown>) ?? {}
  const variant = (item.variant as Record<string, unknown>) ?? {}
  const quantity = (item.quantity as number) ?? 1
  const unitPrice = toFrontendMoney(item.unit_price as number)

  return {
    id: item.id as string,
    productId: (item.product_id as string) ?? '',
    variantId: (item.variant_id as string) ?? '',
    quantity,
    price: unitPrice,
    subtotal: unitPrice * quantity,
    product: mapMedusaProduct(product),
    variant: mapMedusaVariant(variant, (item.product_id as string) ?? ''),
  }
}

// ─────────────────────────────────────────────
// Pagination helper
// ─────────────────────────────────────────────

export function mapMedusaPagination(response: {
  count?: number
  offset?: number
  limit?: number
}): ApiResponse<unknown>['meta'] {
  return {
    total: response.count ?? 0,
    page: response.offset ? Math.floor((response.offset ?? 0) / (response.limit ?? 20)) + 1 : 1,
    limit: response.limit ?? 20,
  }
}

export { wrapSuccess }
