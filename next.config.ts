import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/orders/:id',
        destination: '/admin/orders',
        permanent: false,
      },
    ]
  },
  images: {
    // Disable optimization for external images to avoid 400 errors
    // Images will be served directly from source
    unoptimized: true,
    remotePatterns: [
      // Medusa backend (port 9000)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      // Legacy Express backend (port 3001)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // External images - pravatar.cc
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      // External images - unsplash.com
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // External images - ui-avatars.com
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      // MinIO CDN
      {
        protocol: 'https',
        hostname: 'shop.filterairwaterpro.com',
        pathname: '/cdn/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
