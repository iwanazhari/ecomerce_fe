import Link from "next/link";
import { ROUTES } from "@/constants";
import { ShieldCheck, Award, Phone, Mail, MapPin } from "lucide-react";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
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
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-indigo-950 to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src="/images/logo.png" alt="Waterpro" className="h-8 w-auto brightness-0 invert" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Solusi lengkap filter air bersih untuk mandi dan minum.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "SNI" },
                { icon: Award, label: "WHO" },
                { icon: ShieldCheck, label: "ISO" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70">
                  <Icon className="size-3 text-primary" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <a href="https://wa.me/6281234567890" className="flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors">
                <Phone className="size-3.5" /> +62 812-3456-7890
              </a>
              <a href="mailto:info@filterairwaterpro.com" className="flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors">
                <Mail className="size-3.5" /> info@filterairwaterpro.com
              </a>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <MapPin className="size-3.5" /> Jakarta, Indonesia
              </div>
            </div>
          </div>

          {/* Produk */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Produk</h3>
            <ul className="mt-4 space-y-2.5">
              {["Semua Produk", "Kran Filter", "Cartridge", "RO System", "Shower Filter"].map((label, i) => (
                <li key={label}>
                  <Link
                    href={i === 0 ? ROUTES.PRODUCTS : "#"}
                    className="text-xs text-white/50 hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Bantuan</h3>
            <ul className="mt-4 space-y-2.5">
              {["FAQ", "Hubungi Kami", "Cara Pemesanan", "Garansi Produk"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-xs text-white/50 hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sosial & Pembayaran */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Ikuti Kami</h3>
            <div className="mt-4 flex gap-2">
              {[
                { icon: FacebookIcon, label: "Facebook" },
                { icon: InstagramIcon, label: "Instagram" },
                { icon: YoutubeIcon, label: "Youtube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-full bg-white/10 p-2 text-white/50 hover:bg-primary hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="size-3.5" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Pembayaran</h4>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Midtrans", "QRIS", "Bank Transfer"].map((m) => (
                  <span key={m} className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/40">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-[11px] text-white/40">
            &copy; {new Date().getFullYear()} Filter Air Waterpro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="#" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
