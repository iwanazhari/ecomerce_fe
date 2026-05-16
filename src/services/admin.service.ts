import { apiClient } from '@/services/api/client'
import { ADMIN_API } from '@/constants'
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
} from '@/types'

// ============================================================
// Analytics
// ============================================================

export const adminAnalytics = {
  getOverview: () => apiClient.get<DashboardOverview>(ADMIN_API.OVERVIEW),
  getSales: (params?: { startDate?: string; endDate?: string; groupBy?: 'day' | 'week' | 'month' }) =>
    apiClient.get<SalesAnalytics>(ADMIN_API.ANALYTICS_SALES, params),
  getTopProducts: (params?: { limit?: number; startDate?: string; endDate?: string }) =>
    apiClient.get<TopProduct[]>(ADMIN_API.ANALYTICS_TOP_PRODUCTS, params),
  getOrderStats: () => apiClient.get<OrderStats>(ADMIN_API.ANALYTICS_ORDER_STATS),
  getActivity: (params?: { limit?: number; offset?: number; type?: string }) =>
    apiClient.get<ActivityLog[]>(ADMIN_API.ANALYTICS_ACTIVITY, params),
}

export const adminProducts = {
  list: (params?: { page?: number; limit?: number; search?: string; categoryId?: string; status?: string }) =>
    apiClient.get<Product[]>(ADMIN_API.PRODUCTS, params),
  create: (data: Partial<Product>) => apiClient.post<Product>(ADMIN_API.PRODUCTS, data),
  update: (id: string, data: Partial<Product>) => apiClient.put<Product>(ADMIN_API.PRODUCT(id), data),
  delete: (id: string) => apiClient.delete<void>(ADMIN_API.PRODUCT(id)),
  uploadImages: (productId: string, formData: FormData) =>
    apiClient.postMultipart(ADMIN_API.PRODUCT(productId) + '/images', formData),
  deleteImage: (imageId: string) => apiClient.delete<void>(`${ADMIN_API.PRODUCTS}/images/${imageId}`),
  updateImage: (imageId: string, data: { sortOrder?: number; alt?: string; isPrimary?: boolean }) =>
    apiClient.put<ProductImage>(`${ADMIN_API.PRODUCTS}/images/${imageId}`, data),
  createVariant: (productId: string, data: Partial<ProductVariant>) =>
    apiClient.post<ProductVariant>(ADMIN_API.CREATE_VARIANT(productId), data),
  updateVariant: (variantId: string, data: Partial<ProductVariant>) =>
    apiClient.put<ProductVariant>(ADMIN_API.UPDATE_VARIANT(variantId), data),
  deleteVariant: (variantId: string) => apiClient.delete<void>(ADMIN_API.DELETE_VARIANT(variantId)),
}

export const adminOrders = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    apiClient.get<Order[]>(ADMIN_API.ORDERS, params),
  getDetail: (orderId: string) => apiClient.get<Order>(ADMIN_API.ORDER(orderId)),
  updateStatus: (orderId: string, status: string, notes?: string) =>
    apiClient.put<Order>(ADMIN_API.UPDATE_ORDER_STATUS(orderId), { status, notes }),
}

export const adminCategories = {
  list: (params?: { includeInactive?: boolean }) =>
    apiClient.get<Category[]>(ADMIN_API.CATEGORIES, params),
  create: (data: Partial<Category>) => apiClient.post<Category>(ADMIN_API.CATEGORIES, data),
  update: (id: string, data: Partial<Category>) => apiClient.put<Category>(ADMIN_API.CATEGORY(id), data),
  delete: (id: string) => apiClient.delete<void>(ADMIN_API.CATEGORY(id)),
}

export const adminInventory = {
  getLowStock: (threshold?: number) =>
    apiClient.get<InventoryItem[]>(ADMIN_API.INVENTORY_LOW_STOCK, { threshold }),
  getVariant: (variantId: string) => apiClient.get<InventoryItem>(ADMIN_API.INVENTORY_VARIANT(variantId)),
  restock: (variantId: string, quantity: number) =>
    apiClient.post<InventoryItem>(ADMIN_API.RESTOCK(variantId), { quantity }),
}

export const adminUsers = {
  list: (params?: { page?: number; limit?: number; role?: UserRole; search?: string }) =>
    apiClient.get<{ users: User[]; total: number; page: number; limit: number }>(ADMIN_API.USERS, params),
  getDetail: (id: string) => apiClient.get<User>(ADMIN_API.USER(id)),
  updateRole: (id: string, role: UserRole) =>
    apiClient.put<User>(ADMIN_API.UPDATE_USER_ROLE(id), { role }),
}
