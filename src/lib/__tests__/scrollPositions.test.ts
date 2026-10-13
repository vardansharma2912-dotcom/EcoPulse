import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  ScrollPositionStore,
  getPageScrollPosition,
  scrollToPosition,
  scrollToAnchor,
  cleanupScrollLocks,
} from '../scrollPositions'

describe('Scroll Position Store & Helper Functions', () => {
  let store: ScrollPositionStore

  beforeEach(() => {
    store = new ScrollPositionStore()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores and retrieves coordinates keyed by history key', () => {
    expect(store.has('entry-1')).toBe(false)
    store.save('entry-1', { x: 0, y: 450 })
    expect(store.has('entry-1')).toBe(true)
    expect(store.get('entry-1')).toEqual({ x: 0, y: 450 })
    expect(store.size()).toBe(1)

    store.save('entry-2', { x: 10, y: 1200 })
    expect(store.get('entry-2')).toEqual({ x: 10, y: 1200 })
    expect(store.size()).toBe(2)

    store.delete('entry-1')
    expect(store.has('entry-1')).toBe(false)
    expect(store.size()).toBe(1)

    store.clear()
    expect(store.size()).toBe(0)
  })

  it('ignores empty keys safely', () => {
    store.save('', { x: 0, y: 100 })
    expect(store.size()).toBe(0)
    expect(store.get('')).toBeUndefined()
  })

  it('returns scroll coordinates from window and document', () => {
    vi.stubGlobal('window', {
      scrollX: 15,
      scrollY: 320,
    })
    vi.stubGlobal('document', {
      documentElement: { scrollLeft: 0, scrollTop: 0, style: {} },
      body: { scrollLeft: 0, scrollTop: 0, style: {} },
    })

    const pos = getPageScrollPosition()
    expect(pos).toEqual({ x: 15, y: 320 })
  })

  it('executes scrollToPosition with behavior instant and restores scrollBehavior', () => {
    const mockScrollTo = vi.fn()
    const docEl = {
      scrollTop: 100,
      scrollLeft: 0,
      style: { scrollBehavior: 'smooth' },
    }
    const body = {
      scrollTop: 100,
      scrollLeft: 0,
      style: { scrollBehavior: 'smooth' },
    }

    vi.stubGlobal('window', {
      scrollTo: mockScrollTo,
      scrollX: 0,
      scrollY: 0,
    })
    vi.stubGlobal('document', {
      documentElement: docEl,
      body: body,
      querySelector: vi.fn().mockReturnValue(null),
    })

    scrollToPosition({ x: 0, y: 0 })

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'instant' })
    expect(docEl.scrollTop).toBe(0)
    expect(body.scrollTop).toBe(0)
    // Cleanly restored original styles
    expect(docEl.style.scrollBehavior).toBe('smooth')
    expect(body.style.scrollBehavior).toBe('smooth')
  })

  it('scrolls to hash anchor element if found', () => {
    const mockScrollIntoView = vi.fn()
    const mockElement = { scrollIntoView: mockScrollIntoView }

    vi.stubGlobal('document', {
      getElementById: vi.fn((id: string) => (id === 'credits' ? mockElement : null)),
    })

    const success = scrollToAnchor('#credits')
    expect(success).toBe(true)
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })

    const notFound = scrollToAnchor('#unknown')
    expect(notFound).toBe(false)
  })

  it('unlocks body overflow when no open dialogs exist', () => {
    const mockRemoveAttribute = vi.fn()
    const body = {
      style: { overflow: 'hidden' },
      removeAttribute: mockRemoveAttribute,
    }

    vi.stubGlobal('document', {
      body,
      querySelector: vi.fn().mockReturnValue(null), // No open dialog
    })

    cleanupScrollLocks()
    expect(body.style.overflow).toBe('')
    expect(mockRemoveAttribute).toHaveBeenCalledWith('data-modal-open')
  })
})
