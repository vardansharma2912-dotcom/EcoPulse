/**
 * EcoPulse Site Configuration
 * Single source of truth for domain URL, project branding, and taglines.
 */

export const SITE_URL: string =
  ((typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { process?: { env?: { VITE_SITE_URL?: string } } }).process?.env?.VITE_SITE_URL) ||
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL) ||
    'https://eco-pulse-flame.vercel.app').replace(/\/+$/, '')

export const SITE_NAME = 'EcoPulse'

export const SITE_TAGLINE = 'Smart Energy Saving Reminder'

export const SITE_DESCRIPTION =
  'Build sustainable energy-saving habits with timely reminders, estimated savings, and analytics.'

/**
 * Converts a root-relative path into an absolute canonical site URL.
 * Ensures no trailing slash for non-root paths.
 */
export function absoluteUrl(path = ''): string {
  if (!path || path === '/') {
    return `${SITE_URL}/`
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized.replace(/\/+$/, '')}`
}
