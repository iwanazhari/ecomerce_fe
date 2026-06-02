"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminOrders } from "@/services/medusa-admin.service";
import { formatCurrency, formatDate } from "@/utils";
import { getSocket, SOCKET_EVENTS } from "@/services/websocket/socket";
import {
  Button,
  Card,
  CardTitle,
  Badge,
  Modal,
  Input,
} from "@/components/ui/neu";
import { IconWell } from "@/components/ui/neu/Card";
import {
  ShoppingCart,
  Search,
  Eye,
  Truck,
  Trash2,
  AlertTriangle,
  XCircle,
  Loader2,
  CheckCircle,
  Package,
  Clock,
  AlertCircle,
} from "lucide-react";
import { AdminGuard, RequirePermission } from "@/components/admin/AdminGuard";

import { Pagination } from "@/components/ui/data-pagination";

type ExpressOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  promoCode: string | null;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  OrderItem: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productName: string;
    productSku: string;
    product: { id: string; name: string } | null;
  }>;
  User: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
};

type DisplayOrder = {
  id: string;
  orderNumber: string;
  productName: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type OrderDetail = DisplayOrder & {
  items: { name: string; quantity: number; price: number }[];
};

function mapOrder(o: ExpressOrder): DisplayOrder {
  const customerName = o.customerName || [o.User?.firstName, o.User?.lastName].filter(Boolean).join(" ") || o.customerEmail || "Pelanggan";
  const firstItem = o.OrderItem?.[0];
  const productName = firstItem?.productName || firstItem?.product?.name || "Produk";

  const paymentStatusMap: Record<string, string> = {
    PAID: "paid",
    PENDING: "awaiting",
    FAILED: "not_paid",
    REFUNDED: "refunded",
    SUCCESS: "paid",
  };

  return {
    id: o.id,
    orderNumber: o.orderNumber || o.id.slice(-8).toUpperCase(),
    productName,
    customer: { name: customerName, email: o.customerEmail || o.User?.email || "" },
    total: o.totalAmount ?? o.subtotal ?? 0,
    status: o.status ?? "PENDING",
    paymentStatus: paymentStatusMap[o.paymentStatus] ?? "not_paid",
    createdAt: o.createdAt ?? new Date().toISOString(),
  };
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    {
      label: string;
      variant: "success" | "warning" | "error" | "default" | "info";
    }
  > = {
    PENDING: { label: "Pending", variant: "warning" },
    PAID: { label: "Dibayar", variant: "info" },
    PROCESSING: { label: "Diproses", variant: "info" },
    PACKED: { label: "Dikemas", variant: "info" },
    SHIPPED: { label: "Dikirim", variant: "success" },
    DELIVERED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Batal", variant: "error" },
    REFUNDED: { label: "Refund", variant: "error" },
    RETURNED: { label: "Dikembalikan", variant: "error" },
  };
  const s = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: "success" | "warning" | "error" | "default" }
  > = {
    paid: { label: "Lunas", variant: "success" },
    awaiting: { label: "Menunggu", variant: "warning" },
    not_paid: { label: "Belum Bayar", variant: "error" },
    refunded: { label: "Refund", variant: "default" },
  };
  const s = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function FulfillmentBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: "success" | "warning" | "default" }
  > = {
    fulfilled: { label: "Dikirim", variant: "success" },
    partially_fulfilled: { label: "Sebagian", variant: "warning" },
    not_fulfilled: { label: "Belum", variant: "default" },
  };
  const s = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const ACTIONABLE_STATUSES = ["pending", "completed"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<DisplayOrder | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<DisplayOrder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminOrders.list({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
      });
      setOrders(((res.data as any) ?? []).map(mapOrder));
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, currentPage]);

  useEffect(() => {
    fetchData();

    // Setup WebSocket listener for real-time order updates
    const socket = getSocket();
    const socketConnected = socket.connected;

    // Connect socket if not already connected
    if (!socketConnected) {
      socket.connect();
    }

    // Listen for realtime events from Redis bridge
    const handleOrderEvent = (data: any) => {
      console.log('🔔 Realtime event received:', data);
      
      // Handle order-related events
      if (data?.event && ['order:updated', 'order:created', 'order:cancelled', 'payment:success'].includes(data.event)) {
        console.log(`🔔 ${data.event} event:`, data.data);
        // Refetch immediately — backend already committed the transaction
        fetchData();
      }
    };

    socket.on('realtime', handleOrderEvent);

    // Cleanup
    return () => {
      socket.off('realtime', handleOrderEvent);
      // Don't disconnect - keep socket alive for other pages
    };
  }, [fetchData]);

  const handleProcessOrder = async (
    orderId: string,
    action: "process" | "pack" | "ship" | "deliver" | "cancel",
  ) => {
    setProcessing(true);
    try {
      const statusMap: Record<string, string> = {
        process: "PROCESSING",
        pack: "PACKED",
        ship: "SHIPPED",
        deliver: "DELIVERED",
      };
      if (action === "cancel") {
        await adminOrders.cancel(orderId);
      } else {
        await adminOrders.updateStatus(orderId, statusMap[action]);
      }
      setProcessModalOpen(false);
      setProcessingOrder(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + (err.message ?? "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeleting(true);
    try {
      await adminOrders.cancel(orderId);
      setDeleteModalOpen(false);
      setDeletingOrder(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus: " + (err.message ?? "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  const openDelete = (order: DisplayOrder) => {
    setDeletingOrder(order);
    setDeleteModalOpen(true);
  };

  const [detailLoading, setDetailLoading] = useState(false);

  const openDetail = async (order: DisplayOrder) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminOrders.getDetail(order.id);
      const raw = (res as any).data ?? res;
      const items = (raw.OrderItem ?? []).map((i: any) => ({
        name: i.productName || i.product?.name || "Produk",
        quantity: i.quantity ?? 1,
        price: i.unitPrice ?? i.totalPrice ?? 0,
      }));
      setDetailOrder({ ...order, items });
    } catch {
      setDetailOrder({ ...order, items: [] });
    } finally {
      setDetailLoading(false);
    }
  };

  const openProcess = (order: DisplayOrder) => {
    setProcessingOrder(order);
    setProcessModalOpen(true);
  };

  const canProcess = (order: DisplayOrder) => {
    const processable = ["PAID", "PROCESSING", "PACKED", "SHIPPED"];
    return processable.includes(order.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminGuard requirePermissions={["orders:read"]}>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Pesanan
          </h1>
          <p className="text-sm text-foreground-muted">{total} pesanan total</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Pesanan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Total
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
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-foreground-muted"
                  >
                    <ShoppingCart className="size-10 mx-auto mb-3 text-foreground-subtle" />
                    <p>Belum ada pesanan</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">
                        {order.productName}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {order.orderNumber} &middot; {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-foreground">
                        {order.customer.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(order)}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                          aria-label="Detail"
                        >
                          <Eye className="size-4" />
                        </button>
                        {canProcess(order) && (
                          <button
                            onClick={() => openProcess(order)}
                            className="size-10 rounded-2xl shadow-extruded-sm bg-primary text-white flex items-center justify-center hover:shadow-extruded-lg transition-all"
                            aria-label="Proses"
                            title="Proses pesanan"
                          >
                            <Truck className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openDelete(order)}
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

      {/* Order Detail Modal */}
      <Modal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={detailOrder?.orderNumber ?? "Detail Pesanan"}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : detailOrder && (
          <div className="space-y-6">
            {/* Status row */}
            <div className="flex flex-wrap gap-3">
              <OrderStatusBadge status={detailOrder.status} />
              <PaymentBadge status={detailOrder.paymentStatus} />
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
                  Pesanan
                </p>
                <p className="font-bold text-foreground">
                  {detailOrder.orderNumber}
                </p>
                <p className="text-sm text-foreground-muted">
                  {formatDate(detailOrder.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
                  Pelanggan
                </p>
                <p className="font-bold text-foreground">
                  {detailOrder.customer.name}
                </p>
                <p className="text-sm text-foreground-muted">
                  {detailOrder.customer.email}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
                Item ({detailOrder.items.length})
              </p>
              <div className="space-y-2">
                {detailOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl shadow-inset-small"
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {item.quantity}x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 rounded-2xl shadow-inset-deep">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-xl font-extrabold text-primary">
                {formatCurrency(detailOrder.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Process Order Modal */}
      <Modal
        open={processModalOpen}
        onOpenChange={setProcessModalOpen}
        title="Proses Pesanan"
        size="sm"
      >
        {processingOrder && (
          <div className="space-y-4">
            <p className="text-foreground-muted">
              Pilih aksi untuk{" "}
              <span className="font-bold text-foreground">
                {processingOrder.orderNumber}
              </span>
              :
            </p>

            <RequirePermission permission="orders:update">
              {processingOrder.status === "PAID" && (
                <button
                  onClick={() =>
                    handleProcessOrder(processingOrder.id, "process")
                  }
                  disabled={processing}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl shadow-extruded hover:shadow-extruded-lg hover:-translate-y-0.5 active:shadow-inset-small active:translate-y-0.5 transition-all text-left disabled:opacity-50"
                >
                  <IconWell className="size-12 text-primary shrink-0">
                    <Package className="size-6" />
                  </IconWell>
                  <div>
                    <p className="font-bold text-foreground">Tandai Diproses</p>
                    <p className="text-xs text-foreground-muted">
                      Pesanan sedang diproses
                    </p>
                  </div>
                </button>
              )}

              {processingOrder.status === "PROCESSING" && (
                <button
                  onClick={() =>
                    handleProcessOrder(processingOrder.id, "pack")
                  }
                  disabled={processing}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl shadow-extruded hover:shadow-extruded-lg hover:-translate-y-0.5 active:shadow-inset-small active:translate-y-0.5 transition-all text-left disabled:opacity-50"
                >
                  <IconWell className="size-12 text-primary shrink-0">
                    <Package className="size-6" />
                  </IconWell>
                  <div>
                    <p className="font-bold text-foreground">Tandai Dikemas</p>
                    <p className="text-xs text-foreground-muted">
                      Pesanan sudah dikemas
                    </p>
                  </div>
                </button>
              )}

              {processingOrder.status === "PACKED" && (
                <button
                  onClick={() =>
                    handleProcessOrder(processingOrder.id, "ship")
                  }
                  disabled={processing}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl shadow-extruded hover:shadow-extruded-lg hover:-translate-y-0.5 active:shadow-inset-small active:translate-y-0.5 transition-all text-left disabled:opacity-50"
                >
                  <IconWell className="size-12 text-success shrink-0">
                    <Truck className="size-6" />
                  </IconWell>
                  <div>
                    <p className="font-bold text-foreground">Tandai Dikirim</p>
                    <p className="text-xs text-foreground-muted">
                      Pesanan dikirim ke pelanggan
                    </p>
                  </div>
                </button>
              )}

              {processingOrder.status === "SHIPPED" && (
                <button
                  onClick={() =>
                    handleProcessOrder(processingOrder.id, "deliver")
                  }
                  disabled={processing}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl shadow-extruded hover:shadow-extruded-lg hover:-translate-y-0.5 active:shadow-inset-small active:translate-y-0.5 transition-all text-left disabled:opacity-50"
                >
                  <IconWell className="size-12 text-success shrink-0">
                    <CheckCircle className="size-6" />
                  </IconWell>
                  <div>
                    <p className="font-bold text-foreground">Tandai Diterima</p>
                    <p className="text-xs text-foreground-muted">
                      Pesanan sudah diterima pelanggan
                    </p>
                  </div>
                </button>
              )}
            </RequirePermission>

            <RequirePermission permission="orders:cancel">
              {!"DELIVERED CANCELLED REFUNDED RETURNED".includes(processingOrder.status) && (
                <button
                  onClick={() => handleProcessOrder(processingOrder.id, "cancel")}
                  disabled={processing}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl shadow-extruded hover:shadow-extruded-lg hover:-translate-y-0.5 active:shadow-inset-small active:translate-y-0.5 transition-all text-left disabled:opacity-50"
                >
                  <IconWell className="size-12 text-error shrink-0">
                    <XCircle className="size-6" />
                  </IconWell>
                  <div>
                    <p className="font-bold text-foreground">Batalkan Pesanan</p>
                    <p className="text-xs text-foreground-muted">
                      Batalkan pesanan ini
                    </p>
                  </div>
                </button>
              )}
            </RequirePermission>

            {processing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Hapus Pesanan"
        size="md"
      >
        {deletingOrder && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-error/10 border border-error/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground mb-1">
                    Konfirmasi Hapus Pesanan
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Apakah Anda yakin ingin menghapus pesanan{" "}
                    <span className="font-bold text-foreground">
                      {deletingOrder.orderNumber}
                    </span>
                    ?
                  </p>
                  <p className="text-sm text-foreground-muted mt-2">
                    Tindakan ini akan membatalkan pesanan dan tidak dapat
                    dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteOrder(deletingOrder.id)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4 mr-2" />
                    Hapus Pesanan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </AdminGuard>
  );
}
