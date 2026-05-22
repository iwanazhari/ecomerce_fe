"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminAnalytics,
  adminOrders,
  adminProducts,
} from "@/services/medusa-admin.service";
import { formatCurrency } from "@/utils";
import {
  Card,
  CardTitle,
  StatCard,
  IconWell,
  Badge,
} from "@/components/ui/neu";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function AdminAnalyticsPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Map payment status to display format (same as orders page)
  const mapPaymentStatus = (order: any) => {
    const backendPaymentStatus = order.paymentStatus;
    const paymentTransactionStatus = order.payment?.transactionStatus;
    
    const paymentStatusMap: Record<string, string> = {
      PAID: "paid",
      PENDING: "awaiting",
      FAILED: "not_paid",
      REFUNDED: "refunded",
      settlement: "paid",      // Midtrans
      capture: "paid",         // Midtrans
      authorize: "awaiting",   // Midtrans
      deny: "not_paid",        // Midtrans
      expire: "not_paid",      // Midtrans
      cancel: "not_paid",      // Midtrans
    };
    
    if (backendPaymentStatus) {
      return paymentStatusMap[backendPaymentStatus] ?? "not_paid";
    } else if (paymentTransactionStatus) {
      return paymentStatusMap[paymentTransactionStatus] ?? "not_paid";
    } else if (order.payment_status) {
      return paymentStatusMap[order.payment_status] ?? "not_paid";
    }
    return "not_paid";
  };

  // Format order number (same as orders page)
  const formatOrderNumber = (order: any) => {
    return order.display_id != null
      ? `ORD-${String(order.display_id).padStart(4, "0")}`
      : order.id.slice(-8).toUpperCase();
  };

  const fetchData = useCallback(async () => {
    try {
      const [overview, ordersRes, productsRes] = await Promise.all([
        adminAnalytics.getOverview(),
        adminOrders.list({ limit: 10 }),
        adminProducts.list({ limit: 10 }),
      ]);
      setTotalRevenue(overview.totalRevenue ?? 0);
      setTotalOrders(overview.totalOrders ?? 0);
      setTotalProducts(productsRes.meta?.total ?? 0);
      
      // Use topProducts from analytics endpoint if available
      if (overview.topProducts && overview.topProducts.length > 0) {
        setTopProducts(overview.topProducts.slice(0, 5));
      } else {
        // Fallback: calculate from orders
        const productCount: Record<
          string,
          { name: string; count: number; revenue: number }
        > = {};
        (ordersRes.data ?? []).forEach((order: any) => {
          // Check OrderItem array - might be OrderItem[] or items[]
          const orderItems = order.OrderItem ?? order.items ?? [];
          orderItems.forEach((item: any) => {
            // Get product name from nested structure
            const name = item.product?.title ?? item.variant?.product?.title ?? item.title ?? "Produk";
            if (!productCount[name])
              productCount[name] = { name, count: 0, revenue: 0 };
            productCount[name].count += item.quantity ?? 0;
            productCount[name].revenue += (item.price ?? item.unit_price ?? 0) * (item.quantity ?? 0);
          });
        });
        setTopProducts(
          Object.values(productCount)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5),
        );
      }
      
      // Map orders with payment status and order number
      const rawOrders = ordersRes.data ?? [];
      setRecentOrders(rawOrders.map((order: any) => ({
        ...order,
        mappedPaymentStatus: mapPaymentStatus(order),
        formattedOrderNumber: formatOrderNumber(order),
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket listener for real-time analytics updates
  useWebSocket("realtime", (data) => {
    console.log("[Analytics] realtime event received:", data);

    // Handle cache:invalidated events - refetch analytics data
    if (data?.event === "cache:invalidated") {
      console.log("[Analytics] Cache invalidated:", data.type);
      
      // Refetch analytics if product or order cache is invalidated
      if (data?.type === "product" || data?.type === "order") {
        console.log("[Analytics] Refetching analytics data...");
        fetchData();
      }
    }

    // Handle stock:updated events - update analytics
    if (data?.event === "stock:updated") {
      console.log("[Analytics] Stock updated, refetching...");
      fetchData();
    }

    // Handle order events - update orders list and stats
    if (data?.event && ["order:updated", "order:created", "order:cancelled", "payment:success"].includes(data.event)) {
      console.log("[Analytics] Order event:", data.event);
      fetchData();
    }
  }, true);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Analitik
        </h1>
        <p className="text-sm text-foreground-muted">
          Ringkasan performa toko Anda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Pendapatan"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="size-6" />}
          iconGradient="text-primary"
        />
        <StatCard
          label="Total Pesanan"
          value={totalOrders}
          icon={<ShoppingCart className="size-6" />}
          iconGradient="text-secondary"
        />
        <StatCard
          label="Total Produk"
          value={totalProducts}
          icon={<Package className="size-6" />}
          iconGradient="text-primary"
        />
        <StatCard
          label="Produk Terlaris"
          value={topProducts.length}
          icon={<TrendingUp className="size-6" />}
          iconGradient="text-primary"
        />
      </div>

      {/* Top Products - Bar Chart */}
      <Card padding="none">
        <div className="p-8 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Produk Terlaris
          </CardTitle>
        </div>
        <div className="p-8">
          {topProducts.length === 0 ? (
            <div className="text-center text-foreground-muted py-12">
              <Package className="size-10 mx-auto mb-3 text-foreground-subtle" />
              <p>Belum ada data penjualan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, i) => {
                const quantity = product.quantitySold ?? product.count ?? 0;
                const revenue = product.revenue ?? 0;
                const maxQuantity = Math.max(...topProducts.map(p => p.quantitySold ?? p.count ?? 0));
                const barWidth = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0;
                
                return (
                  <div key={product.id ?? i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-bold text-foreground truncate flex-1 mr-4">
                        #{i + 1}. {product.name}
                      </p>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs text-foreground-muted">
                          {quantity} terjual
                        </span>
                        <span className="font-bold text-primary text-sm">
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-surface rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Recent Orders */}
      <Card padding="none">
        <div className="p-8 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            Pesanan Terbaru
          </CardTitle>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-foreground-muted">
              <ShoppingCart className="size-10 mx-auto mb-3 text-foreground-subtle" />
              <p>Belum ada pesanan</p>
            </div>
          ) : (
            recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-foreground">
                    {order.formattedOrderNumber}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {order.email ?? order.customer?.email ?? "Pelanggan"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {formatCurrency(order.total ?? 0)}
                  </p>
                  <Badge
                    variant={
                      order.mappedPaymentStatus === "paid"
                        ? "success"
                        : order.mappedPaymentStatus === "awaiting"
                          ? "warning"
                          : "error"
                    }
                  >
                    {order.mappedPaymentStatus === "paid"
                      ? "Lunas"
                      : order.mappedPaymentStatus === "awaiting"
                        ? "Menunggu"
                        : "Belum Bayar"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
