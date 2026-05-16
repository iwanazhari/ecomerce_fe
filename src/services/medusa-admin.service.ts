/**
 * Medusa Admin Services — CRUD operations via Medusa Admin SDK v2
 * Replaces the legacy custom Express backend (localhost:3001)
 */

import { medusa } from '@/lib/medusa/client'

// ============================================================
// Products
// ============================================================

export const adminProducts = {
  list: async (params?: { limit?: number; offset?: number; q?: string; categoryId?: string }) => {
    const { products, count } = await medusa.admin.product.list({
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      // Use specific relation fields — *variants.* breaks prices in Medusa v2
      fields: 'id,title,subtitle,status,description,handle,thumbnail,*images,*variants,*variants.prices,*variants.inventory_items',
      ...(params?.q && { q: params.q }),
      ...(params?.categoryId && { category_id: params.categoryId }),
    })
    return { data: products, total: count ?? 0 }
  },

  get: async (id: string) => {
    // Use specific relation fields — *variants.* breaks prices in Medusa v2
    const { product } = await medusa.admin.product.retrieve(id, {
      fields: 'id,title,subtitle,status,description,handle,thumbnail,*images,*variants,*variants.prices,*variants.inventory_items',
    })
    return product
  },

  create: async (data: {
    title: string
    description?: string
    status?: string
    categories?: { id: string }[]
    thumbnail?: string
    images?: { url: string }[]
    options?: { title: string; values: string[] }[]
    variants?: {
      title: string
      sku?: string
      prices: { currency_code: string; amount: number }[]
      manage_inventory?: boolean
      inventory_quantity?: number
      options?: Record<string, string>
    }[]
  }) => {
    const { product } = await medusa.admin.product.create(data)
    return product
  },

  update: async (id: string, data: {
    title?: string
    description?: string
    status?: string
    thumbnail?: string
    categories?: { id: string }[]
    images?: { url: string }[]
  }) => {
    const { product } = await medusa.admin.product.update(id, data)
    return product
  },

  delete: async (id: string) => {
    await medusa.admin.product.delete(id)
  },

  /**
   * Update a product variant via the dedicated SDK method.
   * HTTP: POST /admin/products/{productId}/variants/{variantId}
   * NOTE: Prices are updated separately via batchVariants if needed.
   * For simplicity, we update the variant fields and then use batchVariants for prices.
   */
  updateVariant: async (productId: string, variantId: string, data: {
    title?: string
    sku?: string
    prices?: { currency_code: string; amount: number }[]
  }) => {
    // Extract prices from data (not a field on the variant update endpoint)
    const { prices, ...variantFields } = data
    // Update variant fields (title, sku, etc.)
    const { product } = await medusa.admin.product.updateVariant(productId, variantId, variantFields)
    // If prices changed, use batchVariants to update them
    if (prices && prices.length > 0) {
      await medusa.admin.product.batchVariants(productId, {
        update: [{ id: variantId, prices }],
      })
    }
    return product
  },

  /**
   * Create a new variant using the dedicated SDK endpoint.
   * HTTP: POST /admin/products/{productId}/variants
   */
  createVariant: async (productId: string, data: {
    title: string
    sku?: string
    prices: { currency_code: string; amount: number }[]
    manage_inventory?: boolean
  }) => {
    const { product } = await medusa.admin.product.createVariant(productId, data)
    return product
  },

  /**
   * Delete a variant using the dedicated SDK endpoint.
   * HTTP: DELETE /admin/products/{productId}/variants/{variantId}
   */
  deleteVariant: async (productId: string, variantId: string) => {
    await medusa.admin.product.deleteVariant(productId, variantId)
  },
}

// ============================================================
// Orders
// ============================================================

export const adminOrders = {
  list: async (params?: { limit?: number; offset?: number; status?: string; q?: string }) => {
    // Don't use fields param — default response includes items, customer, fulfillments
    const { orders, count } = await medusa.admin.order.list({
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      ...(params?.status && { status: params.status }),
      ...(params?.q && { q: params.q }),
    })
    return { data: orders, total: count ?? 0 }
  },

  get: async (id: string) => {
    // Don't use fields param — default response includes all order relations
    const { order } = await medusa.admin.order.retrieve(id)
    return order
  },

  /**
   * Archive an order (Medusa v2 doesn't have a generic status update — use archive instead).
   */
  archive: async (orderId: string) => {
    const { order } = await medusa.admin.order.archive(orderId)
    return order
  },

  /**
   * Create fulfillment for an order.
   * Automatically fetches the order to get line item IDs if not provided.
   * In Medusa v2, items must be { id: order_line_item_id, quantity: number }.
   */
  fulfill: async (orderId: string, items?: { id: string; quantity: number }[]) => {
    let itemIds = items
    if (!itemIds) {
      // Fetch order to get line item IDs
      const { order } = await medusa.admin.order.retrieve(orderId, {
        fields: 'id,*items',
      })
      itemIds = (order.items ?? []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity ?? 1,
      }))
    }
    const { order } = await medusa.admin.order.createFulfillment(orderId, {
      items: itemIds,
      no_notification: false,
    })
    return order
  },

  /**
   * Create shipment for an existing fulfillment.
   * Automatically fetches the fulfillment to get fulfillment item IDs if not provided.
   * In Medusa v2, items must be { id: fulfillment_item_id, quantity: number }.
   */
  createShipment: async (orderId: string, fulfillmentId: string, items?: { id: string; quantity: number }[]) => {
    let itemIds = items
    if (!itemIds) {
      // Fetch order to get fulfillment item IDs
      const { order } = await medusa.admin.order.retrieve(orderId, {
        fields: 'id,*fulfillments,*fulfillments.items',
      })
      const fulfillment = (order.fulfillments ?? []).find((f: any) => f.id === fulfillmentId)
      itemIds = (fulfillment?.items ?? []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity ?? 1,
      }))
    }
    const { order } = await medusa.admin.order.createShipment(orderId, fulfillmentId, {
      items: itemIds ?? [],
      no_notification: false,
    })
    return order
  },

  /**
   * Mark an order as delivered (mark fulfillment as delivered).
   */
  markDelivered: async (orderId: string, fulfillmentId: string) => {
    const { order } = await medusa.admin.order.markAsDelivered(orderId, fulfillmentId)
    return order
  },

  /**
   * Cancel an order.
   */
  cancel: async (orderId: string) => {
    const { order } = await medusa.admin.order.cancel(orderId)
    return order
  },
}

// ============================================================
// Customers
// ============================================================

export const adminCustomers = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const { customers, count } = await medusa.admin.customer.list({
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    })
    return { data: customers, total: count ?? 0 }
  },

  get: async (id: string) => {
    const { customer } = await medusa.admin.customer.retrieve(id)
    return customer
  },
}

// ============================================================
// Categories
// ============================================================

export const adminCategories = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const { product_categories: categories, count } = await medusa.admin.productCategory.list({
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    })
    return { data: categories, total: count ?? 0 }
  },

  get: async (id: string) => {
    const { product_category: category } = await medusa.admin.productCategory.retrieve(id)
    return category
  },

  create: async (data: { name: string; handle?: string; description?: string; parent_category_id?: string }) => {
    const { product_category: category } = await medusa.admin.productCategory.create(data)
    return category
  },

  update: async (id: string, data: { name?: string; handle?: string; description?: string }) => {
    const { product_category: category } = await medusa.admin.productCategory.update(id, data)
    return category
  },

  delete: async (id: string) => {
    await medusa.admin.productCategory.delete(id)
  },
}

// ============================================================
// Inventory
// ============================================================

/**
 * Get the default stock location ID (Waterpro Warehouse).
 * Hardcoded from the seeded location: sloc_01KRGBBXHJ90FMN29MHYZ93WT8
 */
const DEFAULT_LOCATION_ID = 'sloc_01KRGBBXHJ90FMN29MHYZ93WT8'

export const adminInventory = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const { inventory_items: items, count } = await medusa.admin.inventoryItem.list({
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      // No fields param — default includes location_levels
    })
    return { data: items, total: count ?? 0 }
  },

  get: async (id: string) => {
    // Don't use fields param — default includes location_levels
    const { inventory_item: item } = await medusa.admin.inventoryItem.retrieve(id)
    return item
  },

  update: async (id: string, data: { sku?: string; title?: string }) => {
    const { inventory_item: item } = await medusa.admin.inventoryItem.update(id, data)
    return item
  },

  /**
   * Restock an inventory item to a specific quantity at the default location.
   * Checks if a location level already exists:
   * - If exists: uses updateLevel (POST /location-levels/{locationId})
   * - If new: uses batch create (POST /location-levels/batch)
   */
  restock: async (id: string, quantity: number, locationId?: string) => {
    const locId = locationId ?? DEFAULT_LOCATION_ID
    // Check if location level already exists
    const levels = await medusa.admin.inventoryItem.listLevels(id)
    const existingLevel = (levels.inventory_levels ?? []).find(
      (l: any) => l.location_id === locId,
    )
    if (existingLevel) {
      // Update existing level
      const result = await medusa.admin.inventoryItem.updateLevel(
        id,
        locId,
        { stocked_quantity: quantity },
      )
      return result.inventory_item
    } else {
      // Create new level via batch
      const result = await medusa.admin.inventoryItem.batchInventoryItemLocationLevels(
        id,
        { create: [{ location_id: locId, stocked_quantity: quantity }] },
      )
      // Batch response is { created, updated, deleted } — no inventory_item at root
      // Fetch the updated item to return consistent shape
      const { inventory_item: item } = await medusa.admin.inventoryItem.retrieve(id)
      return item
    }
  },

  /**
   * Add stock (increment) for an inventory item at the default location.
   */
  addStock: async (id: string, additionalQty: number, locationId?: string) => {
    const locId = locationId ?? DEFAULT_LOCATION_ID
    // Get current stock
    const levels = await medusa.admin.inventoryItem.listLevels(id)
    const currentLevel = (levels.inventory_levels ?? []).find(
      (l: any) => l.location_id === locId,
    )
    const currentQty = currentLevel?.stocked_quantity ?? 0
    // Use same logic as restock: update if exists, create if new
    if (currentLevel) {
      const result = await medusa.admin.inventoryItem.updateLevel(
        id,
        locId,
        { stocked_quantity: currentQty + additionalQty },
      )
      return result.inventory_item
    } else {
      const result = await medusa.admin.inventoryItem.batchInventoryItemLocationLevels(
        id,
        { create: [{ location_id: locId, stocked_quantity: currentQty + additionalQty }] },
      )
      const { inventory_item: item } = await medusa.admin.inventoryItem.retrieve(id)
      return item
    }
  },

  /**
   * Get low stock items (total stocked_quantity across locations <= threshold).
   */
  getLowStock: async (threshold: number = 10) => {
    const { data: items } = await adminInventory.list({ limit: 200 })
    const lowStock = items.filter((item: any) => {
      const qty = item.location_levels?.reduce(
        (sum: number, loc: any) => sum + (loc.stocked_quantity ?? 0),
        0,
      ) ?? item.stocked_quantity ?? 0
      return qty <= threshold
    })
    return lowStock
  },

  /**
   * Get stock levels for an inventory item at all locations.
   */
  getLevels: async (id: string) => {
    const { inventory_levels: levels } = await medusa.admin.inventoryItem.listLevels(id)
    return levels ?? []
  },
}

// ============================================================
// Expeditions (custom module via direct API)
// ============================================================

export const adminExpeditions = {
  list: async (params?: { limit?: number; offset?: number; q?: string; code?: string; is_active?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.q) query.set('q', params.q)
    if (params?.code) query.set('code', params.code)
    if (params?.is_active !== undefined) query.set('is_active', String(params.is_active))

    const res = await (medusa.client as any).fetch(`/admin/expeditions?${query.toString()}`)
    return { data: res.expeditions ?? [], total: res.count ?? 0 }
  },

  get: async (id: string) => {
    const res = await (medusa.client as any).fetch(`/admin/expeditions/${id}`)
    return res.expedition
  },

  create: async (data: {
    name: string
    code: string
    tracking_url_template?: string
    is_active?: boolean
    description?: string
    flat_rate?: number
    is_store_delivery?: boolean
  }) => {
    const res = await (medusa.client as any).fetch('/admin/expeditions', {
      method: 'POST',
      body: data,
    })
    return res.expedition
  },

  update: async (id: string, data: {
    name?: string
    code?: string
    tracking_url_template?: string
    is_active?: boolean
    description?: string
    flat_rate?: number
    is_store_delivery?: boolean
  }) => {
    const res = await (medusa.client as any).fetch(`/admin/expeditions/${id}`, {
      method: 'POST',
      body: data,
    })
    return res.expedition
  },

  delete: async (id: string) => {
    await (medusa.client as any).fetch(`/admin/expeditions/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get all active shipping options for checkout.
   * Returns both external couriers and store delivery options.
   */
  getShippingOptions: async () => {
    const res = await (medusa.client as any).fetch('/admin/expeditions?is_active=true')
    return (res.expeditions ?? []).map((exp: any) => ({
      id: exp.id,
      name: exp.name,
      code: exp.code,
      amount: exp.flat_rate ?? 0,
      is_store_delivery: exp.is_store_delivery ?? false,
    }))
  },
}

// ============================================================
// Provinces (custom module via direct API)
// ============================================================

export const adminProvinces = {
  list: async (params?: { limit?: number; offset?: number; q?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.q) query.set('q', params.q)

    const res = await (medusa.client as any).fetch(`/admin/provinces?${query.toString()}`)
    return { data: res.provinces ?? [], total: res.count ?? 0 }
  },

  get: async (id: string) => {
    const res = await (medusa.client as any).fetch(`/admin/provinces/${id}`)
    return res.province
  },

  create: async (data: { name: string; code?: string }) => {
    const res = await (medusa.client as any).fetch('/admin/provinces', {
      method: 'POST',
      body: data,
    })
    return res.province
  },

  update: async (id: string, data: { name?: string; code?: string }) => {
    const res = await (medusa.client as any).fetch(`/admin/provinces/${id}`, {
      method: 'POST',
      body: data,
    })
    return res.province
  },

  delete: async (id: string) => {
    await (medusa.client as any).fetch(`/admin/provinces/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================
// Analytics (computed from Medusa data)
// ============================================================

export const adminAnalytics = {
  getOverview: async () => {
    // Fetch total counts
    const { total: totalOrders } = await adminOrders.list({ limit: 1 })
    const { total: totalCustomers } = await adminCustomers.list({ limit: 1 })
    const { total: totalProducts } = await adminProducts.list({ limit: 1 })

    // Fetch all orders for revenue calculation (paginated)
    let totalRevenue = 0
    if (totalOrders > 0) {
      const batchSize = 100
      let offset = 0
      while (offset < totalOrders) {
        const { data: batch } = await adminOrders.list({ limit: batchSize, offset })
        for (const order of batch ?? []) {
          totalRevenue += order.total ?? order.subtotal ?? 0
        }
        offset += batchSize
      }
    }

    return {
      totalRevenue,
      totalOrders: totalOrders ?? 0,
      totalCustomers: totalCustomers ?? 0,
      totalProducts: totalProducts ?? 0,
      topProducts: [],
    }
  },
}

// ============================================================
// Stock Locations
// ============================================================

export const adminStockLocations = {
  list: async () => {
    const res = await (medusa.client as any).fetch('/admin/stock-locations')
    return res.stock_locations ?? []
  },

  get: async (id: string) => {
    const res = await (medusa.client as any).fetch(`/admin/stock-locations/${id}`)
    return res.stock_location
  },
}

// ============================================================
// Uploads (file/image uploads to MinIO via Medusa)
// ============================================================

export const adminUploads = {
  /**
   * Upload one or more files to MinIO.
   * @param files - FileList from <input type="file"> or array of File objects
   * @returns Array of { id, url } for each uploaded file
   */
  uploadFiles: async (files: FileList | File[]): Promise<{ id: string; url: string }[]> => {
    const result = await medusa.admin.upload.create({ files: files as any })
    return (result.files ?? []).map((f: any) => ({ id: f.id, url: f.url }))
  },

  /**
   * Delete a file from MinIO by its file ID.
   */
  deleteFile: async (fileId: string): Promise<void> => {
    await medusa.admin.upload.delete(fileId)
  },

  /**
   * Get a presigned URL for direct upload.
   */
  getPresignedUrl: async (name: string, size: number, type: string): Promise<{ url: string; fileKey: string }> => {
    const result = await medusa.admin.upload.presignedUrl({ name, size, type })
    return { url: result.upload_url, fileKey: result.file_key }
  },
}
