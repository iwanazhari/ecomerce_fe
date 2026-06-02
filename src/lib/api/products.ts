/**
 * Product & Category Adapter — Express backend API → frontend types.
 *
 * Endpoints:
 * - GET /api/api/products        (list with pagination, search, category filter)
 * - GET /api/api/products/:id    (detail with variants, images, categories)
 */

import { api } from "@/lib/api/client";
import { mapBackendProduct, mapBackendCategory } from "@/lib/api/mappers";
import type {
  Product,
  Category,
  ProductListParams,
  ApiResponse,
} from "@/types";

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export async function listProducts(
  params: ProductListParams = {},
): Promise<ApiResponse<Product[]>> {
  try {
    const result = await api.get<Record<string, unknown>>("products", {
      page:
        params.offset && params.limit
          ? Math.floor(params.offset / params.limit) + 1
          : 1,
      limit: params.limit ?? 20,
      ...(params.category && { category: params.category }),
      ...(params.search && { search: params.search }),
    });

    if (!result.success || !result.data) {
      return { success: false, data: [], meta: result.meta } as any;
    }

    const data = result.data as Record<string, unknown>;
    const productsRaw = (data.products ?? data.items ?? []) as Record<
      string,
      unknown
    >[];
    const pagination = data.pagination as Record<string, unknown> | undefined;

    const mapped = productsRaw.map((p) => mapBackendProduct(p));

    return {
      success: true,
      data: mapped,
      meta: {
        total: (pagination?.total as number) ?? mapped.length,
        page: (pagination?.page as number) ?? 1,
        limit: (pagination?.limit as number) ?? 20,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: "PRODUCT_LIST_FAILED", message: error.message } },
    } as any;
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiResponse<Product>> {
  try {
    const result = await api.get<Record<string, unknown>>(
      `products/by-slug/${encodeURIComponent(slug)}`,
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        data: undefined as any,
        meta: {
          error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" },
        },
      } as any;
    }

    return {
      success: true,
      data: mapBackendProduct(result.data as Record<string, unknown>),
    };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "PRODUCT_NOT_FOUND", message: error.message } },
    } as any;
  }
}

async function getProductById(id: string): Promise<ApiResponse<Product>> {
  try {
    const result = await api.get<Record<string, unknown>>(`products/${id}`);

    if (!result.success || !result.data) {
      return {
        success: false,
        data: undefined as any,
        meta: result.meta,
      } as any;
    }

    const data = result.data as Record<string, unknown>;
    const productRaw = (data.product ?? data) as Record<string, unknown>;

    return {
      success: true,
      data: mapBackendProduct(productRaw),
    };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "PRODUCT_NOT_FOUND", message: error.message } },
    } as any;
  }
}

export async function getRecentlyViewed(): Promise<ApiResponse<Product[]>> {
  // TODO: Implement via localStorage product IDs + batch fetch
  return { success: true, data: [] };
}

// ─────────────────────────────────────────────
// Categories (derived from product categories)
// ─────────────────────────────────────────────

// Cache categories in-memory so we don't hit the API on every page navigation
let cachedCategories: Category[] | null = null;

export async function listCategories(): Promise<ApiResponse<Category[]>> {
  try {
    if (cachedCategories) {
      return { success: true, data: cachedCategories };
    }

    // Use dedicated categories endpoint
    const result = await api.get<Record<string, unknown>[]>("products/categories");

    if (!result.success || !result.data) {
      return { success: false, data: [] } as any;
    }

    const raw = Array.isArray(result.data)
      ? result.data
      : (result.data as any).categories ??
        (result.data as any).data ??
        [];

    cachedCategories = raw.map((cat: Record<string, unknown>) =>
      mapBackendCategory(cat),
    );

    return { success: true, data: cachedCategories! };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      meta: { error: { code: "CATEGORY_LIST_FAILED", message: error.message } },
    } as any;
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<ApiResponse<Category>> {
  try {
    const catsResult = await listCategories();
    if (!catsResult.success) {
      return catsResult as any;
    }

    const cat = catsResult.data.find((c) => c.slug === slug);
    if (!cat) {
      throw new Error("Category not found");
    }

    return { success: true, data: cat };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "CATEGORY_NOT_FOUND", message: error.message } },
    } as any;
  }
}
