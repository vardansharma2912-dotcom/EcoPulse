import type { AppState, Completion, Reminder, Settings } from '../types'
import { calculateKwh, calculateCost } from '../lib/energy'
import { getDefaultState } from '../lib/storage'
import { todayKey } from '../lib/dates'
import { generateSampleCompletions } from '../lib/sampleData'

export type AppAction =
  | { type: 'ADD_REMINDER'; payload: Omit<Reminder, 'id' | 'createdAt'> }
  | { type: 'EDIT_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: { id: string } }
  | { type: 'TOGGLE_ACTIVE'; payload: { id: string } }
  | { type: 'COMPLETE_REMINDER'; payload: { reminderId: string; date?: string; completedAt?: string } }
  | { type: 'UNDO_COMPLETION'; payload: { reminderId: string; date?: string } }
  | { type: 'SNOOZE_REMINDER'; payload: { id: string; minutes?: number; until?: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'LOAD_SAMPLE_DATA' }
  | { type: 'REMOVE_SAMPLE_DATA' }
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
        // History survives deleting a reminder: past completions and stats are strictly preserved
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
      const title = reminder?.title || 'Completed action'

      const newCompletion: Completion = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        reminderId: action.payload.reminderId,
        title,
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
      const snoozedUntil =
        action.payload.until ||
        new Date(Date.now() + (action.payload.minutes || 15) * 60000).toISOString()
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

    case 'LOAD_SAMPLE_DATA': {
      // Remove any existing demo entries first to avoid stacking duplicates
      const nonDemoCompletions = state.completions.filter((c) => !c.isDemo)
      const samples = generateSampleCompletions(
        state.reminders,
        new Date(),
        state.settings.tariffPerKwh
      )
      return {
        ...state,
        completions: [...samples, ...nonDemoCompletions],
      }
    }

    case 'REMOVE_SAMPLE_DATA': {
      return {
        ...state,
        completions: state.completions.filter((c) => !c.isDemo),
      }
    }

    case 'RESET_DATA': {
      return getDefaultState()
    }

    default:
      return state
  }
}
