import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { STREAK_LAST_NOTIFIED_TIER_KEY } from '../storage'
import { getStreakTier, STREAK_TIERS } from '../streakTiers'

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

/**
 * Pure helper mirroring the core level-up notification logic in useStreakLevelUp
 */
function checkStreakLevelUp(
  currentDays: number,
  isInitialMount: boolean,
  showToast: (msg: string) => void
): boolean {
  const currentTier = getStreakTier(currentDays)
  const storedTierId = localStorage.getItem(STREAK_LAST_NOTIFIED_TIER_KEY)

  if (isInitialMount) {
    if (!storedTierId) {
      localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, currentTier.id)
    }
    return false
  }

  if (storedTierId !== currentTier.id) {
    const prevTier = STREAK_TIERS.find((t) => t.id === storedTierId)
    const prevIntensity = prevTier ? prevTier.intensity : 0

    if (currentTier.intensity > prevIntensity) {
      localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, currentTier.id)
      showToast(`Streak level up: ${currentTier.name}! 🔥`)
      return true
    } else {
      localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, currentTier.id)
      return false
    }
  }

  return false
}

describe('Streak Level Up Notification Logic', () => {
  beforeEach(() => {
    mockStore.clear()
    localStorage.clear()
  })

  afterEach(() => {
    mockStore.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('does NOT trigger toast on initial mount even with pre-existing high streak', () => {
    const showToast = vi.fn()
    // User already has 65 days (Platinum level)
    const triggered = checkStreakLevelUp(65, true, showToast)
    expect(triggered).toBe(false)
    expect(showToast).not.toHaveBeenCalled()
    expect(localStorage.getItem(STREAK_LAST_NOTIFIED_TIER_KEY)).toBe('platinum')
  })

  it('does NOT trigger toast when user visits Analytics page with same streak', () => {
    const showToast = vi.fn()
    localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, 'platinum')

    const triggered = checkStreakLevelUp(65, false, showToast)
    expect(triggered).toBe(false)
    expect(showToast).not.toHaveBeenCalled()
  })

  it('triggers toast ONCE when streak increases to a new tier', () => {
    const showToast = vi.fn()
    // Stored at Spark (1-2 days)
    localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, 'spark')

    // Day increases to 3 days (Flame)
    const triggered = checkStreakLevelUp(3, false, showToast)
    expect(triggered).toBe(true)
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(showToast).toHaveBeenCalledWith('Streak level up: Flame! 🔥')
    expect(localStorage.getItem(STREAK_LAST_NOTIFIED_TIER_KEY)).toBe('flame')

    // Repeating check at 3 days does NOT trigger again
    const repeated = checkStreakLevelUp(3, false, showToast)
    expect(repeated).toBe(false)
    expect(showToast).toHaveBeenCalledTimes(1)
  })

  it('does NOT trigger toast if streak resets to lower tier or zero', () => {
    const showToast = vi.fn()
    localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, 'flame')

    // Streak broken -> 0 days (Dormant)
    const triggered = checkStreakLevelUp(0, false, showToast)
    expect(triggered).toBe(false)
    expect(showToast).not.toHaveBeenCalled()
    expect(localStorage.getItem(STREAK_LAST_NOTIFIED_TIER_KEY)).toBe('dormant')
  })
})
