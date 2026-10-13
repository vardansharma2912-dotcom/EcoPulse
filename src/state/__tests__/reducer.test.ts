import { describe, it, expect } from 'vitest'
import { appReducer } from '../reducer'
import type { AppState, Reminder } from '../../types'

const mockInitialState: AppState = {
  reminders: [
    {
      id: 'test-rem-1',
      title: 'Turn off lights',
      category: 'lighting',
      time: '09:00',
      recurrence: 'daily',
      applianceWatts: 40,
      avoidedHours: 2,
      active: true,
      createdAt: '2026-10-11T00:00:00.000Z',
    },
    {
      id: 'test-rem-2',
      title: 'Turn off fan',
      category: 'cooling',
      time: '10:00',
      recurrence: 'daily',
      applianceWatts: 75,
      avoidedHours: 3,
      active: true,
      createdAt: '2026-10-11T00:00:00.000Z',
    },
  ],
  completions: [],
  settings: {
    displayName: 'Student',
    tariffPerKwh: 8,
    currency: '₹',
    notificationsEnabled: false,
  },
  lastUpdated: '2026-10-11T00:00:00.000Z',
}

describe('reducer.ts - Completion Deduplication and Undo', () => {
  it('adds a completion with snapshot title when completed for the first time today', () => {
    const nextState = appReducer(mockInitialState, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })

    expect(nextState.completions.length).toBe(1)
    const comp = nextState.completions[0]
    expect(comp.reminderId).toBe('test-rem-1')
    expect(comp.title).toBe('Turn off lights') // Snapshot title
    expect(comp.date).toBe('2026-10-11')
    // 40W * 2 hours / 1000 = 0.08 kWh
    expect(comp.kWh).toBe(0.08)
    // 0.08 * 8 = ₹0.64
    expect(comp.costSaved).toBe(0.64)
  })

  it('DEDUPLICATION: rejects duplicate completion on the exact same reminder and date', () => {
    // Complete once
    const stateWithOne = appReducer(mockInitialState, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })
    expect(stateWithOne.completions.length).toBe(1)

    // Complete second time on the same date
    const stateDuplicate = appReducer(stateWithOne, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })

    // Deduplication rule: Must stay 1, cannot double count
    expect(stateDuplicate.completions.length).toBe(1)
    expect(stateDuplicate).toBe(stateWithOne) // Returns unchanged reference
  })

  it('allows completion of a DIFFERENT reminder on the same date', () => {
    const stateWithOne = appReducer(mockInitialState, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })

    const stateWithTwo = appReducer(stateWithOne, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-2', date: '2026-10-11' },
    })

    expect(stateWithTwo.completions.length).toBe(2)
  })

  it('allows completion of the SAME reminder on a DIFFERENT date', () => {
    const stateDay1 = appReducer(mockInitialState, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })

    const stateDay2 = appReducer(stateDay1, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-12' },
    })

    expect(stateDay2.completions.length).toBe(2)
  })

  it('UNDO: removes a completion for a reminder and date', () => {
    const completedState = appReducer(mockInitialState, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })
    expect(completedState.completions.length).toBe(1)

    const undoneState = appReducer(completedState, {
      type: 'UNDO_COMPLETION',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })

    expect(undoneState.completions.length).toBe(0)
  })

  it('DELETE KEEPS HISTORY: deleting a reminder removes reminder but retains completion history', () => {
    // 1. Complete test-rem-1
    const completedState = appReducer(mockInitialState, {
      type: 'COMPLETE_REMINDER',
      payload: { reminderId: 'test-rem-1', date: '2026-10-11' },
    })
    expect(completedState.completions.length).toBe(1)
    expect(completedState.completions[0].title).toBe('Turn off lights')

    // 2. Delete test-rem-1
    const afterDeleteState = appReducer(completedState, {
      type: 'DELETE_REMINDER',
      payload: { id: 'test-rem-1' },
    })

    // Reminder was deleted from reminders list
    expect(afterDeleteState.reminders.some((r) => r.id === 'test-rem-1')).toBe(false)
    expect(afterDeleteState.reminders.length).toBe(1)

    // Completions and history are PRESERVED with their snapshot title!
    expect(afterDeleteState.completions.length).toBe(1)
    expect(afterDeleteState.completions[0].reminderId).toBe('test-rem-1')
    expect(afterDeleteState.completions[0].title).toBe('Turn off lights')
    expect(afterDeleteState.completions[0].kWh).toBe(0.08)
    expect(afterDeleteState.completions[0].costSaved).toBe(0.64)
  })

  it('handles add, edit, and delete reminder', () => {
    const newRem: Omit<Reminder, 'id' | 'createdAt'> = {
      title: 'Charger unplug',
      category: 'standby',
      time: '12:00',
      recurrence: 'daily',
      active: true,
      applianceWatts: 15,
      avoidedHours: 5,
    }

    const addedState = appReducer(mockInitialState, {
      type: 'ADD_REMINDER',
      payload: newRem,
    })
    expect(addedState.reminders.length).toBe(3)
    const addedId = addedState.reminders[0].id

    // Edit
    const editedState = appReducer(addedState, {
      type: 'EDIT_REMINDER',
      payload: { ...addedState.reminders[0], title: 'Charger unplug updated' },
    })
    expect(editedState.reminders[0].title).toBe('Charger unplug updated')

    // Delete
    const deletedState = appReducer(editedState, {
      type: 'DELETE_REMINDER',
      payload: { id: addedId },
    })
    expect(deletedState.reminders.length).toBe(2)
  })

  it('REPLACE_STATE overrides state with imported state and sets current lastUpdated', () => {
    const importedState: AppState = {
      reminders: [
        {
          id: 'imported-1',
          title: 'Imported Action',
          category: 'cooling',
          time: '14:00',
          recurrence: 'daily',
          active: true,
          createdAt: '2026-10-01T00:00:00.000Z',
        },
      ],
      completions: [
        {
          id: 'comp-imported-1',
          reminderId: 'imported-1',
          title: 'Imported Action',
          date: '2026-10-12',
          completedAt: '2026-10-12T14:05:00.000Z',
          kWh: 0.1,
          costSaved: 0.8,
          tariffAtTime: 8,
        },
      ],
      settings: {
        displayName: 'Imported User',
        tariffPerKwh: 12,
        currency: '₹',
        notificationsEnabled: true,
      },
      lastUpdated: '2026-10-01T00:00:00.000Z',
    }

    const nextState = appReducer(mockInitialState, {
      type: 'REPLACE_STATE',
      payload: importedState,
    })

    expect(nextState.settings.displayName).toBe('Imported User')
    expect(nextState.settings.tariffPerKwh).toBe(12)
    expect(nextState.reminders).toHaveLength(1)
    expect(nextState.reminders[0].title).toBe('Imported Action')
    expect(nextState.completions).toHaveLength(1)
    expect(new Date(nextState.lastUpdated).getTime()).toBeGreaterThan(
      new Date('2026-10-01').getTime()
    )
  })
})
