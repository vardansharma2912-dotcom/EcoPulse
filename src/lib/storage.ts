import type { AppState, Reminder, Settings } from '../types'

export const STORAGE_KEY = 'ecopulse_app_state_v1'
export const CURRENT_VERSION = 1

export const DEFAULT_SETTINGS: Settings = {
  displayName: 'College Student',
  tariffPerKwh: 8, // ₹8 per kWh (placeholder from typical domestic slab)
  notificationsEnabled: false,
}

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Turn off room lights before leaving',
    category: 'lighting',
    time: '09:00',
    recurrence: 'daily',
    applianceWatts: 40,
    avoidedHours: 3,
    active: true,
    createdAt: '2026-10-11T00:00:00.000Z',
  },
  {
    id: 'rem-2',
    title: 'Switch off ceiling fan when room is unoccupied',
    category: 'cooling',
    time: '10:00',
    recurrence: 'daily',
    applianceWatts: 75,
    avoidedHours: 4,
    active: true,
    createdAt: '2026-10-11T00:00:00.000Z',
  },
  {
    id: 'rem-3',
    title: 'Unplug phone & device chargers from wall socket',
    category: 'standby',
    time: '08:00',
    recurrence: 'daily',
    applianceWatts: 10,
    avoidedHours: 8,
    active: true,
    createdAt: '2026-10-11T00:00:00.000Z',
  },
  {
    id: 'rem-4',
    title: 'Put laptop on power-saving / sleep mode during lunch',
    category: 'computing',
    time: '13:00',
    recurrence: 'weekdays',
    applianceWatts: 65,
    avoidedHours: 2,
    active: true,
    createdAt: '2026-10-11T00:00:00.000Z',
  },
  {
    id: 'rem-5',
    title: 'Switch off monitor & desk setup power strip at night',
    category: 'standby',
    time: '23:00',
    recurrence: 'daily',
    applianceWatts: 45,
    avoidedHours: 7,
    active: true,
    createdAt: '2026-10-11T00:00:00.000Z',
  },
  {
    id: 'rem-6',
    title: 'Check and turn off shared floor / lab corridor lights',
    category: 'lighting',
    time: '21:30',
    recurrence: 'daily',
    applianceWatts: 60,
    avoidedHours: 5,
    active: true,
    createdAt: '2026-10-11T00:00:00.000Z',
  },
]

export function getDefaultState(): AppState {
  return {
    reminders: INITIAL_REMINDERS,
    completions: [], // Strictly no fake history
    settings: DEFAULT_SETTINGS,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Validates parsed object to ensure it conforms to AppState shape.
 */
function isValidState(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Partial<AppState>
  
  if (!Array.isArray(candidate.reminders)) return false
  if (!Array.isArray(candidate.completions)) return false
  if (!candidate.settings || typeof candidate.settings !== 'object') return false
  if (typeof candidate.settings.tariffPerKwh !== 'number' || isNaN(candidate.settings.tariffPerKwh)) return false
  
  return true
}

/**
 * Loads state from localStorage with version validation, error catching,
 * and graceful fallback to initial seeded state.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = getDefaultState()
      saveState(initial)
      return initial
    }

    const parsed = JSON.parse(raw)
    if (isValidState(parsed)) {
      return parsed
    } else {
      console.warn('[EcoPulse] Stored data invalid. Falling back to default state.')
      const fallback = getDefaultState()
      saveState(fallback)
      return fallback
    }
  } catch (err) {
    console.error('[EcoPulse] Failed to read from localStorage:', err)
    return getDefaultState()
  }
}

/**
 * Saves state to localStorage safely.
 */
export function saveState(state: AppState): boolean {
  try {
    const dataToSave: AppState = {
      ...state,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    return true
  } catch (err) {
    console.error('[EcoPulse] Failed to write to localStorage:', err)
    return false
  }
}

/**
 * Clears stored EcoPulse state.
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('[EcoPulse] Failed to clear localStorage:', err)
  }
}
