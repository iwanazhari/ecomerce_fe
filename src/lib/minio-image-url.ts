/**
 * Image URL Utility — transforms Medusa local file URLs to MinIO CDN URLs.
 *
 * Medusa returns URLs like:
 *   http://localhost:9000/static/uploads/products/xxx.jpg
 *
 * In production with Nginx CDN:
 *   https://cdn.filterairwaterpro.com/uploads/products/xxx.jpg
 */

import { config } from '@/config/env'

const CDN_URL = config.minioCdnUrl
const BACKEND_URL = config.medusaUrl

/**
 * Transform a Medusa image URL to MinIO CDN URL.
 * Falls back to backend URL if CDN not configured.
 */
export function getImageUrl(url: string): string {
  if (!url) return ''

  // Already an absolute URL that's not from our backend — return as-is (external images)
  if ((url.startsWith('http://') || url.startsWith('https://')) && !url.includes(BACKEND_URL)) {
    return url
  }

  // No CDN configured — fall back to backend static serving
  if (!CDN_URL) {
    if (url.startsWith('/')) {
      return `${BACKEND_URL}${url}`
    }
    return url
  }

  // Extract file key from various URL formats
  const fileKey = extractFileKey(url)
  if (!fileKey) return url

  // Build CDN URL
  const cdnUrl = `${CDN_URL}/${fileKey}`
  return cdnUrl
}

function extractFileKey(url: string): string | null {
  try {
    // Handle CDN URLs (already correct format)
    if (CDN_URL && url.startsWith(CDN_URL)) {
      return url.replace(`${CDN_URL}/`, '')
    }

    // Handle MinIO direct URLs: http://localhost:9000/bucket/uploads/xxx.jpg
    const minioMatch = url.match(/localhost:9000\/[^/]+\/(.+)/)
    if (minioMatch) return minioMatch[1]

    // Handle backend static URLs: http://localhost:9000/static/uploads/xxx.jpg
    if (url.includes('/static/')) {
      const match = url.match(/\/static\/(.+)/)
      return match ? match[1] : null
    }

    // Handle relative paths: /uploads/xxx.jpg or /static/uploads/xxx.jpg
    if (url.startsWith('/static/')) {
      return url.slice('/static/'.length)
    }
    if (url.startsWith('/uploads/')) {
      return url.slice(1) // Remove leading slash
    }

    // Already a file key
    return url
  } catch {
    return null
  }
}
