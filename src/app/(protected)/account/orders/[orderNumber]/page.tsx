'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useOrder } from '@/hooks'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate } from '@/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, MapPin, CreditCard, Truck } from 'lucide-react'

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading } = useOrder(orderNumber!)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <Link href={ROUTES.ACCOUNT_ORDERS} className="mb-4 inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
        <p className="text-lg text-foreground-muted">Pesanan tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div>
      <Link href={ROUTES.ACCOUNT_ORDERS} className="mb-4 inline-flex items-center gap-2 text-sm text-primary">
        <ArrowLeft className="size-4" />
        Kembali
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-foreground-muted">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : 'primary'}>
            {order.status}
          </Badge>
          <Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'FAILED' ? 'error' : 'warning'}>
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 font-semibold text-foreground">Produk</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-foreground-muted">{item.variant.name}</p>}
                    <p className="text-xs text-foreground-muted">x{item.quantity}</p>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Address */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4" />
              Alamat
            </h2>
            <p className="text-sm text-foreground-muted">
              {order.address.fullName}<br />
              {order.address.addressLine}<br />
              {order.address.city}, {order.address.province} {order.address.postalCode}
            </p>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CreditCard className="size-4" />
              Pembayaran
            </h2>
            <p className="text-sm text-foreground-muted">{order.paymentMethod}</p>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 font-semibold text-foreground">Ringkasan</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-foreground-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>Ongkir</span>
                <span>{formatCurrency(order.shippingAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Diskon</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck className="size-4" />
                Pengiriman
              </h2>
              <p className="text-sm text-foreground-muted">{order.shippingMethod}</p>
              <p className="font-mono text-sm text-foreground">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
