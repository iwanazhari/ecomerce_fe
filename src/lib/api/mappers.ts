/**
 * Mappers: transform Express backend API responses → Frontend expected types.
 *
 * Backend response shapes are based on API_DOCUMENTATION.md at /home/iwan/projects/backend_webstore/
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
} from "@/types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toMoney(amount: string | number | undefined | null): number {
  if (amount == null) return 0;
  return typeof amount === "string" ? parseInt(amount, 10) : amount;
}

function safeDate(val: string | undefined | null): string {
  return val ?? new Date().toISOString();
}

// ─────────────────────────────────────────────
// Auth / User
// ─────────────────────────────────────────────

export function mapBackendUser(
  user: Record<string, unknown>,
  role?: string,
): User {
  return {
    id: user.id as string,
    email: (user.email as string) ?? "",
    firstName: (user.firstName as string | null) ?? null,
    lastName: (user.lastName as string | null) ?? null,
    phone: (user.phone as string | null) ?? null,
    avatar: (user.avatar as string | null) ?? null,
    role: ((user.role as string) ?? role ?? "CUSTOMER") as User["role"],
    isActive: (user.isActive as boolean) ?? true,
    lastLoginAt: (user.lastLoginAt as string | null) ?? null,
    createdAt: safeDate(user.createdAt as string),
    updatedAt: safeDate(user.updatedAt as string),
  };
}

// ─────────────────────────────────────────────
// Product / Variant / Image
// ─────────────────────────────────────────────

export function mapBackendProduct(product: Record<string, unknown>): Product {
  // Create synthetic variant from basePrice/salePrice since API has no variants table
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = Number(product.salePrice ?? 0);
  const compareAtPrice = Number(product.compareAtPrice ?? 0);
  const finalPrice = salePrice || basePrice;
  const variants: ProductVariant[] = [
    {
      id: `${product.id}-default`,
      productId: product.id as string,
      sku: (product.sku as string) ?? "",
      name: "Default",
      price: finalPrice,
      comparePrice: compareAtPrice || (salePrice ? basePrice : null),
      costPrice: null,
      weight: null,
      options: {},
      isActive: true,
    },
  ];

  // Map ProductImage (singular, array) from API response
  const rawImages = (product.ProductImage as Record<string, unknown>[]) ?? [];
  const images: ProductImage[] = rawImages.map((img, i) => ({
    id: (img.id as string) ?? `img-${i}`,
    url: (img.url as string) ?? "",
    alt: null,
    sortOrder: (img.position as number) ?? i,
    isPrimary: i === 0,
  }));

  // Map Category (singular object) from API response
  const rawCategory = product.Category as Record<string, unknown> | undefined;
  const categories: Category[] = rawCategory
    ? [
        {
          id: rawCategory.id as string,
          name: (rawCategory.name as string) ?? "",
          slug: (rawCategory.slug as string) ?? "",
          description: null,
          image: null,
          parentId: null,
          isActive: true,
          sortOrder: 0,
        },
      ]
    : [];

  // Determine thumbnail: first ProductImage url
  const thumbnail = images.length > 0 ? images[0].url : undefined;

  // Status mapping: API returns enum ProductStatus (draft/active/inactive/archived)
  const apiStatus = (product.status as string) ?? "draft";
  const status: Product["status"] =
    apiStatus === "active" ? "published" : "draft";

  return {
    id: product.id as string,
    name: (product.name as string) ?? "",
    slug: (product.slug as string) ?? "",
    description: (product.description as string | null) ?? null,
    shortDescription: (product.longDescription as string | null) ?? null,
    thumbnail,
    status,
    brand: (product.brandId as string | null) ?? null,
    weight: null,
    isActive: apiStatus === "active",
    categories,
    variants,
    images,
    createdAt: safeDate(product.createdAt as string),
    updatedAt: safeDate(product.updatedAt as string),
  };
}

export function mapBackendVariant(
  variant: Record<string, unknown>,
  productId: string,
): ProductVariant {
  return {
    id: (variant.id as string) ?? `${productId}-${variant.sku ?? "default"}`,
    productId,
    sku: (variant.sku as string) ?? "",
    name: (variant.title as string) ?? "",
    price: toMoney(variant.price as string | number | null | undefined),
    comparePrice:
      toMoney(variant.compareAtPrice as string | number | null | undefined) ||
      null,
    costPrice: null,
    weight: null,
    options: {},
    isActive: true,
  };
}

// ─────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────

export function mapBackendCategory(cat: Record<string, unknown>): Category {
  return {
    id: cat.id as string,
    name: (cat.name as string) ?? "",
    slug: (cat.handle as string) ?? (cat.name as string)?.toLowerCase() ?? "",
    description: (cat.description as string | null) ?? null,
    image: null,
    parentId: null,
    isActive: true,
    sortOrder: 0,
  };
}

// ─────────────────────────────────────────────
// Cart (client-side + API order items)
// ─────────────────────────────────────────────

export function mapBackendCart(cart: Record<string, unknown>): Cart {
  const items = (
    (cart.items ?? cart.OrderItem ?? []) as Record<string, unknown>[]
  ).map((item) => mapBackendCartItem(item));
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    id: (cart.id as string) ?? "local-cart",
    userId: (cart.userId as string) ?? undefined,
    status: (cart.status as Cart["status"]) ?? "ACTIVE",
    items,
    subtotal,
    createdAt: safeDate(cart.createdAt as string),
    updatedAt: safeDate(cart.updatedAt as string),
  };
}

export function mapBackendCartItem(
  item: Record<string, unknown>,
  cartItemId?: string,
): CartItem {
  const productRaw = (item.product as Record<string, unknown>) ?? {};
  const quantity = (item.quantity as number) ?? 1;
  const price = toMoney(
    (item.price ?? item.unitPrice) as string | number | null | undefined,
  );

  return {
    id: cartItemId ?? (item.id as string) ?? `cart-item-${Date.now()}`,
    productId: (item.productId as string) ?? (productRaw.id as string) ?? "",
    variantId: (item.variantId as string) ?? "",
    quantity,
    price,
    product:
      productRaw && Object.keys(productRaw).length > 0
        ? mapBackendProduct(productRaw)
        : {
            id: (item.productId as string) ?? "",
            name:
              (item.productTitle as string) ??
              (productRaw.title as string) ??
              "",
            slug:
              (item.productSlug as string) ??
              (item.productHandle as string) ??
              (productRaw.handle as string) ??
              "",
            description: null,
            shortDescription: null,
            thumbnail:
              (item.productThumbnail as string) ??
              (item.thumbnail as string) ??
              (productRaw.thumbnail as string) ??
              undefined,
            status: "published" as const,
            brand: null,
            weight: null,
            isActive: true,
            categories: [],
            variants: [],
            images: item.productThumbnail
              ? [
                  {
                    id: "cart-thumb",
                    url: item.productThumbnail as string,
                    alt: null,
                    sortOrder: 0,
                    isPrimary: true,
                  },
                ]
              : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
    variant: {
      id: (item.variantId as string) ?? "",
      productId: (item.productId as string) ?? "",
      sku: (item.sku as string) ?? "",
      name: (item.variantTitle as string) ?? "",
      price,
      comparePrice: null,
      costPrice: null,
      weight: null,
      options: {},
      isActive: true,
    },
  };
}

// ─────────────────────────────────────────────
// Order
// ─────────────────────────────────────────────

export function mapBackendOrderStatus(status?: string): OrderStatus {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "CONFIRMED":
      return "CONFIRMED";
    case "PROCESSING":
      return "PROCESSING";
    case "SHIPPED":
      return "SHIPPED";
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    case "RETURNED":
      return "RETURNED";
    default:
      return "PENDING";
  }
}

export function mapBackendPaymentStatus(paymentStatus?: string): PaymentStatus {
  switch (paymentStatus) {
    case "PENDING":
      return "PENDING";
    case "PAID":
      return "PAID";
    case "FAILED":
      return "FAILED";
    case "REFUNDED":
      return "REFUNDED";
    case "AUTHORIZED":
      return "AUTHORIZED";
    default:
      return "PENDING";
  }
}

export function mapBackendOrder(order: Record<string, unknown>): Order {
  const items = (
    (order.OrderItem ?? order.items ?? []) as Record<string, unknown>[]
  ).map((item) => mapBackendOrderItem(item));

  const total = toMoney(
    (order.totalAmount ?? order.total) as string | number | null | undefined,
  );
  const subtotal = toMoney(
    order.subtotal as string | number | null | undefined,
  );
  const shippingAmount = toMoney(
    order.shippingCost as string | number | null | undefined,
  );
  const discountAmount = toMoney(
    order.discountAmount as string | number | null | undefined,
  );

  const shippingAddress =
    (order.shippingAddress as Record<string, unknown>) ?? {};
  const metadata = (order.metadata as Record<string, unknown>) ?? {};

  // Map payment info
  const payment = order.payment as Record<string, unknown> | undefined;
  const paymentTransactionId =
    (payment?.transactionId as string | null) ?? null;
  const paymentStatusFromPayment = payment?.transactionStatus as
    | string
    | undefined;

  return {
    id: order.id as string,
    orderNumber:
      (order.orderNumber as string) ??
      (order.id as string).slice(-8).toUpperCase(),
    userId: (order.customerId as string) ?? "",
    user: {
      id: (order.customerId as string) ?? "",
      email: (metadata.customerEmail as string) ?? "",
      firstName: (metadata.customerName as string | null) ?? null,
      lastName: null,
    },
    address: {
      id: "",
      userId: (order.customerId as string) ?? "",
      label: "Shipping",
      fullName: (shippingAddress.name as string) ?? "",
      phone: (shippingAddress.phone as string) ?? "",
      addressLine: (shippingAddress.address as string) ?? "",
      city: (shippingAddress.city as string) ?? "",
      province: (shippingAddress.province as string) ?? "",
      postalCode: (shippingAddress.postalCode as string) ?? "",
      country: "Indonesia",
      isPrimary: false,
      createdAt: safeDate(order.createdAt as string),
      updatedAt: safeDate(order.updatedAt as string),
    } as Order["address"],
    customer: {
      id: (order.customerId as string) ?? "",
      email: (metadata.customerEmail as string) ?? "",
      firstName: (metadata.customerName as string | null) ?? null,
      lastName: null,
    },
    status: mapBackendOrderStatus(order.status as string),
    paymentStatus: paymentStatusFromPayment
      ? mapBackendPaymentStatus(paymentStatusFromPayment)
      : mapBackendPaymentStatus(order.paymentStatus as string),
    paymentMethod: (order.paymentMethod as string) ?? "",
    paymentTransactionId,
    subtotal,
    taxAmount: 0,
    shippingAmount,
    discountAmount,
    totalAmount: total,
    currency: "idr",
    shippingMethod: (() => {
      const method = order.shippingMethod as
        | Record<string, unknown>
        | undefined;
      return method
        ? `${(method.courier as string) ?? ""} ${(method.service as string) ?? ""}`.trim()
        : "";
    })(),
    trackingNumber: null,
    notes: (metadata.notes as string | null) ?? null,
    couponCode: null,
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 0,
    items,
    createdAt: safeDate(order.createdAt as string),
    updatedAt: safeDate(order.updatedAt as string),
  };
}

export function mapBackendOrderItem(item: Record<string, unknown>): OrderItem {
  const productRaw = (item.product as Record<string, unknown>) ?? {};
  const quantity = (item.quantity as number) ?? 1;
  const price = toMoney(item.price as string | number | null | undefined);

  return {
    id: item.id as string,
    productId: (item.productId as string) ?? "",
    variantId: (item.variantId as string) ?? "",
    quantity,
    price,
    subtotal: price * quantity,
    product:
      productRaw && Object.keys(productRaw).length > 0
        ? mapBackendProduct(productRaw)
        : {
            id: (item.productId as string) ?? "",
            name: (productRaw.title as string) ?? "",
            slug: "",
            description: null,
            shortDescription: null,
            thumbnail: (productRaw.thumbnail as string) ?? undefined,
            status: "published" as const,
            brand: null,
            weight: null,
            isActive: true,
            categories: [],
            variants: [],
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
    variant: {
      id: (item.variantId as string) ?? "",
      productId: (item.productId as string) ?? "",
      sku: "",
      name: "",
      price,
      comparePrice: null,
      costPrice: null,
      weight: null,
      options: {},
      isActive: true,
    },
  };
}
