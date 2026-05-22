"use client";

import { useEffect, useState, useCallback } from "react";
import { adminInventory, adminProducts } from "@/services/medusa-admin.service";
import {
  Button,
  Card,
  CardTitle,
  Badge,
  Modal,
  Input,
} from "@/components/ui/neu";
import { IconWell } from "@/components/ui/neu/Card";
import { Boxes, AlertTriangle, Plus, Search, PackageCheck } from "lucide-react";

type InventoryItem = {
  id: string;
  sku?: string;
  title?: string;
  description?: string;
  stocked_quantity?: number;
  reserved_quantity?: number;
  location_levels?: {
    location_id: string;
    stocked_quantity: number;
    reserved_quantity: number;
  }[];
};

type DisplayItem = {
  id: string;
  sku: string;
  productName: string; // resolved from product, not inventory item title
  inventoryTitle: string; // fallback if no product found
  quantity: number;
  reserved: number;
  available: number;
};

function mapItem(
  item: InventoryItem,
  productNames: Record<string, string>,
): DisplayItem {
  const totalStocked =
    item.location_levels?.reduce(
      (sum, loc) => sum + (loc.stocked_quantity ?? 0),
      0,
    ) ??
    item.stocked_quantity ??
    0;
  const totalReserved =
    item.location_levels?.reduce(
      (sum, loc) => sum + (loc.reserved_quantity ?? 0),
      0,
    ) ??
    item.reserved_quantity ??
    0;
  return {
    id: item.id,
    sku: item.sku ?? "-",
    productName: productNames[item.id] ?? item.title ?? "Produk",
    inventoryTitle: item.title ?? "Produk",
    quantity: totalStocked,
    reserved: totalReserved,
    available: totalStocked - totalReserved,
  };
}

export default function AdminInventoryPage() {
  const [allItems, setAllItems] = useState<DisplayItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<DisplayItem | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restocking, setRestocking] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, lowRes] = await Promise.all([
        adminProducts.list({ limit: 200 }),
        adminInventory.getLowStock(threshold),
      ]);

      // Extract inventory items from products
      const allItems: DisplayItem[] = [];
      for (const product of productsRes.data ?? []) {
        const p = product as any;
        for (const variant of p.variants ?? []) {
          const quantity = variant.inventory ?? variant.inventory_quantity ?? 0;
          allItems.push({
            id: variant.id,
            sku: variant.sku ?? "-",
            productName: p.title ?? p.name ?? "Produk",
            inventoryTitle: variant.title ?? "",
            quantity,
            reserved: 0,
            available: quantity, // Available = quantity - reserved
          });
        }
      }

      setAllItems(allItems);
      setLowStockItems(
        (lowRes.data ?? []).map((item: any) => {
          const quantity = item.quantity ?? 0;
          return {
            id: item.id,
            sku: item.variant?.sku ?? "-",
            productName: item.variant?.product?.name ?? item.variant?.title ?? "Produk",
            inventoryTitle: item.variant?.title ?? "",
            quantity,
            reserved: 0,
            available: quantity,
          };
        }),
      );
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openRestock = (item: DisplayItem) => {
    setRestockItem(item);
    setRestockQty("");
    setRestockModalOpen(true);
  };

  const handleRestock = async () => {
    if (!restockItem || !restockQty) return;
    setRestocking(true);
    try {
      const newQty = restockItem.quantity + parseInt(restockQty);
      await adminInventory.restock(restockItem.id, newQty);
      setRestockModalOpen(false);
      setRestockItem(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + (err.message ?? "Unknown error"));
    } finally {
      setRestocking(false);
    }
  };

  const filtered = allItems.filter(
    (item) =>
      !search ||
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Inventori
          </h1>
          <p className="text-sm text-foreground-muted">
            {allItems.length} item total · {lowStockItems.length} stok menipis
          </p>
        </div>
      </div>

      {/* Search + Threshold */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-foreground">
            Threshold:
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
            className="w-20 h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 text-sm text-foreground text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card padding="md">
          <CardTitle className="flex items-center gap-2 text-error">
            <AlertTriangle className="size-5" />
            Stok Menipis ({lowStockItems.length} item)
          </CardTitle>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-2xl shadow-inset-small"
              >
                <div>
                  <p className="font-bold text-foreground text-sm">
                    {item.productName}
                  </p>
                  <p className="text-xs text-foreground-muted">{item.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-error">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => openRestock(item)}
                    className="size-10 rounded-2xl shadow-extruded-sm bg-primary text-white flex items-center justify-center hover:shadow-extruded-lg transition-all"
                    aria-label="Restock"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Inventory */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Produk
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Stok
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Tersedia
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-foreground-muted"
                  >
                    <Boxes className="size-10 mx-auto mb-3 text-foreground-subtle" />
                    <p>Tidak ada item ditemukan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.quantity <= threshold;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">
                          {item.productName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground-muted font-mono">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.available}
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <Badge variant="error">Stok Rendah</Badge>
                        ) : (
                          <Badge variant="success">Aman</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openRestock(item)}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                          aria-label="Restock"
                        >
                          <Plus className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Restock Modal */}
      <Modal
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
        title="Tambah Stok"
        size="sm"
      >
        {restockItem && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl shadow-inset-deep">
              <p className="font-bold text-foreground">
                {restockItem.productName}
              </p>
              <p className="text-sm text-foreground-muted">
                SKU: {restockItem.sku}
              </p>
              <p className="text-sm text-foreground-muted mt-1">
                Stok saat ini:{" "}
                <span className="font-bold text-error">
                  {restockItem.quantity}
                </span>
              </p>
            </div>
            <Input
              label="Jumlah Tambahan"
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              min="1"
              required
            />
            {restockQty && parseInt(restockQty) > 0 && (
              <div className="flex items-center justify-between p-4 rounded-2xl shadow-inset-deep">
                <span className="text-sm text-foreground-muted">Stok baru</span>
                <span className="text-xl font-extrabold text-primary">
                  {restockItem.quantity + parseInt(restockQty)}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRestockModalOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleRestock}
                className="flex-1"
                isLoading={restocking}
                disabled={!restockQty || parseInt(restockQty) <= 0}
              >
                <PackageCheck className="size-4" />
                Tambah Stok
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
