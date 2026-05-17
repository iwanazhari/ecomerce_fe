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

export default function AdminAnalyticsPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setRecentOrders(ordersRes.data ?? []);
      // Simple top products by order frequency
      const productCount: Record<
        string,
        { name: string; count: number; revenue: number }
      > = {};
      (ordersRes.data ?? []).forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const name = item.variant?.product?.title ?? item.title ?? "Produk";
          if (!productCount[name])
            productCount[name] = { name, count: 0, revenue: 0 };
          productCount[name].count += item.quantity ?? 1;
          productCount[name].revenue +=
            (item.unit_price ?? 0) * (item.quantity ?? 1);
        });
      });
      setTopProducts(
        Object.values(productCount)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

      {/* Top Products */}
      <Card padding="none">
        <div className="p-8 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Produk Terlaris
          </CardTitle>
        </div>
        <div className="divide-y divide-border">
          {topProducts.length === 0 ? (
            <div className="p-12 text-center text-foreground-muted">
              <Package className="size-10 mx-auto mb-3 text-foreground-subtle" />
              <p>Belum ada data penjualan</p>
            </div>
          ) : (
            topProducts.map((product, i) => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <IconWell className="size-10 shrink-0">
                    <span className="text-sm font-extrabold text-primary">
                      #{i + 1}
                    </span>
                  </IconWell>
                  <div>
                    <p className="font-bold text-foreground">{product.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {product.count} terjual
                    </p>
                  </div>
                </div>
                <p className="font-bold text-primary">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))
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
                    ORD-{String(order.display_id ?? 0).padStart(4, "0")}
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
                      order.payment_status === "paid"
                        ? "success"
                        : order.payment_status === "awaiting"
                          ? "warning"
                          : "error"
                    }
                  >
                    {order.payment_status ?? "unknown"}
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
