"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminProducts,
  adminCategories,
  adminInventory,
  adminStockLocations,
} from "@/services/medusa-admin.service";
import { formatCurrency, parseCurrency } from "@/utils";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Pagination } from "@/components/ui/data-pagination";
import {
  Button,
  Input,
  Modal,
  Card,
  CardTitle,
  Badge,
  IconWell,
  ImageUpload,
  type UploadedImage,
} from "@/components/ui/neu";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  ImageOff,
  PackageOpen,
  Tag,
  HelpCircle,
  Minus,
  Plus as PlusIcon,
  Loader2,
} from "lucide-react";

type MedusaProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  status?: string;
  isActive?: boolean; // Express backend uses isActive
  created_at?: string;
  variants?: {
    id: string;
    title: string;
    sku?: string;
    price?: string | number; // Express backend returns price directly
    prices?: { amount: number; currency_code: string }[];
    inventory?: number; // Express backend returns inventory directly
    inventory_quantity?: number;
    inventory_items?: { inventory_item_id: string }[];
  }[];
  images?: { id: string; url: string; alt?: string }[];
  categories?: { id: string; name: string; handle: string }[];
};

type DisplayProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail?: string;
  status: string;
  variantCount: number;
  imageCount: number;
  category?: string;
  stock: number;
  description?: string;
  sku?: string;
  categoryId?: string;
};

function mapProduct(p: MedusaProduct): DisplayProduct {
  const firstVariant = p.variants?.[0];

  // Express backend returns price directly on variant, not nested in prices array
  const variantPrice = firstVariant?.price ?? firstVariant?.prices?.[0]?.amount;
  const priceNum = typeof variantPrice === "string" ? parseInt(variantPrice, 10) : variantPrice;

  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    price: priceNum ?? 0,
    thumbnail: p.thumbnail ?? p.images?.[0]?.url,
    // Convert isActive (backend) to status (frontend)
    status: p.isActive ? "published" : "draft",
    variantCount: p.variants?.length ?? 0,
    imageCount: p.images?.length ?? 0,
    category: p.categories?.[0]?.name,
    stock: firstVariant?.inventory ?? firstVariant?.inventory_quantity ?? 0,
    description: p.description,
    sku: firstVariant?.sku,
    categoryId: p.categories?.[0]?.id,
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: "success" | "warning" | "error" | "default" }
  > = {
    published: { label: "Aktif", variant: "success" },
    draft: { label: "Draft", variant: "warning" },
    proposed: { label: "Proposal", variant: "default" },
    rejected: { label: "Ditolak", variant: "error" },
  };
  const s = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [pendingRefetch, setPendingRefetch] = useState(false); // Track pending refetch after save

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formPriceRaw, setFormPriceRaw] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formImages, setFormImages] = useState<UploadedImage[]>([]);
  const [formStatus, setFormStatus] = useState<"draft" | "published">(
    "published", // Default to published (active) for new products
  );
  const [formStock, setFormStock] = useState("0");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  const [variantId, setVariantId] = useState<string>("");
  const [inventoryItemId, setInventoryItemId] = useState<string>("");

  // Price input handlers
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setFormPriceRaw(raw);
    if (raw) {
      setFormPrice(formatCurrency(parseInt(raw, 10)));
    } else {
      setFormPrice("");
    }
  };

  const handlePriceBlur = () => {
    if (formPriceRaw) {
      setFormPrice(formatCurrency(parseInt(formPriceRaw, 10)));
    }
  };

  const handlePriceStep = (delta: number) => {
    const current = parseCurrency(formPrice);
    const newVal = Math.max(0, current + delta);
    setFormPriceRaw(String(newVal));
    setFormPrice(formatCurrency(newVal));
  };

  const fetchData = useCallback(async (skipCache = false) => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        adminProducts.list({
          page: currentPage,
          limit: pageSize,
          search: search || undefined,
          ...(skipCache && { _t: Date.now().toString() }), // Cache busting
        }),
        adminCategories.list(),
      ]);

      const productsData = (productsRes.data as any) ?? [];
      setProducts(productsData.map(mapProduct));
      setTotal(productsRes.meta?.total ?? productsData.length);
      setCategories(
        (categoriesRes.data ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [search, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket listener for real-time product updates
  useWebSocket("realtime", (data) => {
    console.log("[WebSocket] realtime event received:", data);

    // Handle stock:updated events - update status badge optimistically
    if (data?.event === "stock:updated" && data?.data?.productId) {
      const { productId, isActive } = data.data;
      const newStatus = isActive === true ? "published" : "draft";

      console.log("[WebSocket] Updating product", productId, "status to:", newStatus);
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return { ...p, status: newStatus };
        }
        return p;
      }));

      // Schedule a refetch after 2 seconds to sync with backend
      setPendingRefetch(true);
      setTimeout(() => {
        console.log("[WebSocket] Executing pending refetch");
        fetchData(true);
        setPendingRefetch(false);
      }, 2000);
    }

    // Handle cache:invalidated events - refetch data for ALL admin pages
    if (data?.event === "cache:invalidated") {
      console.log("[WebSocket] Cache invalidated:", data);
      
      // Product cache invalidation - refetch products list
      if (data?.type === "product") {
        console.log("[WebSocket] Product cache invalidated, scheduling refetch...");
        setPendingRefetch(true);
        setTimeout(() => {
          console.log("[WebSocket] Refetching products data");
          fetchData(true);
          setPendingRefetch(false);
        }, 1000);
      }
      
      // Order cache invalidation - can be used by orders page
      if (data?.type === "order") {
        console.log("[WebSocket] Order cache invalidated");
        // Orders page can listen to this and refetch
      }
    }
  }, true);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormPriceRaw("");
    setFormSku("");
    setFormCategoryId("");
    setFormImages([]);
    setFormStatus("published");
    setFormStock("0");
    setVariantId("");
    setInventoryItemId("");
  };

  const openCreate = () => {
    setModalMode("create");
    setSelectedProduct(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = async (product: DisplayProduct) => {
    setModalMode("edit");
    setSelectedProduct(product);
    // Set basic display values immediately from the list view data
    setFormTitle(product.name);
    setFormStatus(product.status === "published" ? "published" : "draft");
    setFormCategoryId(product.categoryId ?? "");
    setFormDescription(product.description ?? "");
    setFormSku(product.sku ?? "");
    setFormImages([]);
    setFormStock("0");
    // Clear price initially - will be set from backend data
    setFormPrice("");
    setFormPriceRaw("");
    
    // Fetch full product details from backend (prices, images, inventory)
    setLoadingProduct(true);
    try {
      // Add small delay to ensure DB transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force fresh data from backend (skip any cache)
      const fullProduct = (await adminProducts.get(product.id, { _t: Date.now().toString() })) as any;
      
      console.log("[openEdit] Full product from backend:", {
        id: fullProduct?.id,
        title: fullProduct?.title,
        isActive: fullProduct?.isActive,
        status: fullProduct?.status,
      });
      
      const firstVariant = fullProduct?.variants?.[0];

      // Express backend returns price directly on variant, not nested in prices array
      const variantPrice = firstVariant?.price ?? firstVariant?.prices?.[0]?.amount;
      const invItemId = firstVariant?.inventory_items?.[0]?.inventory_item_id;

      // Set price from backend data
      if (variantPrice != null) {
        const priceNum = typeof variantPrice === "string" ? parseInt(variantPrice, 10) : variantPrice;
        setFormPriceRaw(String(priceNum));
        setFormPrice(
          priceNum > 0 ? formatCurrency(priceNum) : "",
        );
      } else {
        // Fallback to list data if backend doesn't have price
        const price = product.price ?? 0;
        setFormPriceRaw(String(price));
        setFormPrice(price > 0 ? formatCurrency(price) : "");
      }

      // Set status from backend data (convert isActive to status)
      console.log("[openEdit] Setting formStatus from isActive:", fullProduct?.isActive);
      if (fullProduct?.isActive !== undefined) {
        const newStatus = fullProduct.isActive ? "published" : "draft";
        console.log("[openEdit] Form status set to:", newStatus);
        setFormStatus(newStatus);
      } else {
        console.warn("[openEdit] isActive is undefined, keeping previous status");
      }

      setVariantId(firstVariant?.id ?? "");
      setInventoryItemId(invItemId ?? "");

      // Load existing images
      const existingImages: UploadedImage[] = (fullProduct?.images ?? []).map(
        (img: any, i: number) => ({
          id: img.id,
          url: img.url,
          isPrimary: i === 0,
        }),
      );
      setFormImages(existingImages);

      // Use variant's inventory directly (Express backend returns inventory on variant)
      if (firstVariant?.inventory != null) {
        setFormStock(String(firstVariant.inventory));
      } else if (firstVariant?.inventory_quantity != null) {
        setFormStock(String(firstVariant.inventory_quantity));
      }
    } catch (err) {
      console.error("Failed to load product details:", err);
    } finally {
      setLoadingProduct(false);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    console.log("[DEBUG handleSubmit] modalMode:", modalMode, "formImages:", JSON.stringify(formImages, null, 2), "formImages.length:", formImages.length);
    try {
      if (modalMode === "create") {
        const priceNum = parseInt(formPriceRaw) || 0;
        const stockNum = parseInt(formStock) || 0;
        const primaryImage =
          formImages.find((i) => i.isPrimary) ?? formImages[0];

        // Send uploaded images to backend
        await adminProducts.create({
          title: formTitle,
          description: formDescription || undefined,
          status: formStatus as any,
          ...(formCategoryId && { categories: [{ id: formCategoryId }] }),
          price: priceNum,
          inventory: stockNum,
          images: formImages.map((img, index) => ({
            id: img.id,
            url: img.url,
            isPrimary: index === 0, // First image is primary
          })),
        } as any);
      } else if (selectedProduct) {
        const priceNum = parseInt(formPriceRaw) || 0;
        const stockNum = parseInt(formStock) || 0;

        // Update product details — send images directly via apiRequest to bypass service layer bug
        const updatePayload: any = {
          title: formTitle,
          description: formDescription || undefined,
          status: formStatus,
          ...(formCategoryId
            ? { categories: [{ id: formCategoryId }] }
            : { categories: [] }),
          price: priceNum,
          inventory: stockNum,
        };
        if (formImages.length > 0) {
          // Send both id (for existing) and url for all images
          updatePayload.images = formImages.map((img, index) => ({
            id: img.id, // Include id for existing images
            url: img.url,
            isPrimary: index === 0, // First image is primary
          }));
        }
        console.log("[handleSubmit] Direct update payload:", JSON.stringify(updatePayload, null, 2));
        await adminProducts.update(selectedProduct.id, updatePayload);
      }
      setModalOpen(false);

      // Optimistic update: langsung update produk di list
      if (selectedProduct) {
        setProducts(prev => prev.map(p =>
          p.id === selectedProduct.id
            ? { ...p, status: formStatus }
            : p
        ));
        console.log("[handleSubmit] Updated product status in list:", formStatus);

        // Don't refetch immediately - let WebSocket handle it after cache invalidation
        // The WebSocket event will trigger fetchData after 2 seconds when justSaved expires
      }
    } catch (err: any) {
      alert("Gagal: " + (err.message ?? "Unknown error"));
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminProducts.delete(deleteId);
      setDeleteModalOpen(false);
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal hapus: " + (err.message ?? "Unknown error"));
    }
  };

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
            Produk
          </h1>
          <p className="text-sm text-foreground-muted">{total} produk total</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Produk
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Harga
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Varian
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Gambar
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
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-foreground-muted"
                  >
                    <Package className="size-10 mx-auto mb-3 text-foreground-subtle" />
                    <p>Belum ada produk</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {product.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {product.category || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {product.price ? formatCurrency(product.price) : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {product.variantCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {product.imageCount}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(product.id);
                            setDeleteModalOpen(true);
                          }}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error active:shadow-inset-deep transition-all"
                          aria-label="Hapus"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / pageSize)}
        total={total}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalMode === "create" ? "Tambah Produk" : "Edit Produk"}
        size="lg"
      >
        {loadingProduct ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="ml-3 text-foreground-muted">
              Memuat detail produk...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nama Produk"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Deskripsi
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Deskripsi produk..."
                className="w-full rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Harga with custom controls */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-foreground">
                  Harga (IDR)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formPrice}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    placeholder="Rp 0"
                    className="w-full h-12 rounded-2xl bg-surface px-4 pr-14 text-sm text-foreground placeholder:text-foreground-subtle shadow-inset focus:shadow-inset-deep transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handlePriceStep(1000)}
                      className="size-5 rounded-md shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                      tabIndex={-1}
                    >
                      <PlusIcon className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePriceStep(-1000)}
                      className="size-5 rounded-md shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                      tabIndex={-1}
                    >
                      <Minus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
              {/* SKU with tooltip */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    SKU
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowPriceTooltip(true)}
                      onMouseLeave={() => setShowPriceTooltip(false)}
                      className="size-4 rounded-full shadow-inset-small flex items-center justify-center text-foreground-subtle hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      <HelpCircle className="size-3" />
                    </button>
                    {showPriceTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-3 rounded-xl bg-surface shadow-extruded z-50 text-xs text-foreground-muted leading-relaxed">
                        <p>
                          <span className="font-semibold text-foreground">
                            SKU
                          </span>{" "}
                          (Stock Keeping Unit) adalah kode unik untuk
                          mengidentifikasi setiap produk. Contoh:{" "}
                          <span className="font-mono text-foreground">
                            WP-RO-001
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="e.g. WP-RO-001"
                  className="w-full h-12 rounded-2xl bg-surface px-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-inset focus:shadow-inset-deep transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Kategori
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Status switch */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-foreground">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormStatus(
                      formStatus === "published" ? "draft" : "published",
                    )
                  }
                  className="flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "relative w-12 h-7 rounded-full transition-colors duration-200",
                      formStatus === "published"
                        ? "bg-success"
                        : "bg-foreground-subtle",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200",
                        formStatus === "published" && "translate-x-5",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      formStatus === "published"
                        ? "text-success"
                        : "text-foreground-muted",
                    )}
                  >
                    {formStatus === "published" ? "Aktif" : "Draft"}
                  </span>
                </button>
              </div>
              {/* Stock input */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-foreground">
                  Stok
                </label>
                <input
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 rounded-2xl bg-surface px-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-inset focus:shadow-inset-deep transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                />
              </div>
            </div>
            <ImageUpload
              value={formImages}
              onChange={setFormImages}
              maxImages={5}
              maxSizeMB={5}
              label="Gambar Produk"
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={formSubmitting}
              >
                {modalMode === "create" ? "Buat" : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Hapus Produk"
        size="sm"
      >
        <p className="text-foreground-muted mb-6">
          Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="flex-1">
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
