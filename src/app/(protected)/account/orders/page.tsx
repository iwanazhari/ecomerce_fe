'use client'

import Link from 'next/link'
import { useOrders } from '@/hooks'
import { ROUTES } from '@/constants'
import { formatDate, formatCurrency } from '@/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Package } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/types'

const statusColors: Record<OrderStatus | PaymentStatus, string> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  RETURNED: 'error',
  AUTHORIZED: 'warning',
  PAID: 'success',
  FAILED: 'error',
  REFUNDED: 'default',
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders({ limit: 20 })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-9 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Pesanan Saya</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-4 size-12 text-foreground-subtle" />
          <p className="text-lg font-bold text-foreground-muted">Belum ada pesanan</p>
          <Link href={ROUTES.PRODUCTS} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-violet-600">
            Mulai Belanja &rarr;
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Pesanan Saya</h1>

      <div className="mt-8 space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={ROUTES.ACCOUNT_ORDER(order.orderNumber)}
            className="block rounded-xl border border-border/60 bg-surface p-5 shadow-soft transition-all hover:shadow-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{order.orderNumber}</p>
                <p className="mt-0.5 text-sm text-foreground-muted">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusColors[order.status] as never}>{order.status}</Badge>
                <Badge variant={statusColors[order.paymentStatus] as never}>{order.paymentStatus}</Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
              <span className="text-foreground-muted">{order.items.length} item</span>
              <span className="text-lg font-extrabold text-indigo-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
