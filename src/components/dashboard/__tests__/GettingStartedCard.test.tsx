import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import {
  GettingStartedCard,
} from '../GettingStartedCard'
import {
  getChecklistFirstSeenTimestamp,
  isChecklistExpired,
  CHECKLIST_EXPIRY_DAYS,
  CHECKLIST_EXPIRY_MS,
} from '../../../lib/checklist'
import { CHECKLIST_DISMISSED_KEY, CHECKLIST_FIRST_SEEN_KEY, STORAGE_KEY } from '../../../lib/storage'
import { AppStateProvider } from '../../../state/AppContext'

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

describe('GettingStartedCard Expiry Logic', () => {
  beforeEach(() => {
    mockStore.clear()
    localStorage.clear()
  })

  afterEach(() => {
    mockStore.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('defines 3 days expiry duration', () => {
    expect(CHECKLIST_EXPIRY_DAYS).toBe(3)
    expect(CHECKLIST_EXPIRY_MS).toBe(3 * 24 * 60 * 60 * 1000)
  })

  it('correctly calculates isChecklistExpired', () => {
    const now = 1000000000
    // Exactly 3 days ago -> expired
    expect(isChecklistExpired(now - CHECKLIST_EXPIRY_MS, now)).toBe(true)
    // 4 days ago -> expired
    expect(isChecklistExpired(now - (CHECKLIST_EXPIRY_MS + 86400000), now)).toBe(true)
    // 2 days ago -> active / not expired
    expect(isChecklistExpired(now - (CHECKLIST_EXPIRY_MS - 86400000), now)).toBe(false)
    // Just now -> active / not expired
    expect(isChecklistExpired(now, now)).toBe(false)
  })

  it('initializes and retrieves first seen timestamp from localStorage', () => {
    const stored = 1700000000000
    localStorage.setItem(CHECKLIST_FIRST_SEEN_KEY, stored.toString())
    expect(getChecklistFirstSeenTimestamp()).toBe(stored)
  })

  it('uses earliest reminder createdAt fallback when no stored first-seen timestamp exists', () => {
    const fallbackIso = '2026-10-01T12:00:00.000Z'
    const fallbackMs = new Date(fallbackIso).getTime()
    const result = getChecklistFirstSeenTimestamp(fallbackIso)
    expect(result).toBe(fallbackMs)
    expect(localStorage.getItem(CHECKLIST_FIRST_SEEN_KEY)).toBe(fallbackMs.toString())
  })

  it('does not render when user has 0 reminders (hero card priority)', () => {
    const now = Date.now()
    localStorage.setItem(CHECKLIST_FIRST_SEEN_KEY, now.toString())

    const html = renderToString(
      <MemoryRouter>
        <AppStateProvider>
          <GettingStartedCard />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })

  it('renders getting started card when user has at least 1 reminder within 3 days', () => {
    const now = Date.now()
    localStorage.setItem(CHECKLIST_FIRST_SEEN_KEY, now.toString())
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reminders: [{
        id: 'rem-1',
        title: 'Lights off',
        time: '21:00',
        recurrence: 'daily',
        active: true,
        applianceWatts: 60,
        avoidedHours: 4,
        category: 'lighting',
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
      completions: [],
      settings: { displayName: '', tariffPerKwh: 8, currency: '₹', notificationsEnabled: false },
      lastUpdated: new Date().toISOString(),
    }))

    const html = renderToString(
      <MemoryRouter>
        <AppStateProvider>
          <GettingStartedCard />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toContain('Getting Started Checklist')
    expect(html).toContain('Complete small milestones to get the most out of EcoPulse.')
  })

  it('does not render (hides) when checklist was first seen over 3 days ago', () => {
    const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000
    localStorage.setItem(CHECKLIST_FIRST_SEEN_KEY, fourDaysAgo.toString())
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reminders: [{
        id: 'rem-1',
        title: 'Lights off',
        time: '21:00',
        recurrence: 'daily',
        active: true,
        applianceWatts: 60,
        avoidedHours: 4,
        category: 'lighting',
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
      completions: [],
      settings: { displayName: '', tariffPerKwh: 8, currency: '₹', notificationsEnabled: false },
      lastUpdated: new Date().toISOString(),
    }))

    const html = renderToString(
      <MemoryRouter>
        <AppStateProvider>
          <GettingStartedCard />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
    expect(html).not.toContain('Getting Started Checklist')
  })

  it('does not render when checklist was dismissed by user', () => {
    const now = Date.now()
    localStorage.setItem(CHECKLIST_FIRST_SEEN_KEY, now.toString())
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reminders: [{
        id: 'rem-1',
        title: 'Lights off',
        time: '21:00',
        recurrence: 'daily',
        active: true,
        applianceWatts: 60,
        avoidedHours: 4,
        category: 'lighting',
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
      completions: [],
      settings: { displayName: '', tariffPerKwh: 8, currency: '₹', notificationsEnabled: false },
      lastUpdated: new Date().toISOString(),
    }))

    const html = renderToString(
      <MemoryRouter>
        <AppStateProvider>
          <GettingStartedCard />
        </AppStateProvider>
      </MemoryRouter>
    )

    expect(html).toBe('')
  })
})
