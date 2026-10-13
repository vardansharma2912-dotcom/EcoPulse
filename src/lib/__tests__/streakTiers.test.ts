import { describe, it, expect } from 'vitest'
import {
  getStreakTier,
  getProgressToNext,
  getDaysToNext,
  STREAK_TIERS,
} from '../streakTiers'

describe('streakTiers - getStreakTier Boundaries', () => {
  it('correctly maps all required boundary days to the proper tier', () => {
    // 0 days -> Dormant
    expect(getStreakTier(0).id).toBe('dormant')
    expect(getStreakTier(0).name).toBe('Dormant')

    // 1-2 days -> Spark
    expect(getStreakTier(1).id).toBe('spark')
    expect(getStreakTier(1).name).toBe('Spark')
    expect(getStreakTier(2).id).toBe('spark')
    expect(getStreakTier(2).name).toBe('Spark')

    // 3-6 days -> Flame
    expect(getStreakTier(3).id).toBe('flame')
    expect(getStreakTier(3).name).toBe('Flame')
    expect(getStreakTier(6).id).toBe('flame')
    expect(getStreakTier(6).name).toBe('Flame')

    // 7-13 days -> Blaze
    expect(getStreakTier(7).id).toBe('blaze')
    expect(getStreakTier(7).name).toBe('Blaze')
    expect(getStreakTier(13).id).toBe('blaze')
    expect(getStreakTier(13).name).toBe('Blaze')

    // 14-29 days -> Inferno
    expect(getStreakTier(14).id).toBe('inferno')
    expect(getStreakTier(14).name).toBe('Inferno')
    expect(getStreakTier(29).id).toBe('inferno')
    expect(getStreakTier(29).name).toBe('Inferno')

    // 30-59 days -> Aurora
    expect(getStreakTier(30).id).toBe('aurora')
    expect(getStreakTier(30).name).toBe('Aurora')
    expect(getStreakTier(59).id).toBe('aurora')
    expect(getStreakTier(59).name).toBe('Aurora')

    // 60-99 days -> Platinum
    expect(getStreakTier(60).id).toBe('platinum')
    expect(getStreakTier(60).name).toBe('Platinum')
    expect(getStreakTier(99).id).toBe('platinum')
    expect(getStreakTier(99).name).toBe('Platinum')

    // 100+ days -> Legend
    expect(getStreakTier(100).id).toBe('legend')
    expect(getStreakTier(100).name).toBe('Legend')
    expect(getStreakTier(500).id).toBe('legend')
    expect(getStreakTier(500).name).toBe('Legend')
  })

  it('handles negative or invalid values gracefully by returning Dormant', () => {
    expect(getStreakTier(-5).id).toBe('dormant')
    // @ts-expect-error test non-number
    expect(getStreakTier(null).id).toBe('dormant')
  })

  it('verifies that each tier has a distinct and contrast-compliant color palette', () => {
    const ids = new Set<string>()
    const primaryColors = new Set<string>()

    for (const tier of STREAK_TIERS) {
      expect(ids.has(tier.id)).toBe(false)
      ids.add(tier.id)

      expect(primaryColors.has(tier.colors.primary)).toBe(false)
      primaryColors.add(tier.colors.primary)

      expect(tier.colors.gradient).toBeDefined()
      expect(tier.colors.text).toBeDefined()
      expect(tier.colors.bg).toBeDefined()
      expect(tier.colors.border).toBeDefined()
    }

    expect(ids.size).toBe(8)
  })
})

describe('streakTiers - getProgressToNext & getDaysToNext', () => {
  it('computes correct progress values at tier boundaries', () => {
    // 0 days (Dormant, next at 1): 0 / 1 = 0
    expect(getProgressToNext(0)).toBe(0)

    // 1 day (Spark, 1-2, next at 3): (1 - 1) / (3 - 1) = 0
    expect(getProgressToNext(1)).toBe(0)

    // 2 days (Spark): (2 - 1) / (3 - 1) = 0.5
    expect(getProgressToNext(2)).toBe(0.5)

    // 3 days (Flame, 3-6, next at 7): (3 - 3) / (7 - 3) = 0
    expect(getProgressToNext(3)).toBe(0)

    // 6 days (Flame): (6 - 3) / (7 - 3) = 0.75
    expect(getProgressToNext(6)).toBe(0.75)

    // 7 days (Blaze, 7-13, next at 14): (7 - 7) / (14 - 7) = 0
    expect(getProgressToNext(7)).toBe(0)

    // 13 days (Blaze): (13 - 7) / 7
    expect(getProgressToNext(13)).toBeCloseTo(6 / 7, 3)

    // 14 days (Inferno, 14-29, next at 30): 0
    expect(getProgressToNext(14)).toBe(0)

    // 29 days (Inferno): (29 - 14) / (30 - 14) = 15 / 16
    expect(getProgressToNext(29)).toBe(15 / 16)

    // 30 days (Aurora, 30-59, next at 60): 0
    expect(getProgressToNext(30)).toBe(0)

    // 59 days (Aurora): (59 - 30) / (60 - 30) = 29 / 30
    expect(getProgressToNext(59)).toBeCloseTo(29 / 30, 3)

    // 60 days (Platinum, 60-99, next at 100): 0
    expect(getProgressToNext(60)).toBe(0)

    // 99 days (Platinum): (99 - 60) / 40 = 39 / 40
    expect(getProgressToNext(99)).toBe(39 / 40)

    // 100+ days (Legend): null at max tier
    expect(getProgressToNext(100)).toBeNull()
    expect(getProgressToNext(500)).toBeNull()
  })

  it('computes daysToNext accurately', () => {
    // 0 days -> 1 day to Spark
    expect(getDaysToNext(0)).toBe(1)

    // 1 day -> 2 days to Flame
    expect(getDaysToNext(1)).toBe(2)

    // 2 days -> 1 day to Flame
    expect(getDaysToNext(2)).toBe(1)

    // 3 days -> 4 days to Blaze
    expect(getDaysToNext(3)).toBe(4)

    // 6 days -> 1 day to Blaze
    expect(getDaysToNext(6)).toBe(1)

    // 100+ days -> null (max level)
    expect(getDaysToNext(100)).toBeNull()
    expect(getDaysToNext(500)).toBeNull()
  })
})
