"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Home, Package } from "lucide-react";
import { useOrder } from "@/hooks";
import { formatCurrency } from "@/utils";

function PaymentFinishContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { data: order, isLoading } = useOrder(orderId ?? "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-xl border border-border/60 bg-surface p-10 text-center shadow-soft">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-light">
          <CheckCircle className="size-10 text-success" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-foreground tracking-tight">
          Pembayaran Berhasil!
        </h1>
        <p className="mt-3 text-foreground-muted leading-relaxed">
          Pesanan Anda telah dikonfirmasi. Detail pesanan akan dikirimkan
          melalui email.
        </p>

        {isLoading && (
          <div className="mt-4 animate-pulse h-20 bg-foreground-subtle rounded-lg" />
        )}

        {order && (
          <div className="mt-4 rounded-lg border border-border/60 bg-background p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="size-4" />
              <span>Detail Pesanan</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-foreground-muted">
              <p>
                Nomor Pesanan:{" "}
                <span className="font-semibold text-foreground">
                  {order.orderNumber}
                </span>
              </p>
              <p>
                Total:{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(order.totalAmount)}
                </span>
              </p>
              <p>Item: {order.items?.length ?? 0} produk</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href={ROUTES.HOME}>
            <Button variant="primary" fullWidth className="shadow-button">
              <Home className="mr-2 size-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href={ROUTES.PRODUCTS}>
            <Button variant="secondary" fullWidth>
              Lanjut Belanja
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFinishContent />
    </Suspense>
  );
}
