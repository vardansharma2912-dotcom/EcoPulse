import { describe, it, expect } from 'vitest'
import { todayKey, addDays, startOfWeek, parseDateKey, formatDisplayDate } from '../dates'

describe('dates.ts - Local Calendar Helpers', () => {
  it('formats local date keys in YYYY-MM-DD using local methods', () => {
    // Construct local date: Year 2026, Month Oct (9 in 0-indexed), Day 11
    const testDate = new Date(2026, 9, 11, 2, 30, 0) // 2:30 AM local time
    expect(todayKey(testDate)).toBe('2026-10-11')

    // Single digit day and month
    const singleDigitDate = new Date(2026, 4, 5, 1, 15, 0) // May 5th
    expect(todayKey(singleDigitDate)).toBe('2026-05-05')
  })

  it('correctly offsets days using addDays', () => {
    const base = new Date(2026, 9, 11) // 11 Oct 2026
    const nextDay = addDays(base, 1)
    expect(todayKey(nextDay)).toBe('2026-10-12')

    const prevDay = addDays(base, -1)
    expect(todayKey(prevDay)).toBe('2026-10-10')

    const monthRoll = addDays(base, 25) // Into November
    expect(todayKey(monthRoll)).toBe('2026-11-05')
  })

  it('calculates start of week (Monday by default)', () => {
    // 11 Oct 2026 is a Sunday (day 0)
    const sunday = new Date(2026, 9, 11)
    const monday = startOfWeek(sunday, 1) // Start of week Monday
    // Preceding Monday is 5 Oct 2026
    expect(todayKey(monday)).toBe('2026-10-05')

    // 14 Oct 2026 is a Wednesday (day 3)
    const wednesday = new Date(2026, 9, 14)
    const weekStart = startOfWeek(wednesday, 1)
    // Preceding Monday is 12 Oct 2026
    expect(todayKey(weekStart)).toBe('2026-10-12')
  })

  it('parses date keys correctly', () => {
    const parsed = parseDateKey('2026-10-11')
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(9) // October
    expect(parsed.getDate()).toBe(11)
  })

  it('formats display dates', () => {
    const formatted = formatDisplayDate('2026-10-11')
    expect(formatted).toContain('Oct')
    expect(formatted).toContain('2026')
  })
})
