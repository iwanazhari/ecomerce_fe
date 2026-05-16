import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, DM_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { cn } from "@/lib/utils"
import { TooltipProvider } from '@/components/ui'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Waterpro — Filter Air Praktis',
    template: '%s | Waterpro',
  },
  description: 'Premium water solutions for your home and business. Shop filters, systems, and accessories.',
  keywords: ['water', 'filter', 'purifier', 'waterpro'],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4F46E5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={cn("font-sans", plusJakartaSans.variable, dmSans.variable, geistMono.variable)} suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <TooltipProvider>
          <Providers>{children}</Providers>
        </TooltipProvider>
      </body>
    </html>
  )
}
