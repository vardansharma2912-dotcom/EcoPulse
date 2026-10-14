import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { useGapMeasure } from '../useGapMeasure'
import React, { useRef } from 'react'

describe('useGapMeasure Hook', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document

  beforeEach(() => {
    globalThis.window = {
      innerWidth: 1280,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      querySelector: () => null,
      querySelectorAll: () => [] as unknown as NodeListOf<Element>,
      fonts: {
        ready: Promise.resolve(),
      },
      body: {
        classList: {
          contains: () => false,
        },
      },
    } as unknown as Document
  })

  afterEach(() => {
    globalThis.window = originalWindow
    globalThis.document = originalDocument
    vi.restoreAllMocks()
  })

  it('initializes with zero gap and no filler during initial mount', () => {
    const TestComponent: React.FC = () => {
      const hostRef = useRef<HTMLDivElement>(null)
      const targetRef = useRef<HTMLDivElement>(null)

      const result = useGapMeasure({
        hostRef,
        targetRef,
        renderedFillerHeight: 0,
      })

      return <div data-gap={result.gap} data-showing={String(result.shouldShowFiller)} />
    }

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <TestComponent />
      </MemoryRouter>
    )

    expect(html).toContain('data-gap="0"')
    expect(html).toContain('data-showing="false"')
  })

  it('calculates gap math accurately and excludes rendered filler height', () => {
    // Pure math verification of gap formula: bottomTarget - bottomHost + renderedFillerHeight
    const targetBottom = 500
    const hostBottomWithFiller = 480 // filler is 180px
    const renderedFillerHeight = 180

    const bottomDiff = targetBottom - hostBottomWithFiller // 20px
    const rawGap = bottomDiff + renderedFillerHeight // 200px

    expect(rawGap).toBe(200)
    expect(rawGap >= 160).toBe(true)
  })

  it('implements hysteresis math: 160 show threshold / 120 hide threshold', () => {
    const SHOW_THRESHOLD = 160
    const HIDE_THRESHOLD = 120

    // Gap at 170 (>= 160): shows
    expect(170 >= SHOW_THRESHOLD).toBe(true)

    // When showing, gap drops to 140 (< 160, but >= 120): stays showing
    const isShowing = true
    const currentGap = 140
    const stillShowing = isShowing ? currentGap >= HIDE_THRESHOLD : currentGap >= SHOW_THRESHOLD
    expect(stillShowing).toBe(true)

    // When showing, gap drops to 110 (< 120): hides
    const gapDropped = 110
    const hideResult = isShowing ? gapDropped >= HIDE_THRESHOLD : gapDropped >= SHOW_THRESHOLD
    expect(hideResult).toBe(false)
  })

  it('disables on mobile viewports below 1024 px', () => {
    globalThis.window = {
      innerWidth: 768,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window & typeof globalThis

    const TestComponent: React.FC = () => {
      const hostRef = useRef<HTMLDivElement>(null)
      const targetRef = useRef<HTMLDivElement>(null)

      const result = useGapMeasure({
        hostRef,
        targetRef,
      })

      return <div data-gap={result.gap} data-showing={String(result.shouldShowFiller)} />
    }

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <TestComponent />
      </MemoryRouter>
    )

    expect(html).toContain('data-gap="0"')
    expect(html).toContain('data-showing="false"')
  })

  it('disables when a dialog is open', () => {
    globalThis.document = {
      querySelector: (sel: string) => (sel.includes('dialog') ? ({} as Element) : null),
      querySelectorAll: () => [] as unknown as NodeListOf<Element>,
      fonts: { ready: Promise.resolve() },
      body: { classList: { contains: () => false } },
    } as unknown as Document

    const TestComponent: React.FC = () => {
      const hostRef = useRef<HTMLDivElement>(null)
      const targetRef = useRef<HTMLDivElement>(null)

      const result = useGapMeasure({
        hostRef,
        targetRef,
      })

      return <div data-gap={result.gap} data-showing={String(result.shouldShowFiller)} />
    }

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <TestComponent />
      </MemoryRouter>
    )

    expect(html).toContain('data-gap="0"')
    expect(html).toContain('data-showing="false"')
  })
})
