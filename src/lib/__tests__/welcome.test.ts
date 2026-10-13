import { describe, it, expect, beforeEach } from 'vitest'
import {
  isWelcomeHandled,
  setWelcomeHandled,
  clearState,
  WELCOME_FLAG_KEY,
  DEFAULT_SETTINGS,
} from '../storage'
import { appReducer } from '../../state/reducer'
import type { AppState } from '../../types'

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

describe('Welcome Screen Flag & Reset Behavior (Not Login)', () => {
  beforeEach(() => {
    mockStore.clear()
    clearState()
  })

  it('first-launch: isWelcomeHandled is false initially and default displayName is empty', () => {
    expect(isWelcomeHandled()).toBe(false)
    expect(DEFAULT_SETTINGS.displayName).toBe('')
    expect(localStorage.getItem(WELCOME_FLAG_KEY)).toBeNull()
  })

  it('marks welcome screen as handled and persists the flag in localStorage', () => {
    setWelcomeHandled(true)
    expect(isWelcomeHandled()).toBe(true)
    expect(localStorage.getItem(WELCOME_FLAG_KEY)).toBe('true')
  })

  it('resetting state or calling clearState removes the welcome flag so welcome screen is shown again', () => {
    // 1. Mark welcome handled
    setWelcomeHandled(true)
    expect(isWelcomeHandled()).toBe(true)

    // 2. Clear state
    clearState()
    expect(isWelcomeHandled()).toBe(false)
    expect(localStorage.getItem(WELCOME_FLAG_KEY)).toBeNull()
  })

  it('appReducer RESET_DATA restores default state with empty displayName', () => {
    const activeState: AppState = {
      reminders: [],
      completions: [],
      settings: {
        displayName: 'Sam',
        tariffPerKwh: 10,
        currency: '₹',
        notificationsEnabled: true,
      },
      lastUpdated: new Date().toISOString(),
    }

    const resetState = appReducer(activeState, { type: 'RESET_DATA' })
    expect(resetState.settings.displayName).toBe('')
    expect(resetState.settings.tariffPerKwh).toBe(8)
  })

  it('verifies welcome page display predicate: first launch shows it, handled hides it, reset displays it again', () => {
    // Helper mimicking AppLayout's welcome predicate
    const shouldShow = (dismissed: boolean, handled: boolean, displayName: string) =>
      !dismissed && !handled && !displayName

    // 1. Initial first-launch state
    expect(isWelcomeHandled()).toBe(false)
    expect(shouldShow(false, isWelcomeHandled(), '')).toBe(true)

    // 2. User clicks continue with name
    setWelcomeHandled(true)
    expect(shouldShow(false, isWelcomeHandled(), 'Vardaan')).toBe(false)

    // 3. User skips without name (stores empty string)
    expect(shouldShow(false, isWelcomeHandled(), '')).toBe(false)

    // 4. Reset all data restores the initial first-launch state
    clearState()
    expect(isWelcomeHandled()).toBe(false)
    expect(shouldShow(false, isWelcomeHandled(), '')).toBe(true)
  })
})
