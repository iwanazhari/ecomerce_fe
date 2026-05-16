/**
 * Product & Category Adapter — Medusa Store API → frontend types.
 */

import { medusa } from '@/lib/medusa/client'
import { mapMedusaProduct, mapMedusaCategory } from '@/lib/medusa/mappers'
import type {
  Product,
  Category,
  ProductListParams,
  ApiResponse,
} from '@/types'

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export async function listProducts(
  params: ProductListParams = {},
): Promise<ApiResponse<Product[]>> {
  try {
    const { products, count } = await medusa.store.product.list({
      fields:
        'id,title,handle,description,thumbnail,status,created_at,updated_at,images.id,images.url,images.alt,images.sort_order,images.is_primary,variants.id,variants.title,variants.sku,variants.status,variants.price,variants.compare_price,variants.inventory_quantity,variants.prices.amount,variants.prices.currency_code,categories.id,categories.name,categories.handle',
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      q: params.search,
      category_id: params.category,
      order:
        params.sort === 'price_asc'
          ? 'variant_prices_amount_asc'
          : params.sort === 'price_desc'
            ? 'variant_prices_amount_desc'
            : '-created_at',
    })

    const mapped = products.map((p: Record<string, unknown>) => mapMedusaProduct(p))

    return {
      success: true,
      data: mapped,
      meta: { total: count ?? products.length, limit: params.limit ?? 20 },
    }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: 'PRODUCT_LIST_FAILED', message: error.message } },
    } as any
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiResponse<Product>> {
  try {
    // Medusa's store.retrieve expects a product ID, not a handle/slug.
    // Use list with handle filter to find the product by slug first.
    const { products } = await medusa.store.product.list({
      handle: slug,
      limit: 1,
      fields:
        'id,title,handle,description,thumbnail,status,created_at,updated_at,images.id,images.url,images.alt,images.sort_order,images.is_primary,variants.id,variants.title,variants.sku,variants.status,variants.price,variants.compare_price,variants.inventory_quantity,variants.prices.amount,variants.prices.currency_code,categories.id,categories.name,categories.handle',
    })

    const product = products?.[0]
    if (!product) {
      throw new Error('Product not found')
    }

    return {
      success: true,
      data: mapMedusaProduct(product as unknown as Record<string, unknown>),
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'PRODUCT_NOT_FOUND', message: error.message } },
    } as any
  }
}

export async function getRecentlyViewed(): Promise<ApiResponse<Product[]>> {
  // TODO: Implement via localStorage product IDs + batch fetch
  return { success: true, data: [] }
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export async function listCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { product_categories: categories } = await medusa.store.category.list({
      fields: '*category_children',
    })

    const mapped = (categories ?? []).map((c: Record<string, unknown>) =>
      mapMedusaCategory(c),
    )

    return { success: true, data: mapped }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: 'CATEGORY_LIST_FAILED', message: error.message } },
    } as any
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<ApiResponse<Category>> {
  try {
    const { product_categories: categories } = await medusa.store.category.list({
      handle: slug,
    })

    const cat = categories?.[0]
    if (!cat) {
      throw new Error('Category not found')
    }

    return {
      success: true,
      data: mapMedusaCategory(cat as unknown as Record<string, unknown>),
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: 'CATEGORY_NOT_FOUND', message: error.message } },
    } as any
  }
}
