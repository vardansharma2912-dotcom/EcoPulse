import { describe, it, expect, beforeEach } from 'vitest'
import {
  getGreeting,
  getTimeOfDayBucket,
  sanitizeGreetingName,
  getContextSubline,
  type GreetingContext,
} from '../greetings'

describe('greetings.ts - Personalized Energy Greeting Engine', () => {
  beforeEach(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }
  })

  describe('Time of Day Buckets', () => {
    it('classifies morning between 05:00 and 11:59', () => {
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 5, 0))).toBe('morning')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 8, 30))).toBe('morning')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 11, 59))).toBe('morning')
    })

    it('classifies afternoon between 12:00 and 16:59', () => {
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 12, 0))).toBe('afternoon')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 14, 15))).toBe('afternoon')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 16, 59))).toBe('afternoon')
    })

    it('classifies evening between 17:00 and 21:59', () => {
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 17, 0))).toBe('evening')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 19, 45))).toBe('evening')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 21, 59))).toBe('evening')
    })

    it('classifies late-night between 22:00 and 04:59', () => {
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 22, 0))).toBe('late-night')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 23, 30))).toBe('late-night')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 1, 15))).toBe('late-night')
      expect(getTimeOfDayBucket(new Date(2026, 9, 13, 4, 59))).toBe('late-night')
    })
  })

  describe('Name Sanitization & Fallback', () => {
    it('returns empty string for null, undefined, or empty names', () => {
      expect(sanitizeGreetingName(null)).toBe('')
      expect(sanitizeGreetingName(undefined)).toBe('')
      expect(sanitizeGreetingName('')).toBe('')
      expect(sanitizeGreetingName('   ')).toBe('')
    })

    it('trims whitespace cleanly', () => {
      expect(sanitizeGreetingName('  Vardaan  ')).toBe('Vardaan')
    })

    it('trims excessively long names to prevent mobile overflow', () => {
      const veryLongName = 'Alexandrina-Constantinopolous-Smith'
      const sanitized = sanitizeGreetingName(veryLongName)
      expect(sanitized.length).toBeLessThanOrEqual(20)
      expect(sanitized.endsWith('…')).toBe(true)
    })

    it('falls back gracefully to friendly general greetings without name', () => {
      const morningRes = getGreeting(null, { totalDueToday: 2, completedToday: 1, currentStreak: 1, totalCompletionsCount: 5 }, new Date(2026, 9, 13, 8, 0))
      expect(morningRes.headline).not.toContain('{name}')
      expect(morningRes.headline).not.toContain('null')
      expect(morningRes.headline).not.toContain('undefined')
      expect(morningRes.headline.length).toBeGreaterThan(10)
    })

    it('interpolates sanitized name smoothly into headline', () => {
      const res = getGreeting('Vardaan', { totalDueToday: 2, completedToday: 1, currentStreak: 1, totalCompletionsCount: 5 }, new Date(2026, 9, 13, 8, 0))
      expect(res.headline).toContain('Vardaan')
      expect(res.headline).not.toContain('{name}')
    })
  })

  describe('Context-Aware Sublines', () => {
    it('provides an encouraging first-step nudge for brand new users (0 completions)', () => {
      const ctx: GreetingContext = {
        totalDueToday: 4,
        completedToday: 0,
        currentStreak: 0,
        totalCompletionsCount: 0,
      }
      const subline = getContextSubline(ctx)
      expect(subline).toContain('Welcome to EcoPulse')
      expect(subline).toContain('Complete your first energy reminder')
    })

    it('celebrates when all reminders due today are completed', () => {
      const ctx: GreetingContext = {
        totalDueToday: 3,
        completedToday: 3,
        currentStreak: 4,
        totalCompletionsCount: 15,
      }
      const subline = getContextSubline(ctx)
      expect(subline).toContain('All 3 of your scheduled habits are checked off today')
    })

    it('celebrates strong streaks (3+ days) when habits remain pending', () => {
      const ctx: GreetingContext = {
        totalDueToday: 5,
        completedToday: 2,
        currentStreak: 7,
        totalCompletionsCount: 20,
      }
      const subline = getContextSubline(ctx)
      expect(subline).toContain('7-day streak')
      expect(subline).toContain('2 of 5 habits completed today (3 remaining)')
    })

    it('displays standard remaining count for active users', () => {
      const ctx: GreetingContext = {
        totalDueToday: 4,
        completedToday: 1,
        currentStreak: 1,
        totalCompletionsCount: 6,
      }
      const subline = getContextSubline(ctx)
      expect(subline).toBe('1 of 4 habits completed today (3 remaining).')
    })

    it('handles 0 due today gracefully with active streak', () => {
      const ctx: GreetingContext = {
        totalDueToday: 0,
        completedToday: 0,
        currentStreak: 5,
        totalCompletionsCount: 12,
      }
      const subline = getContextSubline(ctx)
      expect(subline).toContain('No reminders scheduled for today')
      expect(subline).toContain('5-day')
    })
  })

  describe('Hygiene & Safety', () => {
    it('never produces output containing "undefined" or "NaN" in any permutation', () => {
      const hours = [2, 7, 13, 19, 23]
      const names = [null, undefined, '', 'Raja', 'Very Long Name That Exceeds Limit']
      const contexts: GreetingContext[] = [
        { totalDueToday: 0, completedToday: 0, currentStreak: 0, totalCompletionsCount: 0 },
        { totalDueToday: 2, completedToday: 2, currentStreak: 5, totalCompletionsCount: 10 },
        { totalDueToday: 4, completedToday: 1, currentStreak: 4, totalCompletionsCount: 8 },
        { totalDueToday: 1, completedToday: 0, currentStreak: 1, totalCompletionsCount: 3 },
      ]

      for (const h of hours) {
        for (const n of names) {
          for (const c of contexts) {
            const date = new Date(2026, 9, 13, h, 30)
            const res = getGreeting(n, c, date)

            expect(res.headline).not.toContain('undefined')
            expect(res.headline).not.toContain('NaN')
            expect(res.headline).not.toContain('null')

            expect(res.subline).not.toContain('undefined')
            expect(res.subline).not.toContain('NaN')
            expect(res.subline).not.toContain('null')
          }
        }
      }
    })

    it('avoids repeating the exact same greeting index consecutively in the same bucket', () => {
      const morningDate = new Date(2026, 9, 13, 8, 0)
      const ctx: GreetingContext = { totalDueToday: 2, completedToday: 1, currentStreak: 1, totalCompletionsCount: 5 }

      const first = getGreeting('User', ctx, morningDate)
      getGreeting('User', ctx, morningDate)

      // Even over 10 consecutive picks, consecutively adjacent greetings should vary
      let prevHeadline = first.headline
      let variedCount = 0

      for (let i = 0; i < 10; i++) {
        const next = getGreeting('User', ctx, morningDate)
        if (next.headline !== prevHeadline) {
          variedCount++
        }
        prevHeadline = next.headline
      }

      expect(variedCount).toBeGreaterThan(0)
    })
  })
})
