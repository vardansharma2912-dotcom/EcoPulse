import type { AppState, Completion, Reminder, Settings } from '../types'
import { calculateKwh, calculateCost } from '../lib/energy'
import { getDefaultState } from '../lib/storage'
import { todayKey } from '../lib/dates'

export type AppAction =
  | { type: 'ADD_REMINDER'; payload: Omit<Reminder, 'id' | 'createdAt'> }
  | { type: 'EDIT_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: { id: string } }
  | { type: 'TOGGLE_ACTIVE'; payload: { id: string } }
  | { type: 'COMPLETE_REMINDER'; payload: { reminderId: string; date?: string; completedAt?: string } }
  | { type: 'UNDO_COMPLETION'; payload: { reminderId: string; date?: string } }
  | { type: 'SNOOZE_REMINDER'; payload: { id: string; minutes: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'RESET_DATA' }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_REMINDER': {
      const newReminder: Reminder = {
        ...action.payload,
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        reminders: [newReminder, ...state.reminders],
      }
    }

    case 'EDIT_REMINDER': {
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      }
    }

    case 'DELETE_REMINDER': {
      return {
        ...state,
        reminders: state.reminders.filter((r) => r.id !== action.payload.id),
        // Also remove associated completions for integrity
        completions: state.completions.filter((c) => c.reminderId !== action.payload.id),
      }
    }

    case 'TOGGLE_ACTIVE': {
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? { ...r, active: !r.active } : r
        ),
      }
    }

    case 'COMPLETE_REMINDER': {
      const targetDate = action.payload.date || todayKey()
      const existing = state.completions.find(
        (c) => c.reminderId === action.payload.reminderId && c.date === targetDate
      )

      // Deduplication rule: If already completed on this date, do NOT double-count
      if (existing) {
        return state
      }

      const reminder = state.reminders.find((r) => r.id === action.payload.reminderId)
      const watts = reminder?.applianceWatts ?? 0
      const hours = reminder?.avoidedHours ?? 0
      const tariff = state.settings.tariffPerKwh
      const kwh = calculateKwh(watts, hours)
      const costSaved = calculateCost(kwh, tariff)

      const newCompletion: Completion = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        reminderId: action.payload.reminderId,
        date: targetDate,
        completedAt: action.payload.completedAt || new Date().toISOString(),
        kWh: kwh,
        costSaved,
        tariffAtTime: tariff,
      }

      return {
        ...state,
        completions: [newCompletion, ...state.completions],
      }
    }

    case 'UNDO_COMPLETION': {
      const targetDate = action.payload.date || todayKey()
      return {
        ...state,
        completions: state.completions.filter(
          (c) => !(c.reminderId === action.payload.reminderId && c.date === targetDate)
        ),
      }
    }

    case 'SNOOZE_REMINDER': {
      const snoozedUntil = new Date(Date.now() + action.payload.minutes * 60000).toISOString()
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? { ...r, snoozedUntil } : r
        ),
      }
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      }
    }

    case 'RESET_DATA': {
      return getDefaultState()
    }

    default:
      return state
  }
}
