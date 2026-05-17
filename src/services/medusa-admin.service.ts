/**
 * Medusa Admin Service — backward-compatibility shim.
 * Re-exports from services/admin.service.ts (Express backend).
 * All admin pages import from here.
 */

export {
  adminProducts,
  adminOrders,
  adminUsers,
  adminCategories,
  adminInventory,
  adminExpeditions,
  adminProvinces,
  adminAnalytics,
  adminStockLocations,
  adminUploads,
} from "@/services/admin.service";
