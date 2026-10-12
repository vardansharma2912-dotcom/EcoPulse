import { describe, it, expect, beforeEach } from 'vitest'
import {
  isWelcomeHandled,
  setWelcomeHandled,
  isTourSeen,
  setTourSeen,
  clearState,
  loadState,
  saveState,
  getDefaultState,
  DEFAULT_SETTINGS,
  WELCOME_FLAG_KEY,
  TOUR_FLAG_KEY,
} from '../storage'

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

describe('Tour and Welcome Flow Flags', () => {
  beforeEach(() => {
    mockStore.clear()
    clearState()
    DEFAULT_SETTINGS.displayName = ''
  })

  it('first launch: neither welcome nor tour is handled', () => {
    expect(isWelcomeHandled()).toBe(false)
    expect(isTourSeen()).toBe(false)

    const defaultState = getDefaultState()
    expect(defaultState.settings.displayName).toBe('')
  })

  it('first launch progression: welcome handled then tour shown', () => {
    // 1. Initial first launch
    expect(isWelcomeHandled()).toBe(false)
    expect(isTourSeen()).toBe(false)

    // 2. User completes Welcome (enters name)
    const state = getDefaultState()
    state.settings.displayName = 'Vardaan'
    saveState(state)
    setWelcomeHandled(true)

    expect(isWelcomeHandled()).toBe(true)
    // Tour is still not seen yet -> TourDialog opens
    expect(isTourSeen()).toBe(false)

    // 3. User finishes Tour
    setTourSeen(true)
    expect(isTourSeen()).toBe(true)

    // Both flags are now marked handled
    expect(isWelcomeHandled()).toBe(true)
    expect(isTourSeen()).toBe(true)
  })

  it('skip name still shows the tour', () => {
    // User clicks "Skip for now" on welcome screen
    setWelcomeHandled(true)

    // Welcome is dismissed/handled
    expect(isWelcomeHandled()).toBe(true)
    // Display name remains blank
    const state = getDefaultState()
    expect(state.settings.displayName).toBe('')

    // Tour is NOT yet seen -> tour must still be shown
    expect(isTourSeen()).toBe(false)

    // Completing the tour sets tourSeen
    setTourSeen(true)
    expect(isTourSeen()).toBe(true)
  })

  it('reset restarts both welcome and tour', () => {
    // Setup completed state
    const state = getDefaultState()
    state.settings.displayName = 'Aarav'
    saveState(state)
    setWelcomeHandled(true)
    setTourSeen(true)

    expect(isWelcomeHandled()).toBe(true)
    expect(isTourSeen()).toBe(true)

    // Reset all data
    clearState()

    // Both flags are cleared back to fresh first-launch state
    expect(isWelcomeHandled()).toBe(false)
    expect(isTourSeen()).toBe(false)
    expect(localStorage.getItem(WELCOME_FLAG_KEY)).toBeNull()
    expect(localStorage.getItem(TOUR_FLAG_KEY)).toBeNull()
  })

  it('replay tour does not change user data or stored settings', () => {
    const state = getDefaultState()
    state.settings.displayName = 'Priya'
    state.settings.tariffPerKwh = 9.5
    saveState(state)
    setWelcomeHandled(true)
    setTourSeen(true)

    const stateBefore = loadState()

    // Simulating replay: tour opens and closes without altering state
    setTourSeen(true)

    const stateAfter = loadState()
    expect(stateAfter.settings.displayName).toBe('Priya')
    expect(stateAfter.settings.tariffPerKwh).toBe(9.5)
    expect(stateAfter.reminders.length).toBe(stateBefore.reminders.length)
  })
})
