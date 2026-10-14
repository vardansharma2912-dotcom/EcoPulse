import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { FillerSlot } from '../FillerSlot'
import { AppStateProvider } from '../../../state/AppContext'
import * as storage from '../../../lib/storage'
import React from 'react'

describe('FillerSlot Component', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const originalLocalStorage = globalThis.localStorage

  beforeEach(() => {
    // Polyfill minimal browser environment for Node test runner
    const store = new Map<string, string>()
    store.set(storage.WELCOME_FLAG_KEY, 'true')
    store.set(storage.TOUR_FLAG_KEY, 'true')

    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    }

    globalThis.window = {
      innerWidth: 1280,
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      querySelector: () => null,
      querySelectorAll: () => [] as unknown as NodeListOf<Element>,
    } as unknown as Document

    vi.spyOn(storage, 'isWelcomeHandled').mockReturnValue(true)
    vi.spyOn(storage, 'isTourSeen').mockReturnValue(true)
  })

  afterEach(() => {
    globalThis.window = originalWindow
    globalThis.document = originalDocument
    globalThis.localStorage = originalLocalStorage
    vi.restoreAllMocks()
  })

  it('renders nothing on fresh first run when welcome is not handled', () => {
    vi.spyOn(storage, 'isWelcomeHandled').mockReturnValue(false)

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppStateProvider>
          <FillerSlot page="dashboard" gap={200} />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders nothing on fresh first run when tour is not seen', () => {
    vi.spyOn(storage, 'isTourSeen').mockReturnValue(false)

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppStateProvider>
          <FillerSlot page="dashboard" gap={200} />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders nothing when mobile screen width is below 1024 px', () => {
    globalThis.window = {
      innerWidth: 768,
    } as unknown as Window & typeof globalThis

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppStateProvider>
          <FillerSlot page="dashboard" gap={200} />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders nothing on prohibited routes (e.g., Settings or Welcome)', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/settings']}>
        <AppStateProvider>
          <FillerSlot page="dashboard" gap={200} />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders nothing when any dialog is open in the DOM', () => {
    globalThis.document = {
      querySelector: (sel: string) => (sel.includes('dialog') ? ({} as Element) : null),
      querySelectorAll: () => [] as unknown as NodeListOf<Element>,
    } as unknown as Document

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppStateProvider>
          <FillerSlot page="dashboard" gap={200} />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders nothing when gap is below 160 px', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppStateProvider>
          <FillerSlot page="dashboard" gap={120} />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders fitting filler at exact height when gap is >= 160 px and settles in under 4 renders', () => {
    let renderCount = 0

    const RenderTracker: React.FC<{ gap: number }> = ({ gap }) => {
      renderCount++
      return (
        <FillerSlot
          page="dashboard"
          gap={gap}
        />
      )
    }

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppStateProvider>
          <RenderTracker gap={200} />
        </AppStateProvider>
      </MemoryRouter>
    )

    // Settle in under 4 renders (no feedback loop)
    expect(renderCount).toBeLessThan(4)

    // Slot markup with exact height attributes
    expect(html).toContain('data-filler-slot="true"')
    expect(html).toContain('data-filler-height="184"') // 200 - 16
  })
})
