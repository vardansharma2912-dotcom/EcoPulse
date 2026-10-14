import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DemoBanner } from '../DemoBanner'
import * as AppStateModule from '../../../state'

// Mock state
vi.mock('../../../state', () => ({
  useAppState: vi.fn(),
}))

describe('DemoBanner Component', () => {
  const mockRemoveSampleData = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof globalThis.sessionStorage === 'undefined') {
      const store = new Map<string, string>()
      globalThis.sessionStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, String(v)),
        removeItem: (k: string) => { store.delete(k) },
        clear: () => store.clear(),
        length: 0,
        key: () => null,
      }
    } else {
      sessionStorage.clear()
    }
  })

  it('renders nothing when no demo completions exist', () => {
    vi.mocked(AppStateModule.useAppState).mockReturnValue({
      state: { completions: [] } as any,
      removeSampleData: mockRemoveSampleData,
    } as any)

    const html = renderToString(<DemoBanner />)
    expect(html).toBe('')
  })

  it('renders banner with top-right dismiss cross button when demo completions exist', () => {
    vi.mocked(AppStateModule.useAppState).mockReturnValue({
      state: {
        completions: [
          { id: 'comp-1', isDemo: true, reminderId: 'rem-1', title: 'Test Demo', date: '2026-10-14', completedAt: '2026-10-14T10:00:00Z', kWh: 0.1, costSaved: 1, tariffAtTime: 10 },
        ],
      } as any,
      removeSampleData: mockRemoveSampleData,
    } as any)

    const html = renderToString(<DemoBanner />)
    expect(html).toContain('Sample data is loaded for demonstration.')
    expect(html).toContain('aria-label="Dismiss banner"')
    expect(html).toContain('title="Dismiss banner"')
    expect(html).toContain('Remove sample data')
  })

  it('does not render when sessionStorage indicates the banner was dismissed', () => {
    sessionStorage.setItem('ecopulse_demo_banner_dismissed', 'true')

    vi.mocked(AppStateModule.useAppState).mockReturnValue({
      state: {
        completions: [
          { id: 'comp-1', isDemo: true, reminderId: 'rem-1', title: 'Test Demo', date: '2026-10-14', completedAt: '2026-10-14T10:00:00Z', kWh: 0.1, costSaved: 1, tariffAtTime: 10 },
        ],
      } as any,
      removeSampleData: mockRemoveSampleData,
    } as any)

    const html = renderToString(<DemoBanner />)
    expect(html).toBe('')
  })
})
