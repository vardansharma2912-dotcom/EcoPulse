import { useEffect, useRef } from 'react'
import { useAppState } from '../state'
import { useToast } from '../context/useToast'
import { computeStreaksFromCompletions } from './analytics'
import { getStreakTier, STREAK_TIERS } from './streakTiers'
import { STREAK_LAST_NOTIFIED_TIER_KEY } from './storage'

/**
 * Hook to notify the user ONCE when their achieved streak level increases.
 * - Stored in localStorage so it persists across sessions and tabs.
 * - Does NOT trigger on first mount/page load or when opening the Analytics page.
 * - Only triggers when an action genuinely increases the user's actual streak tier.
 */
export function useStreakLevelUp() {
  const { state } = useAppState()
  const { showToast } = useToast()
  const isInitialMountRef = useRef(true)

  useEffect(() => {
    if (typeof localStorage === 'undefined') return

    // Compute the user's actual current streak tier from their real completions
    const currentStreak = computeStreaksFromCompletions(state.completions, new Date()).currentStreak
    const currentTier = getStreakTier(currentStreak)

    try {
      const storedTierId = localStorage.getItem(STREAK_LAST_NOTIFIED_TIER_KEY)

      // On initial app mount:
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false
        // If never stored before, initialize to current tier so we don't spam on launch
        if (!storedTierId) {
          localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, currentTier.id)
        }
        return
      }

      // If stored tier differs from current:
      if (storedTierId !== currentTier.id) {
        const prevTier = STREAK_TIERS.find((t) => t.id === storedTierId)
        const prevIntensity = prevTier ? prevTier.intensity : 0

        // Only fire if the tier genuinely upgraded (higher intensity)
        if (currentTier.intensity > prevIntensity) {
          localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, currentTier.id)
          showToast(`Streak level up: ${currentTier.name}! 🔥`)
        } else {
          // If streak decreased or reset, sync the stored tier without toast
          localStorage.setItem(STREAK_LAST_NOTIFIED_TIER_KEY, currentTier.id)
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [state.completions, showToast])
}
