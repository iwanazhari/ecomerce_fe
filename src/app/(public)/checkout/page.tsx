"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart, useCreateOrder, useCreateSnap, useAuth } from "@/hooks";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Label,
  Separator,
} from "@/components/ui";
import { MidtransSnap } from "@/components/checkout";
import { listExpeditions } from "@/lib/api/shipping";
import {
  Check,
  ChevronRight,
  CreditCard,
  MapPin,
  User,
  ArrowLeft,
  Truck,
  Clock,
  Package,
} from "lucide-react";
import { api } from "@/lib/api/client";

type Province = {
  id: string;
  name: string;
};

type ShippingOption = {
  id: string;
  name: string;
  amount: number;
  is_store_delivery: boolean;
};

type Step = "cart" | "shipping" | "payment";

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "cart", label: "Keranjang", icon: Package },
  { id: "shipping", label: "Pengiriman", icon: Truck },
  { id: "payment", label: "Pembayaran", icon: CreditCard },
];

function Stepper({ currentStep }: { currentStep: Step }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress checkout" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center last:flex-initial"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-button"
                      : isActive
                        ? "border-primary text-primary"
                        : "border-border text-foreground-subtle"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive ? "text-primary" : "text-foreground-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    isCompleted
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                      : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const createOrder = useCreateOrder();
  const createSnap = useCreateSnap();

  const [step, setStep] = useState<Step>("shipping");
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState("");
  const hasPaid = useRef(false);

  // Fetch shipping options and provinces
  useEffect(() => {
    listExpeditions()
      .then((res) => {
        const options = res.data || [];
        const mapped = options.map((exp) => ({
          id: (exp.id as string) ?? "",
          name: (exp.name as string) ?? "",
          code: (exp.code as string) ?? "",
          type: (exp.type as string) ?? "",
          amount: (exp.flatRate as number) ?? (exp.flat_rate as number) ?? 0,
          is_store_delivery:
            (exp.isStoreDelivery as boolean) ??
            (exp.is_store_delivery as boolean) ??
            false,
        }));
        setShippingOptions(mapped);
        setShippingLoading(false);
        if (mapped.length > 0) {
          setSelectedShipping(mapped[0].id);
        }
      })
      .catch(() => {
        setShippingLoading(false);
      });

    // Fetch provinces from store API (public, no auth needed)
    api
      .get<Record<string, unknown>>("/provinces")
      .then((res) => {
        if (res.success && res.data) {
          const data = res.data as Record<string, unknown>;
          const provs = (data.data ?? data.provinces ?? data) as {
            id: string;
            province: string;
          }[];
          if (Array.isArray(provs)) {
            setProvinces(provs.map((p) => ({ id: p.id, name: p.province })));
          }
        }
        setProvinceLoading(false);
      })
      .catch(() => {
        setProvinceLoading(false);
      });
  }, []);

  // Checkout form state — auto-fill from user profile when logged in
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  // Stable disabled flags based on user profile (not form state — prevents focus loss)
  const isEmailPreFilled = isAuthenticated && !!user?.email;
  const isNamePreFilled =
    isAuthenticated && !!(user?.firstName || user?.lastName);
  const isPhonePreFilled = isAuthenticated && !!user?.phone;

  // Sync form with user data when auth is ready
  useEffect(() => {
    if (user) {
      setEmail(user.email ?? "");
      const name = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      setFullName(name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  // Guard against stale cached cart items without product data
  const validItems = cart?.items?.filter((item) => item?.product) ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const selectedOption = shippingOptions.find((o) => o.id === selectedShipping);
  const shippingCost = selectedOption?.amount ?? 0;
  const total = subtotal + shippingCost;

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 bg-foreground-subtle rounded" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-foreground-subtle rounded-xl" />
              <div className="h-40 bg-foreground-subtle rounded-xl" />
            </div>
            <div className="h-64 bg-foreground-subtle rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!validItems.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-foreground-muted">Keranjang kosong</p>
        <Link href={ROUTES.PRODUCTS}>
          <Button
            variant="primary"
            className="mt-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-button"
          >
            <ArrowLeft className="mr-2 size-4" />
            Mulai Belanja
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Create order
      const orderResult = await createOrder.mutateAsync({
        fullName,
        email,
        phone,
        shippingAddress: {
          addressLine,
          city,
          province,
          postalCode,
          country: "Indonesia",
        },
        shippingMethod: selectedShipping,
        paymentMethod: "midtrans",
        notes: notes || undefined,
      });

      if (!orderResult.data?.id) {
        throw new Error(
          (orderResult.meta as any)?.error?.message || "Gagal membuat pesanan",
        );
      }

      const orderId = orderResult.data.id;
      const orderTotal = orderResult.data.totalAmount;

      if (orderTotal <= 0) {
        throw new Error(
          "Total pesanan tidak valid. Pastikan produk memiliki harga yang benar.",
        );
      }

      // Step 2: Create Snap token from the created order (use server-calculated total)
      const snapResult = await createSnap.mutateAsync({
        orderId,
        amount: orderTotal,
        paymentType: "qris",
      });

      if (!snapResult.data?.token) {
        throw new Error(
          (snapResult.meta as any)?.error?.message ||
            "Gagal membuat token pembayaran",
        );
      }

      // Step 3: Store order ID, move to payment step, and open Snap popup
      setCreatedOrderId(orderId);
      setStep("payment");
      setSnapToken(snapResult.data.token);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnapCallback = (result: {
    transaction_status: string;
    order_id: string;
  }) => {
    // Prevent duplicate processing
    if (hasPaid.current) return;
    hasPaid.current = true;

    if (
      result.transaction_status === "settlement" ||
      result.transaction_status === "capture"
    ) {
      // Payment succeeded — redirect to finish page with order ID
      window.location.href = `/payment/finish?order=${createdOrderId ?? ""}`;
    } else if (result.transaction_status === "pending") {
      // Waiting for payment — redirect to pending page
      window.location.href = `/payment/pending?order=${createdOrderId ?? ""}`;
    } else {
      // Failed/denied/cancel — redirect to error page
      window.location.href = `/payment/error?order=${createdOrderId ?? ""}`;
    }
  };

  const isFormValid =
    email &&
    fullName &&
    phone &&
    addressLine &&
    city &&
    province &&
    postalCode &&
    selectedShipping;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href={ROUTES.CART}
            className="text-foreground-muted hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Checkout
          </h1>
        </div>

        {/* Stepper */}
        <Stepper currentStep={step} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Customer Info + Address + Order Items */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer Information */}
            <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-soft sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="size-5" />
                Informasi Pemesan
              </h2>
              <div className="space-y-4">
                <Input
                  id="checkout-email"
                  label="Email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isEmailPreFilled}
                />
                <Input
                  id="checkout-fullname"
                  label="Nama Lengkap"
                  placeholder="Nama lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isNamePreFilled}
                />
                <Input
                  id="checkout-phone"
                  label="Nomor Telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  required
                  disabled={isPhonePreFilled}
                />
                {!isAuthenticated && (
                  <p className="text-xs text-foreground-muted">
                    Sudah punya akun?{" "}
                    <Link
                      href={`${ROUTES.LOGIN}?redirect=/checkout`}
                      className="text-primary hover:underline"
                    >
                      Masuk di sini
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-soft sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <MapPin className="size-5" />
                Alamat Pengiriman
              </h2>
              <div className="space-y-4">
                <Input
                  label="Alamat Lengkap"
                  placeholder="Jalan, nomor rumah, RT/RW"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-sm font-medium text-foreground">
                      Provinsi
                    </Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            provinceLoading ? "Memuat..." : "Pilih provinsi"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    label="Kota / Kabupaten"
                    placeholder="Kota"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Kode Pos"
                  placeholder="Kode pos"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
                <div>
                  <Label className="mb-1 block text-sm font-medium text-foreground">
                    Catatan Pesanan (opsional)
                  </Label>
                  <Textarea
                    placeholder="Catatan untuk penjual"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-soft sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Truck className="size-5" />
                Metode Pengiriman
              </h2>
              {shippingLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-foreground-subtle rounded-lg" />
                  <div className="h-12 bg-foreground-subtle rounded-lg" />
                </div>
              ) : shippingOptions.length === 0 ? (
                <p className="text-sm text-foreground-muted">
                  Tidak ada metode pengiriman tersedia
                </p>
              ) : (
                <RadioGroup
                  value={selectedShipping}
                  onValueChange={setSelectedShipping}
                  className="space-y-3"
                >
                  {shippingOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                        selectedShipping === option.id
                          ? "border-primary bg-primary-light"
                          : "border-border/60 hover:bg-surface-hover"
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      {option.is_store_delivery ? (
                        <Truck className="size-5 text-primary" />
                      ) : (
                        <Package className="size-5 text-primary" />
                      )}
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {option.name}
                          </span>
                          {option.is_store_delivery && (
                            <span className="text-xs text-foreground-muted">
                              (Kurir Toko)
                            </span>
                          )}
                        </div>
                      </Label>
                      <span className="text-sm font-semibold text-foreground">
                        {option.amount > 0 ? (
                          formatCurrency(option.amount)
                        ) : (
                          <span className="text-success">Gratis</span>
                        )}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            {/* Order Items */}
            <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-soft sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Pesanan Anda ({validItems.length} item)
              </h2>
              <div className="space-y-3">
                {validItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg border border-border/60 bg-background">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-foreground-subtle text-xs">
                          {item.product.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-foreground-muted">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-xs text-foreground-muted">
                          x{item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-soft sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="size-5" />
                Pembayaran
              </h2>
              <p className="text-sm text-foreground-muted">
                Pembayaran diproses melalui Midtrans. Anda akan diarahkan ke
                halaman pembayaran setelah konfirmasi pesanan.
              </p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-border/60 bg-surface p-4 shadow-soft sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Ringkasan Belanja
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-foreground-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground-muted">
                  <span>Ongkos Kirim</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="mt-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-button"
                isLoading={
                  isSubmitting || createOrder.isPending || createSnap.isPending
                }
                disabled={!isFormValid}
              >
                {step === "payment"
                  ? "Menunggu Pembayaran..."
                  : "Bayar Sekarang"}
              </Button>
              {!isAuthenticated && (
                <Link href={ROUTES.LOGIN}>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    className="mt-2 rounded-full"
                  >
                    Masuk untuk poin loyalitas
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Midtrans Snap Popup */}
      {snapToken && (
        <MidtransSnap
          token={snapToken}
          onSuccess={handleSnapCallback as any}
          onPending={handleSnapCallback as any}
          onError={() => {
            hasPaid.current = true;
            window.location.href = "/payment/error";
          }}
          onClose={() => {
            // User closed without paying -- allow retry
            hasPaid.current = true;
          }}
        />
      )}
    </form>
  );
}
