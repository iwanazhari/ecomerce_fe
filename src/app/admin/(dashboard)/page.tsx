'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/constants'
import { formatCurrency } from '@/utils'
import { adminOrders, adminAnalytics, adminInventory } from '@/services/medusa-admin.service'
import { StatCard, Card, CardHeader, CardTitle, CardContent, IconWell } from '@/components/ui/neu'
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, CheckCircle } from 'lucide-react'

type MedusaOrder = {
  id: string
  display_id?: number | null
  email?: string | null
  total?: number | null
  status?: string | null
  fulfillment_status?: string | null
  payment_status?: string | null
  customer?: { email?: string | null; first_name?: string | null; last_name?: string | null } | null
  created_at?: string | null
}

type DashboardOrder = {
  id: string
  orderNumber: string
  customer: { firstName?: string | null; lastName?: string | null; email?: string | null }
  total: number
  status: string
  fulfillmentStatus: string
  paymentStatus: string
}

type LowStockItem = {
  id: string
  productName: string
  sku?: string
  quantity: number
}

function mapOrder(order: MedusaOrder): DashboardOrder {
  return {
    id: order.id,
    orderNumber: order.display_id != null ? `ORD-${String(order.display_id).padStart(4, '0')}` : order.id.slice(-8).toUpperCase(),
    customer: {
      firstName: order.customer?.first_name,
      lastName: order.customer?.last_name,
      email: order.email ?? order.customer?.email,
    },
    total: order.total ?? 0,
    status: order.status ?? 'pending',
    fulfillmentStatus: order.fulfillment_status ?? 'not_fulfilled',
    paymentStatus: order.payment_status ?? 'not_paid',
  }
}

function StatusBadge({ status, paymentStatus }: { status: string; paymentStatus: string }) {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'warning' },
    completed: { label: 'Selesai', color: 'success' },
    archived: { label: 'Arsip', color: 'default' },
    canceled: { label: 'Batal', color: 'error' },
  }
  const paymentMap: Record<string, { label: string; color: string }> = {
    paid: { label: 'Lunas', color: 'success' },
    awaiting: { label: 'Menunggu', color: 'warning' },
    not_paid: { label: 'Belum Bayar', color: 'error' },
    refunded: { label: 'Refund', color: 'default' },
  }
  const s = statusMap[status] ?? { label: status, color: 'default' }
  const p = paymentMap[paymentStatus] ?? { label: paymentStatus, color: 'default' }
  const colorClass = (c: string) =>
    c === 'success' ? 'bg-success/10 text-success' :
    c === 'warning' ? 'bg-warning/10 text-warning' :
    c === 'error' ? 'bg-error/10 text-error' :
    'bg-surface text-foreground-muted shadow-inset-small'
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${colorClass(s.color)}`}>{s.label}</span>
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${colorClass(p.color)}`}>{p.label}</span>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [revenue, setRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overview, ordersRes, lowStock] = await Promise.all([
          adminAnalytics.getOverview(),
          adminOrders.list({ limit: 5 }),
          adminInventory.getLowStock(10),
        ])
        setRevenue(overview.totalRevenue ?? 0)
        setTotalOrders(overview.totalOrders ?? 0)
        setTotalCustomers(overview.totalCustomers ?? 0)
        setTotalProducts(overview.totalProducts ?? 0)
        setRecentOrders((ordersRes.data ?? []).map(mapOrder))
        const mapped: LowStockItem[] = (lowStock ?? []).map((item: any) => ({
          id: item.id,
          productName: item.title ?? item.product?.title ?? 'Produk',
          sku: item.sku ?? undefined,
          quantity: item.location_levels?.reduce(
            (sum: number, loc: any) => sum + (loc.stocked_quantity ?? 0), 0
          ) ?? item.stocked_quantity ?? 0,
        }))
        setLowStockItems(mapped)
      } catch (err: any) {
        setError(err.message ?? 'Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-surface rounded-[32px] shadow-extruded p-12 text-center">
        <AlertTriangle className="size-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-extrabold text-foreground mb-2">Gagal Memuat Dashboard</h2>
        <p className="text-foreground-muted">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Pendapatan" value={formatCurrency(revenue)} icon={<DollarSign className="size-6" />} iconGradient="text-primary" trend={{ value: 12.5, label: 'vs bulan lalu' }} />
        <StatCard label="Total Pesanan" value={totalOrders} icon={<ShoppingCart className="size-6" />} iconGradient="text-secondary" trend={{ value: 8.2, label: 'vs bulan lalu' }} />
        <StatCard label="Total Pelanggan" value={totalCustomers} icon={<Users className="size-6" />} iconGradient="text-primary" trend={{ value: 5.1, label: 'vs bulan lalu' }} />
        <StatCard label="Total Produk" value={totalProducts} icon={<Package className="size-6" />} iconGradient="text-primary" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <CardTitle>Pesanan Terbaru</CardTitle>
              <Link href={ROUTES.ADMIN_ORDERS} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                Lihat Semua →
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center text-foreground-muted">
                  <ShoppingCart className="size-10 mx-auto mb-3 text-foreground-subtle" />
                  <p>Belum ada pesanan</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link key={order.id} href={`${ROUTES.ADMIN_ORDERS}/${order.id}`} className="p-5 flex items-center justify-between hover:bg-primary/5 transition-colors">
                    <div>
                      <p className="font-bold text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-foreground-muted">{order.customer.firstName} {order.customer.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(order.total)}</p>
                      <div className="mt-1"><StatusBadge status={order.status} paymentStatus={order.paymentStatus} /></div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Low Stock */}
        <div>
          <Card padding="none">
            <div className="p-8 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" />
                Stok Menipis
              </CardTitle>
            </div>
            <div className="divide-y divide-border">
              {lowStockItems.length === 0 ? (
                <div className="p-12 text-center text-foreground-muted">
                  <CheckCircle className="size-10 mx-auto mb-3 text-success" />
                  <p>Semua produk stok aman</p>
                </div>
              ) : (
                lowStockItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{item.productName}</p>
                      <p className="text-xs text-foreground-muted">{item.sku}</p>
                    </div>
                    <span className="text-sm font-extrabold text-error">{item.quantity} sisa</span>
                  </div>
                ))
              )}
            </div>
            {lowStockItems.length > 0 && (
              <div className="p-5 border-t border-border">
                <Link href={ROUTES.ADMIN_INVENTORY} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                  Lihat Inventori →
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
