export const config = {
  // Custom Express backend (legacy — keep if you need both backends)
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001',

  // Medusa backend (port 9002)
  medusaUrl: process.env.NEXT_PUBLIC_MEDUSA_URL ?? 'http://localhost:9002',
  medusaPublishableKey:
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? '',

  // Midtrans
  midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
  midtransIsProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',

  // MinIO CDN (self-hosted S3 + Nginx cache)
  minioCdnUrl: process.env.NEXT_PUBLIC_MINIO_CDN_URL ?? '',

  // Google
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
} as const
