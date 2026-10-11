import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  clearState,
  migrateCompletions,
  STORAGE_KEY,
  PREVIOUS_STORAGE_KEY,
} from '../storage'
import type { Reminder } from '../../types'

// Provide in-memory localStorage polyfill for Node test environment
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

describe('Storage v1 to v2 Migration & Persistence', () => {
  beforeEach(() => {
    mockStore.clear()
    clearState()
  })

  it('migrateCompletions accurately fills titles from reminders or assigns fallback for deleted ones', () => {
    const existingReminders: Reminder[] = [
      {
        id: 'rem-light',
        title: 'Turn off desk lamp',
        category: 'lighting',
        time: '22:00',
        recurrence: 'daily',
        applianceWatts: 15,
        avoidedHours: 4,
        active: true,
        createdAt: '2026-10-01T00:00:00.000Z',
      },
    ]

    const legacyCompletions = [
      {
        id: 'comp-1',
        reminderId: 'rem-light',
        // title intentionally missing (v1 format)
        date: '2026-10-10',
        completedAt: '2026-10-10T22:05:00.000Z',
        kWh: 0.06,
        costSaved: 0.48,
        tariffAtTime: 8,
      },
      {
        id: 'comp-2',
        reminderId: 'rem-orphan', // reminder no longer exists
        // title intentionally missing (v1 format)
        date: '2026-10-09',
        completedAt: '2026-10-09T18:00:00.000Z',
        kWh: 0.15,
        costSaved: 1.2,
        tariffAtTime: 8,
      },
      {
        id: 'comp-3',
        reminderId: 'rem-light',
        title: 'Already has a snapshot title',
        date: '2026-10-11',
        completedAt: '2026-10-11T22:00:00.000Z',
        kWh: 0.06,
        costSaved: 0.48,
        tariffAtTime: 8,
      },
    ]

    const migrated = migrateCompletions(legacyCompletions, existingReminders)

    expect(migrated).toHaveLength(3)
    // 1. Matched to active reminder
    expect(migrated[0].title).toBe('Turn off desk lamp')
    expect(migrated[0].reminderId).toBe('rem-light')
    expect(migrated[0].kWh).toBe(0.06)
    expect(migrated[0].costSaved).toBe(0.48)

    // 2. Orphaned reminder gets "Deleted reminder"
    expect(migrated[1].title).toBe('Deleted reminder')
    expect(migrated[1].reminderId).toBe('rem-orphan')
    expect(migrated[1].kWh).toBe(0.15)
    expect(migrated[1].costSaved).toBe(1.2)

    // 3. Existing title preserved
    expect(migrated[2].title).toBe('Already has a snapshot title')
  })

  it('loadState successfully migrates v1 data from localStorage to v2 without data loss', () => {
    // Simulate v1 state stored under ecopulse_app_state_v1
    const v1State = {
      reminders: [
        {
          id: 'rem-pc',
          title: 'Turn off monitor before class',
          category: 'standby',
          time: '08:30',
          recurrence: 'daily',
          applianceWatts: 30,
          avoidedHours: 5,
          active: true,
          createdAt: '2026-10-05T00:00:00.000Z',
        },
      ],
      completions: [
        {
          id: 'comp-pc-1',
          reminderId: 'rem-pc',
          // Notice: no title field exists in v1
          date: '2026-10-09',
          completedAt: '2026-10-09T08:32:00.000Z',
          kWh: 0.15,
          costSaved: 1.275,
          tariffAtTime: 8.5,
        },
        {
          id: 'comp-old-1',
          reminderId: 'rem-deleted-appliance',
          // Notice: no title field exists in v1 and reminder was deleted
          date: '2026-10-08',
          completedAt: '2026-10-08T19:00:00.000Z',
          kWh: 0.5,
          costSaved: 4.25,
          tariffAtTime: 8.5,
        },
      ],
      settings: {
        displayName: 'Campus Eco Warrior',
        tariffPerKwh: 8.5,
        notificationsEnabled: true,
      },
      lastUpdated: '2026-10-09T08:35:00.000Z',
    }

    // Set v1 key and verify v2 key does not exist yet
    localStorage.setItem(PREVIOUS_STORAGE_KEY, JSON.stringify(v1State))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // Execute loadState which performs the migration
    const loadedState = loadState()

    // Verify settings were preserved
    expect(loadedState.settings.displayName).toBe('Campus Eco Warrior')
    expect(loadedState.settings.tariffPerKwh).toBe(8.5)
    expect(loadedState.settings.notificationsEnabled).toBe(true)

    // Verify reminders preserved
    expect(loadedState.reminders).toHaveLength(1)
    expect(loadedState.reminders[0].id).toBe('rem-pc')
    expect(loadedState.reminders[0].title).toBe('Turn off monitor before class')

    // Verify completions migrated with titles populated
    expect(loadedState.completions).toHaveLength(2)

    const comp1 = loadedState.completions.find((c) => c.id === 'comp-pc-1')
    expect(comp1).toBeDefined()
    expect(comp1?.title).toBe('Turn off monitor before class')
    expect(comp1?.kWh).toBe(0.15)
    expect(comp1?.costSaved).toBe(1.275)
    expect(comp1?.tariffAtTime).toBe(8.5)
    expect(comp1?.date).toBe('2026-10-09')

    const comp2 = loadedState.completions.find((c) => c.id === 'comp-old-1')
    expect(comp2).toBeDefined()
    expect(comp2?.title).toBe('Deleted reminder')
    expect(comp2?.kWh).toBe(0.5)
    expect(comp2?.costSaved).toBe(4.25)
    expect(comp2?.tariffAtTime).toBe(8.5)
    expect(comp2?.date).toBe('2026-10-08')

    // Verify that the migrated state was persisted under the new v2 storage key
    const v2Raw = localStorage.getItem(STORAGE_KEY)
    expect(v2Raw).not.toBeNull()
    const parsedV2 = JSON.parse(v2Raw!)
    expect(parsedV2.completions[0].title).toBe('Turn off monitor before class')
    expect(parsedV2.completions[1].title).toBe('Deleted reminder')
  })
})
