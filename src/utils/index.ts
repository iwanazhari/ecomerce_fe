import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { config } from '@/config/env'
import { getImageUrl as getMinioImageUrl } from '@/lib/minio-image-url'

/**
 * Merge Tailwind CSS classes with clsx deduplication + tailwind-merge resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indonesian Rupiah.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Parse a formatted Indonesian Rupiah string back to a number.
 * "Rp 150.000" → 150000
 */
export function parseCurrency(formatted: string): number {
  const cleaned = formatted.replace(/[^\d]/g, '')
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Convert image URL to R2 CDN URL (or fallback to backend URL).
 * Handles: relative paths, backend URLs, external URLs, and R2 URLs.
 */
export function getImageUrl(url: string): string {
  if (!url) return ''

  // Blob/data URLs are browser-temporary — never transform or send to MinIO
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }

  // Already an absolute external URL (not from our backend) — return as-is
  if ((url.startsWith('http://') || url.startsWith('https://')) && !url.includes(config.apiBaseUrl)) {
    return url
  }

  // Use MinIO CDN transformer (handles all URL formats)
  return getMinioImageUrl(url)
}

/**
 * Format a date string to a locale display string.
 */
export function formatDate(date: string | Date, locale: string = 'id-ID'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date to relative time (e.g. "2 jam yang lalu").
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'baru saja'
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHr < 24) return `${diffHr} jam yang lalu`
  if (diffDay < 7) return `${diffDay} hari yang lalu`
  return formatDate(date)
}

/**
 * Truncate text to a given length with ellipsis.
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…'
}

/**
 * Generate a placeholder image URL with initials.
 */
export function placeholderImage(text: string, width = 400, height = 400): string {
  const initial = text.charAt(0).toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=e5e7eb&color=6b7280&size=${width}&rounded=true&bold=true`
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Safe JSON parse that returns null on failure.
 */
export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * Build a query string from an object, filtering out null/undefined/empty values.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

export { getOrCreateSessionId, clearSessionId } from './session'
