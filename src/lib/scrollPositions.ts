/**
 * Scroll Position Management & Route History Restoration
 */

export interface ScrollPosition {
  x: number
  y: number
}

export class ScrollPositionStore {
  private positions = new Map<string, ScrollPosition>()

  save(key: string, pos: ScrollPosition): void {
    if (!key) return
    this.positions.set(key, { ...pos })
  }

  get(key: string): ScrollPosition | undefined {
    if (!key) return undefined
    return this.positions.get(key)
  }

  has(key: string): boolean {
    if (!key) return false
    return this.positions.has(key)
  }

  delete(key: string): boolean {
    return this.positions.delete(key)
  }

  clear(): void {
    this.positions.clear()
  }

  size(): number {
    return this.positions.size
  }
}

export const globalScrollStore = new ScrollPositionStore()

/**
 * Returns current scroll coordinates of the primary viewport.
 */
export function getPageScrollPosition(): ScrollPosition {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  return {
    x: window.scrollX || document.documentElement?.scrollLeft || document.body?.scrollLeft || 0,
    y: window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0,
  }
}

/**
 * Instantly resets or sets scroll position without smooth delay or jarring jumps.
 */
export function scrollToPosition(pos: ScrollPosition = { x: 0, y: 0 }): void {
  if (typeof window === 'undefined') return

  const docEl = document.documentElement
  const body = document.body

  const origHtmlScroll = docEl ? docEl.style.scrollBehavior : ''
  const origBodyScroll = body ? body.style.scrollBehavior : ''

  try {
    if (docEl) docEl.style.scrollBehavior = 'auto'
    if (body) body.style.scrollBehavior = 'auto'

    window.scrollTo({ left: pos.x, top: pos.y, behavior: 'instant' })

    if (docEl) {
      docEl.scrollTop = pos.y
      docEl.scrollLeft = pos.x
    }
    if (body) {
      body.scrollTop = pos.y
      body.scrollLeft = pos.x
    }

    const main = document.querySelector('main')
    if (main && (main.scrollTop > 0 || main.scrollLeft > 0)) {
      main.scrollTop = pos.y
      main.scrollLeft = pos.x
    }
  } catch {
    // Fail silently in non-browser environments
  } finally {
    if (docEl) docEl.style.scrollBehavior = origHtmlScroll
    if (body) body.style.scrollBehavior = origBodyScroll
  }
}

/**
 * Scrolls to an anchor element matching the URL hash (#section-id).
 * Returns true if element was found and scrolled into view, false otherwise.
 */
export function scrollToAnchor(hash: string): boolean {
  if (typeof document === 'undefined' || !hash) return false
  const id = hash.replace(/^#/, '')
  if (!id) return false

  try {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
      return true
    }
  } catch {
    // Fail silently
  }
  return false
}

/**
 * Ensures body scroll locks from closed dialogs or navigation are cleanly unlocked.
 */
export function cleanupScrollLocks(): void {
  if (typeof document === 'undefined') return
  const hasOpenDialog = document.querySelector('[role="dialog"]') !== null
  if (!hasOpenDialog) {
    document.body.style.overflow = ''
    document.body.removeAttribute('data-modal-open')
  }
}
