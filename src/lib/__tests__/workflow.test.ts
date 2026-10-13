import { describe, it, expect, beforeEach } from 'vitest'
import { appReducer } from '../../state/reducer'
import { saveState, loadState, clearState, STORAGE_KEY } from '../storage'
import type { AppState, Reminder } from '../../types'
import { todayKey } from '../dates'

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

describe('Full End-to-End Reminders & Persistence Workflow', () => {
  let state: AppState

  beforeEach(() => {
    mockStore.clear()
    clearState()
    state = {
      reminders: [],
      completions: [],
      settings: { displayName: 'Student', tariffPerKwh: 8, notificationsEnabled: false },
      lastUpdated: new Date().toISOString(),
    }
  })

  it('executes complete lifecycle: Add -> Edit -> Complete -> Undo -> Snooze -> Delete (history stays) -> Persist', () => {
    const today = todayKey()

    // 1. ADD REMINDER
    const newReminderData: Omit<Reminder, 'id' | 'createdAt'> = {
      title: 'Study Room Desk Light',
      category: 'shared',
      time: '17:00',
      recurrence: 'daily',
      applianceWatts: 200,
      avoidedHours: 5,
      active: true,
    }
    state = appReducer(state, { type: 'ADD_REMINDER', payload: newReminderData })
    expect(state.reminders.length).toBe(1)
    const reminderId = state.reminders[0].id
    expect(state.reminders[0].title).toBe('Study Room Desk Light')

    // 2. EDIT REMINDER
    const updatedReminder = { ...state.reminders[0], title: 'Study Room Desk Light - Switched Off' }
    state = appReducer(state, { type: 'EDIT_REMINDER', payload: updatedReminder })
    expect(state.reminders[0].title).toBe('Study Room Desk Light - Switched Off')

    // 3. COMPLETE REMINDER (Records title snapshot, kWh, costSaved)
    state = appReducer(state, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId, date: today },
    })
    expect(state.completions.length).toBe(1)
    expect(state.completions[0].reminderId).toBe(reminderId)
    expect(state.completions[0].title).toBe('Study Room Desk Light - Switched Off')
    // 200W * 5h / 1000 = 1.0 kWh
    expect(state.completions[0].kWh).toBe(1.0)
    // 1.0 * 8 = ₹8.0
    expect(state.completions[0].costSaved).toBe(8.0)

    // Deduplication rule check
    const dupState = appReducer(state, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId, date: today },
    })
    expect(dupState.completions.length).toBe(1)

    // 4. UNDO COMPLETION
    state = appReducer(state, {
      type: 'UNDO_COMPLETION',
      payload: { reminderId, date: today },
    })
    expect(state.completions.length).toBe(0)

    // Re-complete for history test
    state = appReducer(state, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId, date: today },
    })
    expect(state.completions.length).toBe(1)

    // 5. SNOOZE REMINDER
    state = appReducer(state, {
      type: 'SNOOZE_REMINDER',
      payload: { id: reminderId, minutes: 15 },
    })
    expect(state.reminders[0].snoozedUntil).toBeDefined()

    // 6. DELETE REMINDER (History must survive!)
    state = appReducer(state, {
      type: 'DELETE_REMINDER',
      payload: { id: reminderId },
    })
    expect(state.reminders.length).toBe(0)
    // Completion history is preserved!
    expect(state.completions.length).toBe(1)
    expect(state.completions[0].title).toBe('Study Room Desk Light - Switched Off')
    expect(state.completions[0].kWh).toBe(1.0)

    // 7. PERSISTENCE IN LOCALSTORAGE
    saveState(state)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeDefined()
    expect(raw).toContain('Study Room Desk Light - Switched Off')

    // Reload from storage
    const reloaded = loadState()
    expect(reloaded.reminders.length).toBe(0)
    expect(reloaded.completions.length).toBe(1)
    expect(reloaded.completions[0].title).toBe('Study Room Desk Light - Switched Off')
  })
})
