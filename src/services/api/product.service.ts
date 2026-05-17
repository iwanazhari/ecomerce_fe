/**
 * Product & Category Service — delegates to new API adapter layer.
 */
import {
  listProducts,
  getProductBySlug,
  getRecentlyViewed,
  listCategories,
  getCategoryBySlug,
} from "@/lib/api";
import type { Product, ProductListParams, Category } from "@/types";

export const productService = {
  list: (params?: ProductListParams) => listProducts(params),
  getBySlug: (slug: string) => getProductBySlug(slug),
  getRecentlyViewed: () => getRecentlyViewed(),
};

export const categoryService = {
  list: () => listCategories(),
  getBySlug: (slug: string) => getCategoryBySlug(slug),
};
