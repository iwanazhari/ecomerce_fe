import { z } from 'zod'

// ============================================================
// Auth Validators
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
})

// ============================================================
// Address Validators
// ============================================================

export const addressSchema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  addressLine: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  postalCode: z.string().min(1, 'Kode pos wajib diisi'),
  country: z.string().default('Indonesia'),
  isPrimary: z.boolean().default(false),
})

// ============================================================
// Product Validators
// ============================================================

export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest'),
  cursor: z.string().optional(),
  offset: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// ============================================================
// Cart Validators
// ============================================================

export const addCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  variantId: z.string().min(1, 'Variant ID wajib diisi'),
  quantity: z.coerce.number().min(1).max(999),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().min(1).max(999),
})

// ============================================================
// Checkout Validators
// ============================================================

export const createOrderSchema = z.object({
  email: z.string().email('Email tidak valid'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  addressLine: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  postalCode: z.string().min(1, 'Kode pos wajib diisi'),
  country: z.string().default('Indonesia'),
  shippingMethod: z.string().min(1, 'Metode pengiriman wajib dipilih'),
  paymentMethod: z.literal('midtrans'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  useLoyaltyPoints: z.boolean().default(false),
})

// ============================================================
// Shipping Validators
// ============================================================

export const shippingCalculationSchema = z.object({
  destination: z.object({
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
  }),
  items: z.array(
    z.object({
      weight: z.number(),
      quantity: z.number(),
    }),
  ),
})

// ============================================================
// Coupon Validator
// ============================================================

export const couponSchema = z.object({
  code: z.string().min(1, 'Kode kupon wajib diisi'),
})
