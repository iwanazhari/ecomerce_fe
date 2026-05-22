import Link from "next/link";
import { ROUTES } from "@/constants";
import { Input, Button } from "@/components/ui";
import { ShieldCheck, Award, Phone, Mail, MapPin, Send } from "lucide-react";

// Simple SVG social icons
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
      <polygon
        points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
        fill="white"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Dark gradient background matching homepage CTA */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* CTA Newsletter */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Dapatkan Info Terbaru
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Subscribe untuk promo dan tips air bersih.
                </p>
              </div>
              <div className="flex w-full max-w-sm gap-2">
                <Input
                  type="email"
                  placeholder="Email Anda"
                  className="h-10 rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-primary focus:bg-white/15"
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="h-10 rounded-full"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2 md:col-span-2 lg:col-span-2">
              <img
                src="/logo.png"
                alt="Waterpro"
                className="h-8 w-auto brightness-0 invert"
              />
              <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
                Solusi lengkap filter air bersih untuk mandi dan minum. Waterpro
                menghadirkan air berkualitas tinggi dengan teknologi filtrasi
                modern.
              </p>

              {/* Certifications */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <ShieldCheck className="size-3.5 text-primary" />
                  SNI Certified
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <Award className="size-3.5 text-primary" />
                  WHO Standard
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <ShieldCheck className="size-3.5 text-primary" />
                  ISO 9001
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <a
                  href="https://wa.me/6281234567890"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors"
                >
                  <Phone className="size-4" />
                  +62 812-3456-7890
                </a>
                <a
                  href="mailto:info@filterairwaterpro.com"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors"
                >
                  <Mail className="size-4" />
                  info@filterairwaterpro.com
                </a>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <MapPin className="size-4" />
                  Jakarta, Indonesia
                </div>
              </div>
            </div>

            {/* Produk */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                Produk
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href={ROUTES.PRODUCTS}
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Semua Produk
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Kran Filter
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Cartridge Filter
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    RO System
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Shower Filter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bantuan */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                Bantuan
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Cara Pemesanan
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    Garansi Produk
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                Ikuti Kami
              </h3>
              <div className="mt-4 flex gap-3">
                <a
                  href="#"
                  className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="size-4" />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-primary hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="size-4" />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-primary hover:text-white transition-colors"
                  aria-label="Youtube"
                >
                  <YoutubeIcon className="size-4" />
                </a>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Pembayaran
                </h4>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/40">
                  <span className="rounded bg-white/10 px-2 py-1">
                    Midtrans
                  </span>
                  <span className="rounded bg-white/10 px-2 py-1">QRIS</span>
                  <span className="rounded bg-white/10 px-2 py-1">
                    Bank Transfer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} Filter Air Waterpro. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Syarat & Ketentuan
              </Link>
              <Link
                href="#"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
