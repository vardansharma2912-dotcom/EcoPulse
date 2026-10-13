import type { AppState, Completion, Reminder, Settings } from '../types'

export const STORAGE_KEY = 'ecopulse_app_state_v2'
export const PREVIOUS_STORAGE_KEY = 'ecopulse_app_state_v1'
export const ALERTED_KEYS_STORAGE_KEY = 'ecopulse_alerted_keys_v1'
export const WELCOME_FLAG_KEY = 'ecopulse_welcome_handled_v1'
export const TOUR_FLAG_KEY = 'ecopulse_tour_seen_v1'
export const LAST_VISIT_KEY = 'ecopulse_last_visit_v1'
export const CURRENT_VERSION = 2

export const DEFAULT_SETTINGS: Settings = {
  displayName: '', // Empty on first launch to trigger Welcome Screen
  tariffPerKwh: 8, // ₹8 per kWh (placeholder from typical domestic slab)
  notificationsEnabled: false,
}

export function isWelcomeHandled(): boolean {
  try {
    return localStorage.getItem(WELCOME_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}

export function setWelcomeHandled(handled = true): void {
  try {
    if (handled) {
      localStorage.setItem(WELCOME_FLAG_KEY, 'true')
    } else {
      localStorage.removeItem(WELCOME_FLAG_KEY)
    }
  } catch (err) {
    console.error('[EcoPulse] Failed to write welcome handled flag:', err)
  }
}

export function isTourSeen(): boolean {
  try {
    return localStorage.getItem(TOUR_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}

export function setTourSeen(seen = true): void {
  try {
    if (seen) {
      localStorage.setItem(TOUR_FLAG_KEY, 'true')
    } else {
      localStorage.removeItem(TOUR_FLAG_KEY)
    }
  } catch (err) {
    console.error('[EcoPulse] Failed to write tour seen flag:', err)
  }
}

export function getLastVisit(): string | null {
  try {
    return localStorage.getItem(LAST_VISIT_KEY)
  } catch {
    return null
  }
}

export function setLastVisit(isoString: string = new Date().toISOString()): void {
  try {
    localStorage.setItem(LAST_VISIT_KEY, isoString)
  } catch {
    // Ignore storage quota
  }
}

export function createInitialReminders(createdAt: string = new Date().toISOString()): Reminder[] {
  return [
    {
      id: 'rem-1',
      title: 'Turn off room lights before leaving',
      category: 'lighting',
      time: '09:00',
      recurrence: 'daily',
      applianceWatts: 40,
      avoidedHours: 3,
      active: true,
      createdAt,
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
      createdAt,
    },
    {
      id: 'rem-3',
      title: 'Unplug phone & device chargers from wall socket',
      category: 'chargers',
      time: '08:00',
      recurrence: 'daily',
      applianceWatts: 10,
      avoidedHours: 8,
      active: true,
      createdAt,
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
      createdAt,
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
      createdAt,
    },
    {
      id: 'rem-6',
      title: 'Check and turn off shared floor / lab corridor lights',
      category: 'shared',
      time: '21:30',
      recurrence: 'daily',
      applianceWatts: 60,
      avoidedHours: 5,
      active: true,
      createdAt,
    },
  ]
}

export const INITIAL_REMINDERS: Reminder[] = createInitialReminders()

export function getDefaultState(): AppState {
  const nowIso = new Date().toISOString()
  return {
    reminders: createInitialReminders(nowIso),
    completions: [], // Strictly no fake history
    settings: { ...DEFAULT_SETTINGS },
    lastUpdated: nowIso,
  }
}

/**
 * Validates parsed object to ensure it conforms to AppState shape.
 */
export function isValidState(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Partial<AppState>
  
  if (!Array.isArray(candidate.reminders)) return false
  if (!Array.isArray(candidate.completions)) return false
  if (!candidate.settings || typeof candidate.settings !== 'object') return false
  if (typeof candidate.settings.tariffPerKwh !== 'number' || isNaN(candidate.settings.tariffPerKwh) || candidate.settings.tariffPerKwh <= 0) {
    return false
  }

  // Validate reminders structure
  for (const r of candidate.reminders) {
    if (!r || typeof r !== 'object') return false
    const item = r as Partial<Reminder>
    if (typeof item.id !== 'string' || typeof item.title !== 'string') return false
  }

  // Validate completions structure
  for (const c of candidate.completions) {
    if (!c || typeof c !== 'object') return false
    const item = c as Partial<Completion>
    if (typeof item.id !== 'string' || typeof item.date !== 'string') return false
  }
  
  return true
}

/**
 * Creates a formatted JSON backup string of the application state.
 */
export function createExportPayload(state: AppState): string {
  const payload = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      displayName: state.settings.displayName ?? '',
      tariffPerKwh: state.settings.tariffPerKwh,
      notificationsEnabled: Boolean(state.settings.notificationsEnabled),
    },
    reminders: state.reminders,
    completions: state.completions,
  }
  return JSON.stringify(payload, null, 2)
}

export interface ImportResult {
  success: boolean
  data?: AppState
  error?: string
}

/**
 * Parses and validates an imported JSON string against the EcoPulse schema.
 */
export function parseAndValidateImport(jsonString: string): ImportResult {
  if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
    return { success: false, error: 'The selected file is empty.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { success: false, error: 'Invalid JSON file. Please ensure the file contains valid JSON.' }
  }

  if (!isValidState(parsed)) {
    return {
      success: false,
      error: 'Invalid backup file format. Missing or invalid reminders, completions, or tariff settings.',
    }
  }

  const migratedCompletions = migrateCompletions(parsed.completions, parsed.reminders)
  const normalizedState: AppState = {
    reminders: parsed.reminders,
    completions: migratedCompletions,
    settings: {
      displayName: typeof parsed.settings.displayName === 'string' ? parsed.settings.displayName : '',
      tariffPerKwh: parsed.settings.tariffPerKwh,
      notificationsEnabled: Boolean(parsed.settings.notificationsEnabled),
    },
    lastUpdated: new Date().toISOString(),
  }

  return {
    success: true,
    data: normalizedState,
  }
}

/**
 * Migrates completions from older formats (e.g. missing title).
 */
export function migrateCompletions(
  completions: Partial<Completion>[],
  reminders: Reminder[]
): Completion[] {
  const reminderMap = new Map<string, string>()
  for (const r of reminders) {
    reminderMap.set(r.id, r.title)
  }

  return completions.map((c) => {
    const title = c.title || (c.reminderId ? reminderMap.get(c.reminderId) : undefined) || 'Deleted reminder'
    return {
      id: c.id || `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reminderId: c.reminderId || 'unknown',
      title,
      date: c.date || new Date().toISOString().split('T')[0],
      completedAt: c.completedAt || new Date().toISOString(),
      kWh: typeof c.kWh === 'number' && !isNaN(c.kWh) ? c.kWh : 0,
      costSaved: typeof c.costSaved === 'number' && !isNaN(c.costSaved) ? c.costSaved : 0,
      tariffAtTime: typeof c.tariffAtTime === 'number' && !isNaN(c.tariffAtTime) ? c.tariffAtTime : 8,
      ...(c.isDemo ? { isDemo: true } : {}),
    }
  })
}

/**
 * Loads state from localStorage with version migration, error catching,
 * and graceful fallback to initial seeded state.
 */
export function loadState(): AppState {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    let isMigration = false

    // Check previous version if v2 is not yet initialized
    if (!raw) {
      const v1Raw = localStorage.getItem(PREVIOUS_STORAGE_KEY)
      if (v1Raw) {
        raw = v1Raw
        isMigration = true
      }
    }

    if (!raw) {
      const initial = getDefaultState()
      saveState(initial)
      return initial
    }

    const parsed = JSON.parse(raw)
    if (isValidState(parsed)) {
      // Ensure all completions have title snapshot
      const migratedCompletions = migrateCompletions(parsed.completions, parsed.reminders)
      const stateToUse: AppState = {
        ...parsed,
        completions: migratedCompletions,
      }

      if (isMigration) {
        saveState(stateToUse)
      }
      return stateToUse
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
    localStorage.removeItem(PREVIOUS_STORAGE_KEY)
    localStorage.removeItem(ALERTED_KEYS_STORAGE_KEY)
    localStorage.removeItem(WELCOME_FLAG_KEY)
    localStorage.removeItem(TOUR_FLAG_KEY)
    localStorage.removeItem(LAST_VISIT_KEY)
  } catch (err) {
    console.error('[EcoPulse] Failed to clear localStorage:', err)
  }
}
