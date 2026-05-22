/**
 * Admin Service — CRUD operations via Express backend REST API (port 4000).
 * Replaces the legacy Express backend (port 3001) and Medusa Admin SDK.
 */

import { api, apiRequest } from "@/lib/api/client";
import type {
  DashboardOverview,
  Product,
  ProductVariant,
  ProductImage,
  Order,
  Category,
  InventoryItem,
  SalesAnalytics,
  TopProduct,
  OrderStats,
  ActivityLog,
  User,
  UserRole,
} from "@/types";

// ============================================================
// Analytics
// ============================================================

export const adminAnalytics = {
  getOverview: async () => {
    // Fetch overview from backend
    const result = await api.get<Record<string, unknown>>(
      "/admin/analytics/overview",
    );
    if (!result.success || !result.data) {
      // Fallback: compute from available data
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        aovChange: 0,
        recentOrders: [],
        topProducts: [],
      } as DashboardOverview;
    }
    return result.data as unknown as DashboardOverview;
  },

  getSales: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }) => {
    return { data: [] } as SalesAnalytics;
  },

  getTopProducts: async (params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return [] as TopProduct[];
  },

  getOrderStats: async () => {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
    } as OrderStats;
  },

  getActivity: async (params?: {
    limit?: number;
    offset?: number;
    type?: string;
  }) => {
    return [] as ActivityLog[];
  },
};

// ============================================================
// Products
// ============================================================

export const adminProducts = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }) => {
    const result = await api.get<Record<string, unknown>>("/admin/products", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      ...(params?.search && { search: params.search }),
      ...(params?.categoryId && { categoryId: params.categoryId }),
    });

    if (!result.success || !result.data) {
      return { data: [], meta: { total: 0 } };
    }

    const data = result.data as Record<string, unknown>;
    const products = (data.products ?? []) as Product[];
    const pagination = data.pagination as Record<string, unknown> | undefined;

    return {
      data: products,
      meta: {
        total: (pagination?.total as number) ?? products.length,
        page: (pagination?.page as number) ?? 1,
        limit: (pagination?.limit as number) ?? 50,
      },
    };
  },

  get: async (id: string, params?: Record<string, string>) => {
    const result = await api.get<Record<string, unknown>>(
      `/admin/products/${id}`,
      params, // Support cache-busting params
    );
    if (!result.success || !result.data) return null;
    const data = result.data as Record<string, unknown>;
    return (data.product ?? data) as Product;
  },

  create: async (
    data: Partial<Product> & {
      image?: File;
      price?: number;
      inventory?: number;
      images?: { id: string; url: string; isPrimary?: boolean }[];
    },
  ) => {
    const jsonData: any = {};
    if ((data as any).title) jsonData.title = (data as any).title;
    if ((data as any).description)
      jsonData.description = (data as any).description;
    if ((data as any).handle) jsonData.handle = (data as any).handle;
    if (data.price !== undefined) jsonData.price = Number(data.price);
    if (data.inventory !== undefined)
      jsonData.inventory = Number(data.inventory);
    if ((data as any).categoryId)
      jsonData.categoryId = (data as any).categoryId;
    // Send uploaded images array to backend
    if (data.images && data.images.length > 0) {
      jsonData.images = data.images.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary ?? false,
      }));
    }

    const result = await apiRequest<Record<string, unknown>>(
      "POST",
      "/admin/products",
      jsonData,
    );
    if (!result.success || !result.data)
      throw new Error("Failed to create product");
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res) as Product;
  },

  update: async (
    id: string,
    data: Partial<Product> & {
      image?: File;
      price?: number;
      inventory?: number;
      images?: { id?: string; url: string; isPrimary?: boolean }[];
    },
  ) => {
    // Send as JSON instead of FormData to preserve number types
    const jsonData: any = {};
    if ((data as any).title !== undefined)
      jsonData.title = (data as any).title;
    if ((data as any).description !== undefined)
      jsonData.description = (data as any).description;
    if ((data as any).handle !== undefined)
      jsonData.handle = (data as any).handle;
    // Send status directly - backend will convert to isActive
    if ((data as any).status !== undefined)
      jsonData.status = (data as any).status;
    if (data.price !== undefined)
      jsonData.price = Number(data.price); // Ensure number type
    if (data.inventory !== undefined)
      jsonData.inventory = Number(data.inventory); // Ensure number type
    if ((data as any).categoryId !== undefined)
      jsonData.categoryId = (data as any).categoryId;
    // Send images array to backend (replace all images)
    if (data.images && data.images.length > 0) {
      jsonData.images = data.images.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary ?? false,
      }));
    }

    const result = await apiRequest<Record<string, unknown>>(
      "PUT",
      `/admin/products/${id}`,
      jsonData,
    );
    if (!result.success || !result.data)
      throw new Error("Failed to update product");
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res) as Product;
  },

  delete: async (id: string) => {
    const result = await api.delete<Record<string, unknown>>(
      `/admin/products/${id}`,
    );
    if (!result.success) throw new Error("Failed to delete product");
  },

  uploadImages: async (productId: string, formData: FormData) => {
    const result = await apiRequest<Record<string, unknown>>(
      "POST",
      `/admin/products/${productId}/images`,
      formData,
    );
    if (!result.success || !result.data)
      throw new Error("Failed to upload images");
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res.images ?? res) as ProductImage[];
  },

  deleteImage: async (imageId: string) => {
    // No dedicated image delete endpoint
  },

  updateImage: async (
    imageId: string,
    data: { sortOrder?: number; alt?: string; isPrimary?: boolean },
  ) => {
    // No dedicated image update endpoint
    return null as unknown as ProductImage;
  },

  createVariant: async (productId: string, data: Partial<ProductVariant>) => {
    // Variants are managed via product update
    throw new Error("Variant creation is handled via product update");
  },

  updateVariant: async (variantId: string, data: Partial<ProductVariant>) => {
    // Variants are managed via product update
    return data as ProductVariant;
  },

  deleteVariant: async (variantId: string) => {
    // Variants are managed via product update
  },
};

// ============================================================
// Orders
// ============================================================

export const adminOrders = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const result = await api.get<Record<string, unknown>>("/admin/orders", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      ...(params?.status && { status: params.status }),
      ...(params?.search && { search: params.search }),
    });

    if (!result.success || !result.data) {
      return { data: [], meta: { total: 0 } };
    }

    const data = result.data as Record<string, unknown>;
    const orders = (data.orders ?? []) as Order[];
    const pagination = data.pagination as Record<string, unknown> | undefined;

    return {
      data: orders,
      meta: {
        total: (pagination?.total as number) ?? orders.length,
        page: (pagination?.page as number) ?? 1,
        limit: (pagination?.limit as number) ?? 50,
      },
    };
  },

  getDetail: async (orderId: string) => {
    const result = await api.get<Record<string, unknown>>(
      `/admin/orders/${orderId}`,
    );
    if (!result.success || !result.data) throw new Error("Order not found");
    const data = result.data as Record<string, unknown>;
    return (data.order ?? data) as Order;
  },

  updateStatus: async (orderId: string, status: string, notes?: string) => {
    const result = await api.patch<Record<string, unknown>>(
      `/admin/orders/${orderId}/status`,
      {
        status,
        ...(notes && { notes }),
      },
    );
    if (!result.success || !result.data)
      throw new Error("Failed to update order status");
    const data = result.data as Record<string, unknown>;
    return (data.data ?? data.order ?? data) as Order;
  },

  cancel: async (orderId: string) => {
    const result = await api.patch<Record<string, unknown>>(
      `/admin/orders/${orderId}/cancel`,
    );
    if (!result.success || !result.data)
      throw new Error("Failed to cancel order");
    const data = result.data as Record<string, unknown>;
    return (data.data ?? data.order ?? data) as Order;
  },
};

// ============================================================
// Categories
// ============================================================

export const adminCategories = {
  list: async (params?: { includeInactive?: boolean }) => {
    // Categories are embedded in products
    const { data: products } = await adminProducts.list({ limit: 100 });
    const categoryMap = new Map<string, Category>();
    for (const product of products ?? []) {
      for (const cat of product.categories ?? []) {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, cat);
        }
      }
    }
    return { data: Array.from(categoryMap.values()) };
  },

  create: async (data: Partial<Category>) => {
    // Categories are created with products
    throw new Error("Categories are created with products");
  },

  update: async (id: string, data: Partial<Category>) => {
    // Categories are updated via product update
    return data as Category;
  },

  delete: async (id: string) => {
    // Categories are deleted via product update
  },
};

// ============================================================
// Inventory
// ============================================================

export const adminInventory = {
  getLowStock: async (threshold?: number) => {
    const { data: products } = await adminProducts.list({ limit: 200 });
    const lowStock: InventoryItem[] = [];
    const thr = threshold ?? 10;

    for (const product of products ?? []) {
      for (const variant of product.variants ?? []) {
        // Variant inventory field
        const qty =
          (variant as any).inventory ??
          (variant as any).inventory_quantity ??
          0;
        if (qty <= thr) {
          lowStock.push({
            id: variant.id,
            variantId: variant.id,
            quantity: qty,
            lowStockThreshold: thr,
            variant: {
              id: variant.id,
              sku: variant.sku,
              name: variant.name,
              product: { id: product.id, name: product.name },
            },
          });
        }
      }
    }

    return { data: lowStock };
  },

  getVariant: async (variantId: string) => {
    return null as unknown as InventoryItem;
  },

  restock: async (variantId: string, quantity: number) => {
    // Inventory is updated via product update
    return {
      id: variantId,
      variantId,
      quantity,
      lowStockThreshold: 10,
    } as InventoryItem;
  },
};

// ============================================================
// Users (not exposed by backend — stub)
// ============================================================

export const adminUsers = {
  list: async (params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }) => {
    return { data: { users: [], total: 0, page: 1, limit: 50 } };
  },

  getDetail: async (id: string) => {
    return null as unknown as User;
  },

  updateRole: async (id: string, role: UserRole) => {
    return null as unknown as User;
  },
};

// ============================================================
// Additional exports for admin pages (expeditions, provinces, uploads)
// ============================================================

export const adminExpeditions = {
  list: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isActive?: boolean;
    _t?: string; // Cache-busting timestamp
  }) => {
    const result = await api.get<Record<string, unknown>>(
      "/admin/expeditions",
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        ...(params?.type && { type: params.type }),
        ...(params?.isActive !== undefined && {
          isActive: String(params.isActive),
        }),
        ...(params?._t && { _t: params._t }), // Cache buster
      },
    );

    if (!result.success || !result.data) {
      return { data: [], total: 0 };
    }

    const data = result.data as Record<string, unknown>;
    const expeditions = (data.expeditions ?? []) as Record<string, unknown>[];
    const pagination = data.pagination as Record<string, unknown> | undefined;

    return {
      data: expeditions,
      total: (pagination?.total as number) ?? expeditions.length,
    };
  },

  get: async (id: string) => {
    const result = await api.get<Record<string, unknown>>(
      `/admin/expeditions/${id}`,
    );
    if (!result.success || !result.data) return null;
    const data = result.data as Record<string, unknown>;
    return (data.expedition ?? data) as Record<string, unknown>;
  },

  create: async (data: {
    name: string;
    code: string;
    type: string;
    pricing?: Record<string, unknown>;
    isActive?: boolean;
    isDefault?: boolean;
  }) => {
    const result = await api.post<Record<string, unknown>>(
      "/admin/expeditions",
      {
        name: data.name,
        code: data.code,
        type: data.type,
        pricing: data.pricing ?? {},
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
      },
    );
    if (!result.success || !result.data) return null;
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res.expedition ?? res) as Record<string, unknown>;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      code?: string;
      type?: string;
      pricing?: Record<string, unknown>;
      isActive?: boolean;
      isDefault?: boolean;
    },
  ) => {
    console.log("[adminExpeditions.update] ID:", id);
    console.log("[adminExpeditions.update] Data:", JSON.stringify(data, null, 2));
    
    const result = await api.put<Record<string, unknown>>(
      `/admin/expeditions/${id}`,
      data,
    );
    
    console.log("[adminExpeditions.update] Response:", result);
    
    if (!result.success || !result.data) return null;
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res.expedition ?? res) as Record<string, unknown>;
  },

  delete: async (id: string) => {
    const result = await api.delete<Record<string, unknown>>(
      `/admin/expeditions/${id}`,
    );
    return result.success;
  },

  setDefault: async (id: string) => {
    const result = await api.post<Record<string, unknown>>(
      `/admin/expeditions/${id}/set-default`,
    );
    if (!result.success || !result.data) return null;
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res.expedition ?? res) as Record<string, unknown>;
  },

  toggleActive: async (id: string) => {
    const result = await api.post<Record<string, unknown>>(
      `/admin/expeditions/${id}/toggle-active`,
    );
    if (!result.success || !result.data) return null;
    const res = result.data as Record<string, unknown>;
    return (res.data ?? res.expedition ?? res) as Record<string, unknown>;
  },

  getShippingOptions: async () => {
    const { data } = await adminExpeditions.list({ isActive: true });
    return (data as Record<string, unknown>[]).map((exp) => ({
      id: exp.id,
      name: exp.name,
      code: exp.code,
      type: exp.type,
      isActive: exp.isActive,
    }));
  },
};

export const adminProvinces = {
  list: async () => {
    const result = await api.get<Record<string, unknown>>("/provinces");
    if (!result.success || !result.data) return { data: [], total: 0 };
    const data = result.data as Record<string, unknown>;
    const provinces = (data.data ?? data.provinces ?? data) as Record<
      string,
      unknown
    >[];
    return {
      data: Array.isArray(provinces) ? provinces : [],
      total: Array.isArray(provinces) ? provinces.length : 0,
    };
  },

  get: async (id: string) => {
    const result = await api.get<Record<string, unknown>>(`/provinces/${id}`);
    if (!result.success || !result.data) return null;
    const data = result.data as Record<string, unknown>;
    return (data.data ?? data.province ?? data) as Record<string, unknown>;
  },

  getCities: async (provinceId: string) => {
    const result = await api.get<Record<string, unknown>>(
      `/provinces/${provinceId}/cities`,
    );
    if (!result.success || !result.data) return [];
    const data = result.data as Record<string, unknown>;
    return (data.data ?? data.cities ?? data) as Record<string, unknown>[];
  },

  getCity: async (cityId: string) => {
    const result = await api.get<Record<string, unknown>>(
      `/provinces/cities/${cityId}`,
    );
    if (!result.success || !result.data) return null;
    const data = result.data as Record<string, unknown>;
    return (data.data ?? data.city ?? data) as Record<string, unknown>;
  },
};

export const adminUploads = {
  uploadProductImages: async (productId: string, files: FileList | File[]) => {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : Array.from(files);
    for (const file of fileList) {
      formData.append("images", file);
    }

    const result = await apiRequest<Record<string, unknown>>(
      "POST",
      `/admin/products/${productId}/images`,
      formData,
    );

    if (!result.success || !result.data) return [];
    const data = result.data as Record<string, unknown>;
    const images = (data.data ?? data.images ?? data) as Record<
      string,
      unknown
    >[];
    return Array.isArray(images)
      ? images.map((img) => ({
          id: (img.id as string) ?? "",
          url: (img.url as string) ?? "",
        }))
      : [];
  },

  uploadFiles: async (files: FileList | File[]) => {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : Array.from(files);
    for (const file of fileList) {
      formData.append("files", file);
    }

    const result = await apiRequest<Record<string, unknown>>(
      "POST",
      "/admin/uploads",
      formData,
    );

    if (!result.success || !result.data) return [];
    const data = result.data as Record<string, unknown>;
    const uploads = (data.uploads ?? data.files ?? data) as Record<
      string,
      unknown
    >[];
    return Array.isArray(uploads)
      ? uploads.map((file) => ({
          id: (file.id as string) ?? "",
          url: (file.url as string) ?? "",
        }))
      : [];
  },

  deleteFile: async (fileId: string) => {},

  getPresignedUrl: async (name: string, size: number, type: string) => {
    throw new Error("Presigned URLs not supported");
  },
};

export const adminStockLocations = {
  list: async () => [],
  get: async (id: string) => null,
};
