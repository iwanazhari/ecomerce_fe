import type { Metadata, Viewport } from 'next'
import { Inter, Calistoga, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { cn } from "@/lib/utils"
import { TooltipProvider } from '@/components/ui'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const calistoga = Calistoga({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-calistoga',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
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
    <html lang="id" className={cn("font-sans", inter.variable, calistoga.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="preconnect" href="https://shop.filterairwaterpro.com" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://shop.filterairwaterpro.com" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <TooltipProvider>
          <Providers>{children}</Providers>
        </TooltipProvider>
      </body>
    </html>
  )
}
