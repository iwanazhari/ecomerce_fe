export const config = {
  // Express backend (port 4000)
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000",

  // Midtrans
  midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
  midtransIsProduction:
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",

  // MinIO CDN (self-hosted S3 + Nginx cache)
  minioCdnUrl: process.env.NEXT_PUBLIC_MINIO_CDN_URL ?? "",

  // Google
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
} as const;
