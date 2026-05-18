import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, categoryService, cartService } from "@/services/api";
import {
  addCartItemSchema,
  updateCartItemSchema,
  productFilterSchema,
} from "@/validators";
import { useUIStore } from "@/store";
import type {
  ProductListParams,
  AddCartItemInput,
  UpdateCartItemInput,
  Product,
} from "@/types";

// ============================================================
// Product Keys
// ============================================================

const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  recentlyViewed: () => [...productKeys.all, "recently-viewed"] as const,
};

// ============================================================
// Category Keys
// ============================================================

const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
  detail: (slug: string) => [...categoryKeys.all, "detail", slug] as const,
};

// ============================================================
// Cart Keys
// ============================================================

const cartKeys = {
  all: ["cart"] as const,
  current: () => [...cartKeys.all, "current"] as const,
};

// ============================================================
// Products
// ============================================================

export function useProducts(params?: ProductListParams) {
  const parsed = params ? productFilterSchema.safeParse(params) : null;
  const validParams = parsed?.success ? parsed.data : params;

  return useQuery({
    queryKey: productKeys.list(validParams ?? {}),
    queryFn: () => productService.list(validParams),
    select: (r) => ({
      data: r.data,
      meta: r.meta,
    }),
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () =>
      productService.getBySlug(slug).then((r) => {
        if (!r.success || !r.data) {
          const msg = (r as any).meta?.error?.message;
          throw new Error(msg ?? "Product not found");
        }
        return r.data;
      }),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentlyViewed(enabled: boolean = true) {
  return useQuery({
    queryKey: productKeys.recentlyViewed(),
    queryFn: () => productService.getRecentlyViewed().then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// Categories
// ============================================================

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () =>
      categoryService.getBySlug(slug).then((r) => {
        if (!r.success || !r.data) {
          const msg = (r as any).meta?.error?.message;
          throw new Error(msg ?? "Category not found");
        }
        return r.data;
      }),
    enabled: !!slug,
  });
}

// ============================================================
// Cart
// ============================================================

export function useCart(enabled: boolean = true) {
  return useQuery({
    queryKey: cartKeys.current(),
    queryFn: () =>
      cartService.get().then((r) => {
        if (!r.success || !r.data) {
          const msg = (r as any).meta?.error?.message;
          throw new Error(msg ?? "Failed to fetch cart");
        }
        return r.data;
      }),
    enabled,
    staleTime: 0, // always fresh
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: AddCartItemInput) => {
      const parsed = addCartItemSchema.parse(data);
      return cartService.addItem(parsed);
    },
    onMutate: async (data: AddCartItemInput) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });
      const previous = queryClient.getQueryData(cartKeys.current());

      queryClient.setQueryData(
        cartKeys.current(),
        (old: { items: unknown[]; subtotal: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: [
              ...old.items,
              {
                productId: data.productId,
                variantId: data.variantId,
                quantity: data.quantity,
              },
            ],
          };
        },
      );

      return { previous };
    },
    onError: (err, _vars, context: { previous: unknown } | undefined) => {
      console.error("Failed to add to cart:", err);
      if (context?.previous) {
        queryClient.setQueryData(cartKeys.current(), context.previous);
      }
      showToast("Gagal menambahkan ke keranjang", "error");
    },
    onSuccess: () => {
      showToast("Berhasil ditambahkan ke keranjang", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateCartItemInput;
    }) => {
      const parsed = updateCartItemSchema.parse(data);
      return cartService.updateItem(itemId, parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

// ============================================================
// Product detail helper — track recently viewed
// ============================================================

export function useProductWithTracking(slug: string) {
  const { data, isLoading, error } = useProduct(slug);
  return { product: data, isLoading, error };
}
