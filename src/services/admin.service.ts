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
    // Map frontend field names → backend field names
    jsonData.name = (data as any).title ?? (data as any).name ?? "";
    if ((data as any).description)
      jsonData.description = (data as any).description;
    jsonData.slug = (data as any).handle ?? (data as any).slug ?? "";
    if (data.price !== undefined) jsonData.basePrice = Number(data.price);
    if (data.inventory !== undefined)
      jsonData.stockQuantity = Number(data.inventory);
    if ((data as any).categoryId)
      jsonData.categoryId = (data as any).categoryId;
    // Map status: frontend "published" -> backend "active"
    if ((data as any).status !== undefined) {
      const s = (data as any).status;
      jsonData.status = s === "published" ? "active" : s === "draft" ? "draft" : s;
    }
    // Send uploaded images array to backend
    if (data.images && data.images.length > 0) {
      jsonData.images = data.images.map((img) => ({
        id: img.id, // Preserve id for existing images
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
    // Map frontend field names → backend field names
    if ((data as any).title !== undefined)
      jsonData.name = (data as any).title;
    else if ((data as any).name !== undefined)
      jsonData.name = (data as any).name;
    if ((data as any).description !== undefined)
      jsonData.description = (data as any).description;
    if ((data as any).handle !== undefined)
      jsonData.slug = (data as any).handle;
    else if ((data as any).slug !== undefined)
      jsonData.slug = (data as any).slug;
    // Send status directly - backend uses ProductStatus enum
    if ((data as any).status !== undefined) {
      // Convert frontend "published" -> backend "active"
      const s = (data as any).status;
      jsonData.status = s === "published" ? "active" : s === "draft" ? "draft" : s;
    }
    if (data.price !== undefined)
      jsonData.basePrice = Number(data.price); // Ensure number type
    if (data.inventory !== undefined)
      jsonData.stockQuantity = Number(data.inventory); // Ensure number type
    if ((data as any).categoryId !== undefined)
      jsonData.categoryId = (data as any).categoryId;
    // Send images array to backend (replace all images)
    if (data.images && data.images.length > 0) {
      jsonData.images = data.images.map((img) => ({
        id: img.id, // Preserve id for existing images
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
    // Use the public categories endpoint from Express backend
    const result = await api.get<Record<string, unknown>>("/products/categories");
    if (!result.success || !result.data) {
      return { data: [] };
    }
    const raw = Array.isArray(result.data)
      ? result.data
      : (result.data as any).categories ?? (result.data as any).data ?? [];
    const categories: Category[] = raw.map((cat: Record<string, unknown>) => ({
      id: cat.id as string,
      name: (cat.name as string) ?? "",
      slug: (cat.slug as string) ?? "",
      description: (cat.description as string | null) ?? null,
      image: (cat.imageUrl as string) ?? null,
      parentId: (cat.parentId as string | null) ?? null,
      isActive: (cat.isActive as boolean) ?? true,
      sortOrder: (cat.sortOrder as number) ?? 0,
    }));
    return { data: categories };
  },

  create: async (data: Partial<Category>) => {
    // No admin categories CRUD endpoint on Express backend
    throw new Error("Category CRUD not available via admin API");
  },

  update: async (id: string, data: Partial<Category>) => {
    throw new Error("Category CRUD not available via admin API");
  },

  delete: async (id: string) => {
    throw new Error("Category CRUD not available via admin API");
  },
};

// ============================================================
// Inventory
// ============================================================

export const adminInventory = {
  getLowStock: async (threshold?: number) => {
    const result = await adminProducts.list({ limit: 500 });
    const products = (result.data ?? []) as any[];
    const lowStock: InventoryItem[] = [];
    const thr = threshold ?? 10;

    for (const product of products) {
      const qty = Number(product.stockQuantity ?? 0);
      if (qty <= thr) {
        lowStock.push({
          id: product.id,
          variantId: product.id,
          quantity: qty,
          lowStockThreshold: thr,
          variant: {
            id: product.id,
            sku: product.sku ?? "-",
            name: product.name ?? "Produk",
            product: { id: product.id, name: product.name ?? "Produk" },
          },
        });
      }
    }

    return { data: lowStock };
  },

  getVariant: async (variantId: string) => {
    return null as unknown as InventoryItem;
  },

  restock: async (productId: string, quantity: number) => {
    await adminProducts.update(productId, { inventory: quantity });
    return {
      id: productId,
      variantId: productId,
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
    try {
      const result = await api.get<Record<string, unknown>>("/admin/users", {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        ...(params?.search && { search: params.search }),
        ...(params?.role && { role: params.role }),
      });

      if (!result.success || !result.data) {
        return { data: { users: [], total: 0, page: 1, limit: 50 } };
      }

      const data = result.data as Record<string, unknown>;
      const users = (data.users ?? []) as User[];
      const pagination = data.pagination as
        | Record<string, unknown>
        | undefined;

      return {
        data: {
          users,
          total: (pagination?.total as number) ?? users.length,
          page: (pagination?.page as number) ?? 1,
          limit: (pagination?.limit as number) ?? 50,
        },
      };
    } catch {
      return { data: { users: [], total: 0, page: 1, limit: 50 } };
    }
  },

  getDetail: async (id: string) => {
    try {
      const result = await api.get<Record<string, unknown>>(
        `/admin/users/${id}`,
      );
      if (!result.success || !result.data) return null;
      const data = result.data as Record<string, unknown>;
      return (data.user ?? data) as User;
    } catch {
      return null;
    }
  },

  updateRole: async (id: string, role: UserRole) => {
    const result = await apiRequest<Record<string, unknown>>(
      "PATCH",
      `/admin/users/${id}/role`,
      { role },
    );
    if (!result.success || !result.data)
      throw new Error("Failed to update user role");
    const data = result.data as Record<string, unknown>;
    return (data.user ?? data) as User;
  },

  toggleActive: async (id: string) => {
    const result = await apiRequest<Record<string, unknown>>(
      "PATCH",
      `/admin/users/${id}/toggle-active`,
    );
    if (!result.success || !result.data)
      throw new Error("Failed to toggle user status");
    const data = result.data as Record<string, unknown>;
    return (data.user ?? data) as User;
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
    basePrice?: number;
    trackingUrl?: string;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }) => {
    const result = await api.post<Record<string, unknown>>(
      "/admin/expeditions",
      {
        name: data.name,
        code: data.code,
        type: data.type,
        basePrice: data.basePrice ?? 0,
        ...(data.trackingUrl && { trackingUrl: data.trackingUrl }),
        ...(data.description && { description: data.description }),
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
      basePrice?: number;
      trackingUrl?: string;
      description?: string;
      isActive?: boolean;
      isDefault?: boolean;
    },
  ) => {
    // Map pricing.flat_rate → basePrice for Express backend
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.code !== undefined) payload.code = data.code;
    if (data.type !== undefined) payload.type = data.type;
    if (data.basePrice !== undefined) payload.basePrice = data.basePrice;
    if (data.trackingUrl !== undefined) payload.trackingUrl = data.trackingUrl;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.isDefault !== undefined) payload.isDefault = data.isDefault;
    
    const result = await api.put<Record<string, unknown>>(
      `/admin/expeditions/${id}`,
      payload,
    );
    
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
      basePrice: Number(exp.basePrice ?? 0),
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
