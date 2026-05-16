import Medusa from '@medusajs/js-sdk'
import { config } from '@/config/env'

/**
 * Medusa JS SDK client.
 * Auth tokens are stored under 'wp_access_token' (set by adminLogin in auth.ts).
 * The SDK is configured to read from the same key so admin API calls include the token.
 */
export const medusa = new Medusa({
  baseUrl: config.medusaUrl,
  auth: {
    type: 'jwt',
    jwtTokenStorageKey: 'wp_access_token',
    jwtTokenStorageMethod: 'local',
  },
  publishableKey: config.medusaPublishableKey,
  debug: process.env.NODE_ENV === 'development',
})

export default medusa
