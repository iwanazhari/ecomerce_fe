"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminOrders } from "@/services/medusa-admin.service";
import { formatCurrency, formatDate } from "@/utils";
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
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

type MedusaOrder = {
  id: string;
  display_id?: number | null;
  email?: string | null;
  total?: number | null;
  subtotal?: number | null;
  currency_code?: string | null;
  status?: string | null;
  fulfillment_status?: string | null;
  payment_status?: string | null;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
  } | null;
  items?:
    | {
        title: string;
        quantity: number;
        unit_price?: number;
        variant?: { product?: { title: string } };
      }[]
    | null;
  customer?: { email?: string; first_name?: string; last_name?: string } | null;
  fulfillments?: { id: string; status?: string; created_at?: string }[] | null;
  created_at?: string | null;
};

type DisplayOrder = {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
  shippingAddress?: { name: string; city: string };
  items?: { name: string; quantity: number; price: number }[];
};

function mapOrder(o: MedusaOrder): DisplayOrder {
  const customerName =
    [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(" ") ||
    o.email ||
    "Pelanggan";
  const shippingName =
    [o.shipping_address?.first_name, o.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || customerName;
  return {
    id: o.id,
    orderNumber:
      o.display_id != null
        ? `ORD-${String(o.display_id).padStart(4, "0")}`
        : o.id.slice(-8).toUpperCase(),
    customer: { name: customerName, email: o.email ?? o.customer?.email ?? "" },
    total: o.total ?? o.subtotal ?? 0,
    status: o.status ?? "pending",
    fulfillmentStatus: o.fulfillment_status ?? "not_fulfilled",
    paymentStatus: o.payment_status ?? "not_paid",
    itemCount: o.items?.length ?? 0,
    createdAt: o.created_at ?? new Date().toISOString(),
    shippingAddress: {
      name: shippingName,
      city: o.shipping_address?.city ?? "-",
    },
    items: o.items?.map((i: any) => ({
      name: i.variant?.product?.title ?? i.title ?? "Produk",
      quantity: i.quantity ?? 1,
      price: i.unit_price ?? 0,
    })),
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
    pending: { label: "Pending", variant: "warning" },
    completed: { label: "Selesai", variant: "success" },
    archived: { label: "Arsip", variant: "default" },
    canceled: { label: "Batal", variant: "error" },
    requires_action: { label: "Perlu Aksi", variant: "error" },
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
  const [detailOrder, setDetailOrder] = useState<DisplayOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<DisplayOrder | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminOrders.list({
        limit: 50,
        search: search || undefined,
      });
      setOrders(((res.data as any) ?? []).map(mapOrder));
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessOrder = async (
    orderId: string,
    action: "fulfill" | "deliver" | "cancel",
  ) => {
    setProcessing(true);
    try {
      if (action === "fulfill") {
        await adminOrders.updateStatus(orderId, "PROCESSING");
      } else if (action === "deliver") {
        await adminOrders.updateStatus(orderId, "DELIVERED");
      } else if (action === "cancel") {
        await adminOrders.cancel(orderId);
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

  const openDetail = (order: DisplayOrder) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const openProcess = (order: DisplayOrder) => {
    setProcessingOrder(order);
    setProcessModalOpen(true);
  };

  const canProcess = (order: DisplayOrder) => {
    return (
      order.paymentStatus === "paid" &&
      order.fulfillmentStatus !== "fulfilled" &&
      order.status !== "canceled"
    );
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
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Pembayaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Pengiriman
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
                    colSpan={7}
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
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-foreground">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {order.customer.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <FulfillmentBadge status={order.fulfillmentStatus} />
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={detailOrder?.orderNumber ?? "Detail Pesanan"}
        size="lg"
      >
        {detailOrder && (
          <div className="space-y-6">
            {/* Status row */}
            <div className="flex flex-wrap gap-3">
              <OrderStatusBadge status={detailOrder.status} />
              <PaymentBadge status={detailOrder.paymentStatus} />
              <FulfillmentBadge status={detailOrder.fulfillmentStatus} />
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
                  Alamat Kirim
                </p>
                <p className="font-bold text-foreground">
                  {detailOrder.shippingAddress?.name}
                </p>
                <p className="text-sm text-foreground-muted">
                  {detailOrder.shippingAddress?.city}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
                Item ({detailOrder.itemCount})
              </p>
              <div className="space-y-2">
                {detailOrder.items?.map((item, i) => (
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

            {processingOrder.fulfillmentStatus === "not_fulfilled" && (
              <button
                onClick={() =>
                  handleProcessOrder(processingOrder.id, "fulfill")
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
                    Pesanan sedang dikemas
                  </p>
                </div>
              </button>
            )}

            {processingOrder.fulfillmentStatus === "fulfilled" && (
              <button
                onClick={() =>
                  handleProcessOrder(processingOrder.id, "deliver")
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
                    Pesanan sedang dikirim ke pelanggan
                  </p>
                </div>
              </button>
            )}

            {processingOrder.status !== "canceled" && (
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

            {processing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
