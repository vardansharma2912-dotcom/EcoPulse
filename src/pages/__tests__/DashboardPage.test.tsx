import { describe, it, expect, beforeEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'
import { AppStateProvider } from '../../state/AppContext'
import { TourProvider } from '../../context/TourContext'
import { ToastProvider } from '../../context/ToastContext'

import { STORAGE_KEY } from '../../lib/storage'

// In-memory localStorage polyfill for Node test environment
const mockStore = new Map<string, string>()
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => mockStore.get(key) ?? null,
    setItem: (key: string, val: string) => {
      mockStore.set(key, String(val))
    },
    removeItem: (key: string) => {
      mockStore.delete(key)
    },
    clear: () => {
      mockStore.clear()
    },
    length: 0,
    key: () => null,
  }
}

describe('DashboardPage First-Run Clarity & Reveal Rules', () => {
  beforeEach(() => {
    mockStore.clear()
    localStorage.clear()
  })

  it('renders single hero card with plain sentence, large button, and quick-add templates when user has 0 reminders', () => {
    // 0 reminders in storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reminders: [],
      completions: [],
      settings: { displayName: 'Vardaan', darkMode: false, tariffPerKwh: 8 }
    }))

    const html = renderToString(
      <MemoryRouter>
        <ToastProvider>
          <AppStateProvider>
            <TourProvider>
              <DashboardPage />
            </TourProvider>
          </AppStateProvider>
        </ToastProvider>
      </MemoryRouter>
    )

    // Hero card sentence
    expect(html).toContain('EcoPulse reminds you to switch things off. Add your first reminder in 10 seconds.')
    // Large primary button
    expect(html).toContain('Add my first reminder')
    // Quick-add templates
    expect(html).toContain('Lights off when leaving')
    expect(html).toContain('Unplug chargers')
    expect(html).toContain('AC off when room is cool')
    expect(html).toContain('Laptop sleep / power down')
    // Secondary cards are HIDDEN
    expect(html).not.toContain('Energy Saved Today')
    expect(html).not.toContain('Weekly Energy Saved')
    expect(html).not.toContain('Getting Started Checklist')
  })

  it('renders simple view when user has at least 1 reminder and 0 completions', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reminders: [
        {
          id: 'rem-1',
          title: 'Turn off lights when leaving',
          category: 'lighting',
          time: '23:59',
          recurrence: 'daily',
          applianceWatts: 40,
          avoidedHours: 4,
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        }
      ],
      completions: [],
      settings: { displayName: 'Vardaan', darkMode: false, tariffPerKwh: 8 }
    }))

    const html = renderToString(
      <MemoryRouter>
        <ToastProvider>
          <AppStateProvider>
            <TourProvider>
              <DashboardPage />
            </TourProvider>
          </AppStateProvider>
        </ToastProvider>
      </MemoryRouter>
    )

    // Hero card is gone
    expect(html).not.toContain('Add my first reminder')
    // Top metrics are visible
    expect(html).toContain('Energy Saved Today')
    expect(html).toContain('Due Today')
    // Today's Reminders list with Done button is visible
    expect(html).toContain('Turn off lights when leaving')
    expect(html).toContain('Done')
    // Secondary cards (weekly glance, category progress, streak tiers) are HIDDEN
    expect(html).not.toContain('Today by category')
    expect(html).not.toContain('Weekly Energy Saved')
    expect(html).not.toContain('Action Streak')
  })

  it('reveals all secondary cards when user has at least 1 reminder and at least 1 completion', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reminders: [
        {
          id: 'rem-1',
          title: 'Turn off lights when leaving',
          category: 'lighting',
          time: '23:59',
          recurrence: 'daily',
          applianceWatts: 40,
          avoidedHours: 4,
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        }
      ],
      completions: [
        {
          id: 'comp-1',
          reminderId: 'rem-1',
          title: 'Turn off lights when leaving',
          date: '2026-10-15',
          completedAt: '2026-10-15T12:00:00.000Z',
          kWh: 0.16,
          costSaved: 1.28,
        }
      ],
      settings: { displayName: 'Vardaan', darkMode: false, tariffPerKwh: 8 }
    }))

    const html = renderToString(
      <MemoryRouter>
        <ToastProvider>
          <AppStateProvider>
            <TourProvider>
              <DashboardPage />
            </TourProvider>
          </AppStateProvider>
        </ToastProvider>
      </MemoryRouter>
    )

    // All secondary cards are revealed
    expect(html).toContain('Action Streak')
    expect(html).toContain('Today by category')
    expect(html).toContain('All-Time Energy Saved')
    expect(html).toContain('Recent Completed Reminders')
  })
})
