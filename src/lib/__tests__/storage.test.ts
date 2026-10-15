import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  saveState,
  clearState,
  migrateCompletions,
  STORAGE_KEY,
  PREVIOUS_STORAGE_KEY,
  createExportPayload,
  parseAndValidateImport,
  isValidState,
  sanitizeCurrency,
} from '../storage'
import type { Reminder, AppState } from '../../types'

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

  it('persists isDemo flags through storage and preserves authentic completions after demo removal', () => {
    const mixedState = {
      reminders: [],
      completions: [
        {
          id: 'real-1',
          reminderId: 'rem-1',
          title: 'Authentic Action',
          date: '2026-10-11',
          completedAt: '2026-10-11T10:00:00Z',
          kWh: 0.2,
          costSaved: 1.6,
          tariffAtTime: 8,
          // authentic, isDemo undefined
        },
        {
          id: 'demo-1',
          reminderId: 'rem-1',
          title: 'Sample Demo Action',
          date: '2026-10-10',
          completedAt: '2026-10-10T10:00:00Z',
          kWh: 0.15,
          costSaved: 1.2,
          tariffAtTime: 8,
          isDemo: true,
        },
      ],
      settings: {
        displayName: 'Student',
        tariffPerKwh: 8,
        notificationsEnabled: false,
      },
      lastUpdated: new Date().toISOString(),
    }

    // Save and reload
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixedState))
    const loaded = loadState()

    expect(loaded.completions).toHaveLength(2)
    expect(loaded.completions.find((c) => c.id === 'real-1')?.isDemo).toBeUndefined()
    expect(loaded.completions.find((c) => c.id === 'demo-1')?.isDemo).toBe(true)

    // Simulate removing demo completions
    const filteredCompletions = loaded.completions.filter((c) => !c.isDemo)
    expect(filteredCompletions).toHaveLength(1)
    expect(filteredCompletions[0].id).toBe('real-1')
    expect(filteredCompletions[0].title).toBe('Authentic Action')
  })
})

describe('Data Export and Import Round-Trip & Schema Validation', () => {
  const sampleState: AppState = {
    reminders: [
      {
        id: 'rem-export-1',
        title: 'Switch off study desk LED',
        category: 'lighting',
        time: '23:00',
        recurrence: 'daily',
        applianceWatts: 12,
        avoidedHours: 4,
        active: true,
        createdAt: '2026-10-10T12:00:00.000Z',
      },
      {
        id: 'rem-export-2',
        title: 'Unplug phone charger overnight',
        category: 'chargers',
        time: '07:30',
        recurrence: 'weekdays',
        applianceWatts: 10,
        avoidedHours: 8,
        active: true,
        createdAt: '2026-10-11T12:00:00.000Z',
      },
    ],
    completions: [
      {
        id: 'comp-export-1',
        reminderId: 'rem-export-1',
        title: 'Switch off study desk LED',
        date: '2026-10-12',
        completedAt: '2026-10-12T23:05:00.000Z',
        kWh: 0.048,
        costSaved: 0.384,
        tariffAtTime: 8,
      },
    ],
    settings: {
      displayName: 'Eco Pioneer',
      tariffPerKwh: 9.5,
      currency: '₹',
      notificationsEnabled: true,
    },
    lastUpdated: '2026-10-12T23:10:00.000Z',
  }

  it('createExportPayload serializes state into valid JSON containing version, reminders, completions, and settings', () => {
    const json = createExportPayload(sampleState)
    expect(typeof json).toBe('string')

    const parsed = JSON.parse(json)
    expect(parsed.version).toBe(2)
    expect(parsed.exportedAt).toBeDefined()
    expect(parsed.settings.displayName).toBe('Eco Pioneer')
    expect(parsed.settings.tariffPerKwh).toBe(9.5)
    expect(parsed.settings.notificationsEnabled).toBe(true)
    expect(parsed.reminders).toHaveLength(2)
    expect(parsed.reminders[0].title).toBe('Switch off study desk LED')
    expect(parsed.completions).toHaveLength(1)
    expect(parsed.completions[0].kWh).toBe(0.048)
  })

  it('ROUND-TRIP: parseAndValidateImport successfully reconstructs exported state with data integrity', () => {
    const exportedJson = createExportPayload(sampleState)
    const result = parseAndValidateImport(exportedJson)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()

    const imported = result.data!
    expect(imported.settings.displayName).toBe('Eco Pioneer')
    expect(imported.settings.tariffPerKwh).toBe(9.5)
    expect(imported.settings.notificationsEnabled).toBe(true)
    expect(imported.reminders).toHaveLength(2)
    expect(imported.reminders[0].id).toBe('rem-export-1')
    expect(imported.reminders[1].id).toBe('rem-export-2')
    expect(imported.completions).toHaveLength(1)
    expect(imported.completions[0].id).toBe('comp-export-1')
    expect(imported.completions[0].costSaved).toBe(0.384)
  })

  it('REJECTS: rejects empty or whitespace-only input', () => {
    const emptyResult = parseAndValidateImport('')
    expect(emptyResult.success).toBe(false)
    expect(emptyResult.error).toContain('empty')

    const whitespaceResult = parseAndValidateImport('   \n  \t  ')
    expect(whitespaceResult.success).toBe(false)
    expect(whitespaceResult.error).toContain('empty')
  })

  it('REJECTS: rejects non-JSON or malformed strings', () => {
    const badJson = parseAndValidateImport('{ bad json: true, ...')
    expect(badJson.success).toBe(false)
    expect(badJson.error).toContain('Invalid JSON')

    const plainText = parseAndValidateImport('hello world')
    expect(plainText.success).toBe(false)
  })

  it('REJECTS: rejects primitive JSON values like numbers, booleans, or null', () => {
    expect(parseAndValidateImport('123').success).toBe(false)
    expect(parseAndValidateImport('"some string"').success).toBe(false)
    expect(parseAndValidateImport('null').success).toBe(false)
    expect(parseAndValidateImport('true').success).toBe(false)
  })

  it('REJECTS: rejects JSON missing required top-level arrays or settings', () => {
    // Missing reminders
    expect(
      parseAndValidateImport(
        JSON.stringify({ completions: [], settings: { tariffPerKwh: 8 } })
      ).success
    ).toBe(false)

    // Missing completions
    expect(
      parseAndValidateImport(
        JSON.stringify({ reminders: [], settings: { tariffPerKwh: 8 } })
      ).success
    ).toBe(false)

    // Missing settings
    expect(
      parseAndValidateImport(JSON.stringify({ reminders: [], completions: [] }))
        .success
    ).toBe(false)
  })

  it('REJECTS: rejects invalid or negative tariff rates in settings', () => {
    // NaN tariff
    expect(
      parseAndValidateImport(
        JSON.stringify({
          reminders: [],
          completions: [],
          settings: { tariffPerKwh: 'invalid' },
        })
      ).success
    ).toBe(false)

    // Zero or negative tariff
    expect(
      parseAndValidateImport(
        JSON.stringify({
          reminders: [],
          completions: [],
          settings: { tariffPerKwh: 0 },
        })
      ).success
    ).toBe(false)

    expect(
      parseAndValidateImport(
        JSON.stringify({
          reminders: [],
          completions: [],
          settings: { tariffPerKwh: -5 },
        })
      ).success
    ).toBe(false)
  })

  it('REJECTS: rejects corrupted items within reminders or completions arrays', () => {
    // Reminders array with non-objects or missing required id/title
    expect(
      parseAndValidateImport(
        JSON.stringify({
          reminders: ['just-a-string-not-an-object'],
          completions: [],
          settings: { tariffPerKwh: 8 },
        })
      ).success
    ).toBe(false)

    expect(
      parseAndValidateImport(
        JSON.stringify({
          reminders: [{ id: 'rem-1' /* missing title */ }],
          completions: [],
          settings: { tariffPerKwh: 8 },
        })
      ).success
    ).toBe(false)

    // Completions array with missing id or date
    expect(
      parseAndValidateImport(
        JSON.stringify({
          reminders: [],
          completions: [{ reminderId: 'rem-1' /* missing id & date */ }],
          settings: { tariffPerKwh: 8 },
        })
      ).success
    ).toBe(false)
  })

  it('isValidState accurately validates compliant AppState and rejects non-compliant values', () => {
    expect(isValidState(sampleState)).toBe(true)
    expect(isValidState(null)).toBe(false)
    expect(isValidState(undefined)).toBe(false)
    expect(isValidState([])).toBe(false)
    expect(isValidState({})).toBe(false)
    expect(isValidState({ ...sampleState, reminders: 'not-an-array' })).toBe(false)
    expect(isValidState({ ...sampleState, completions: null })).toBe(false)
    expect(isValidState({ ...sampleState, settings: null })).toBe(false)
  })
})

describe('Currency Selector Migration, Persistence, and Validation', () => {
  beforeEach(() => {
    mockStore.clear()
    clearState()
  })

  it('sanitizeCurrency resolves valid currencies and falls back to ₹', () => {
    expect(sanitizeCurrency('₹')).toBe('₹')
    expect(sanitizeCurrency('$')).toBe('$')
    expect(sanitizeCurrency('€')).toBe('€')
    expect(sanitizeCurrency('£')).toBe('£')

    // Fallbacks
    expect(sanitizeCurrency(undefined)).toBe('₹')
    expect(sanitizeCurrency(null)).toBe('₹')
    expect(sanitizeCurrency('')).toBe('₹')
    expect(sanitizeCurrency('USD')).toBe('₹')
    expect(sanitizeCurrency(100)).toBe('₹')
  })

  it('loadState migrates legacy stored state missing settings.currency to default ₹', () => {
    // Simulate pre-existing state without currency field
    const legacyState = {
      reminders: [],
      completions: [],
      settings: {
        displayName: 'Campus Saver',
        tariffPerKwh: 8.5,
        notificationsEnabled: true,
      },
      lastUpdated: '2026-10-12T10:00:00.000Z',
    }

    mockStore.set(STORAGE_KEY, JSON.stringify(legacyState))

    const loaded = loadState()
    expect(loaded.settings.currency).toBe('₹')
    expect(loaded.settings.tariffPerKwh).toBe(8.5)
    expect(loaded.settings.displayName).toBe('Campus Saver')
  })

  it('saveState and loadState preserve selected custom currency', () => {
    const customState: AppState = {
      reminders: [],
      completions: [],
      settings: {
        displayName: 'European Traveler',
        tariffPerKwh: 0.35,
        currency: '€',
        notificationsEnabled: false,
      },
      lastUpdated: new Date().toISOString(),
    }

    saveState(customState)
    const reloaded = loadState()
    expect(reloaded.settings.currency).toBe('€')
    expect(reloaded.settings.tariffPerKwh).toBe(0.35)
  })

  it('Export and Import preserves non-default currency ($ and £)', () => {
    const dollarState: AppState = {
      reminders: [],
      completions: [],
      settings: {
        displayName: 'US Student',
        tariffPerKwh: 0.16,
        currency: '$',
        notificationsEnabled: true,
      },
      lastUpdated: new Date().toISOString(),
    }

    const payload = createExportPayload(dollarState)
    const result = parseAndValidateImport(payload)

    expect(result.success).toBe(true)
    if (result.success && result.data) {
      expect(result.data.settings.currency).toBe('$')
      expect(result.data.settings.tariffPerKwh).toBe(0.16)
    }
  })

  it('Import from legacy backup file without currency safely defaults to ₹', () => {
    const legacyExportJson = JSON.stringify({
      version: 2,
      exportedAt: new Date().toISOString(),
      reminders: [],
      completions: [],
      settings: {
        displayName: 'Legacy Backup',
        tariffPerKwh: 7.8,
        notificationsEnabled: true,
      },
    })

    const result = parseAndValidateImport(legacyExportJson)
    expect(result.success).toBe(true)
    if (result.success && result.data) {
      expect(result.data.settings.currency).toBe('₹')
    }
  })

  it('Import rejects backup file with invalid currency values', () => {
    const corruptedExportJson = JSON.stringify({
      version: 2,
      exportedAt: new Date().toISOString(),
      reminders: [],
      completions: [],
      settings: {
        displayName: 'Invalid Currency Backup',
        tariffPerKwh: 8,
        currency: 'INVALID_COIN',
        notificationsEnabled: true,
      },
    })

    const result = parseAndValidateImport(corruptedExportJson)
    expect(result.success).toBe(false)
  })

  it('Storage Safety: clean profile shows 0 starter reminders for hero card', () => {
    // When no state exists in localStorage
    const state = loadState()
    expect(state.reminders).toEqual([])
    expect(state.completions).toEqual([])
    expect(state.reminders.length === 0).toBe(true)
  })

  it('Storage Safety: legacy profile from before changes keeps all reminders and completions, migrates without errors, and suppresses hero card', () => {
    // Simulate pre-existing v1 data in PREVIOUS_STORAGE_KEY
    const legacyV1State = {
      reminders: [
        {
          id: 'legacy-rem-1',
          title: 'Switch off air conditioner',
          category: 'cooling',
          time: '23:00',
          recurrence: 'daily',
          applianceWatts: 1500,
          avoidedHours: 5,
          active: true,
          createdAt: '2026-09-01T12:00:00.000Z',
        },
        {
          id: 'legacy-rem-2',
          title: 'Unplug phone charger',
          category: 'chargers',
          time: '08:00',
          recurrence: 'daily',
          applianceWatts: 10,
          avoidedHours: 8,
          active: true,
          createdAt: '2026-09-02T12:00:00.000Z',
        },
      ],
      completions: [
        {
          id: 'legacy-comp-1',
          reminderId: 'legacy-rem-1',
          date: '2026-10-14',
          completedAt: '2026-10-14T23:01:00.000Z',
          kWh: 7.5,
          costSaved: 60,
          tariffAtTime: 8,
        },
      ],
      settings: {
        displayName: 'Alex',
        tariffPerKwh: 8,
        currency: '₹',
        notificationsEnabled: true,
      },
      lastUpdated: '2026-10-14T23:05:00.000Z',
    }

    localStorage.setItem(PREVIOUS_STORAGE_KEY, JSON.stringify(legacyV1State))

    // Call loadState() which should perform migration
    const loaded = loadState()

    // 1. Keeps ALL reminders and completions
    expect(loaded.reminders).toHaveLength(2)
    expect(loaded.reminders[0].title).toBe('Switch off air conditioner')
    expect(loaded.reminders[1].title).toBe('Unplug phone charger')
    expect(loaded.completions).toHaveLength(1)
    expect(loaded.completions[0].title).toBe('Switch off air conditioner')
    expect(loaded.completions[0].costSaved).toBe(60)

    // 2. Saved to v2 storage key
    const v2Raw = localStorage.getItem(STORAGE_KEY)
    expect(v2Raw).not.toBeNull()
    const parsedV2 = JSON.parse(v2Raw!)
    expect(parsedV2.reminders).toHaveLength(2)

    // 3. Suppresses hero card (reminders.length > 0)
    expect(loaded.reminders.length === 0).toBe(false)
  })
})

