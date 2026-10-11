import { describe, it, expect } from 'vitest'
import { isDueOn, todayStatus, computeStreak } from '../schedule'
import type { Completion, Reminder } from '../../types'
import { todayKey } from '../dates'

const baseReminder: Reminder = {
  id: 'rem-test-1',
  title: 'Test Reminder',
  category: 'lighting',
  time: '14:00',
  recurrence: 'daily',
  active: true,
  createdAt: '2026-10-10T10:00:00.000Z',
}

describe('schedule.ts - isDueOn', () => {
  it('returns false if reminder is inactive', () => {
    const inactive = { ...baseReminder, active: false }
    expect(isDueOn(inactive, '2026-10-11')).toBe(false)
  })

  it('correctly handles "daily" recurrence', () => {
    expect(isDueOn(baseReminder, '2026-10-11')).toBe(true)
    expect(isDueOn(baseReminder, '2026-10-12')).toBe(true)
  })

  it('correctly handles "once" recurrence (only due on createdAt date)', () => {
    const onceRem: Reminder = {
      ...baseReminder,
      recurrence: 'once',
      createdAt: '2026-10-10T08:00:00.000Z',
    }
    // Created on 2026-10-10
    expect(isDueOn(onceRem, '2026-10-10')).toBe(true)
    expect(isDueOn(onceRem, '2026-10-11')).toBe(false)
  })

  it('correctly handles "weekdays" recurrence', () => {
    const weekdayRem: Reminder = {
      ...baseReminder,
      recurrence: 'weekdays',
    }
    // 2026-10-11 is Sunday (day 0) -> not due
    expect(isDueOn(weekdayRem, '2026-10-11')).toBe(false)
    // 2026-10-12 is Monday (day 1) -> due
    expect(isDueOn(weekdayRem, '2026-10-12')).toBe(true)
    // 2026-10-16 is Friday (day 5) -> due
    expect(isDueOn(weekdayRem, '2026-10-16')).toBe(true)
    // 2026-10-17 is Saturday (day 6) -> not due
    expect(isDueOn(weekdayRem, '2026-10-17')).toBe(false)
  })

  it('correctly handles "weekly" recurrence with selected days', () => {
    const weeklyRem: Reminder = {
      ...baseReminder,
      recurrence: 'weekly',
      days: [1, 3, 5], // Mon, Wed, Fri
    }
    // Sunday (0) -> false
    expect(isDueOn(weeklyRem, '2026-10-11')).toBe(false)
    // Monday (1) -> true
    expect(isDueOn(weeklyRem, '2026-10-12')).toBe(true)
    // Tuesday (2) -> false
    expect(isDueOn(weeklyRem, '2026-10-13')).toBe(false)
    // Wednesday (3) -> true
    expect(isDueOn(weeklyRem, '2026-10-14')).toBe(true)
  })
})

describe('schedule.ts - todayStatus', () => {
  const testDate = new Date(2026, 9, 11, 15, 0, 0) // 11 Oct 2026 at 15:00 local time
  const todayStr = '2026-10-11'

  it('returns "not-due" if inactive or not scheduled today', () => {
    const inactive = { ...baseReminder, active: false }
    expect(todayStatus(inactive, [], testDate)).toBe('not-due')

    const weekdayRem = { ...baseReminder, recurrence: 'weekdays' as const }
    // 11 Oct 2026 is Sunday
    expect(todayStatus(weekdayRem, [], testDate)).toBe('not-due')
  })

  it('returns "done" if a completion exists for today', () => {
    const completions: Completion[] = [
      {
        id: 'c1',
        reminderId: baseReminder.id,
        title: baseReminder.title,
        date: todayStr,
        completedAt: testDate.toISOString(),
        kWh: 0.1,
        costSaved: 0.8,
        tariffAtTime: 8,
      },
    ]
    expect(todayStatus(baseReminder, completions, testDate)).toBe('done')
  })

  it('returns "snoozed" if snoozedUntil is in the future', () => {
    const snoozed: Reminder = {
      ...baseReminder,
      snoozedUntil: new Date(testDate.getTime() + 30 * 60000).toISOString(), // 30 min in future
    }
    expect(todayStatus(snoozed, [], testDate)).toBe('snoozed')
  })

  it('returns "overdue" if time has passed and not done/snoozed', () => {
    // Reminder time is 14:00, test time is 15:00
    const rem = { ...baseReminder, time: '14:00' }
    expect(todayStatus(rem, [], testDate)).toBe('overdue')
  })

  it('returns "upcoming" if scheduled time is in future', () => {
    // Reminder time is 18:00, test time is 15:00
    const rem = { ...baseReminder, time: '18:00' }
    expect(todayStatus(rem, [], testDate)).toBe('upcoming')
  })
})

describe('schedule.ts - computeStreak', () => {
  it('returns 0 for empty completions', () => {
    expect(computeStreak([])).toBe(0)
  })

  it('calculates active streak when today is completed', () => {
    const completions: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'R', date: '2026-10-11', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
      { id: '2', reminderId: 'r1', title: 'R', date: '2026-10-10', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
      { id: '3', reminderId: 'r1', title: 'R', date: '2026-10-09', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
    ]
    expect(computeStreak(completions, '2026-10-11')).toBe(3)
  })

  it('preserves streak when today has no completion yet, but yesterday does', () => {
    const completions: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'R', date: '2026-10-10', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
      { id: '2', reminderId: 'r1', title: 'R', date: '2026-10-09', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
    ]
    // Today is 11 Oct 2026 (no completion yet), yesterday (10 Oct) has completion
    expect(computeStreak(completions, '2026-10-11')).toBe(2)
  })

  it('returns 0 if neither today nor yesterday has a completion', () => {
    const completions: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'R', date: '2026-10-08', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
    ]
    // Today is 11 Oct 2026, yesterday is 10 Oct
    expect(computeStreak(completions, '2026-10-11')).toBe(0)
  })

  it('stops at a gap in consecutive days', () => {
    const completions: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'R', date: '2026-10-11', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
      // 2026-10-10 is missing
      { id: '2', reminderId: 'r1', title: 'R', date: '2026-10-09', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
      { id: '3', reminderId: 'r1', title: 'R', date: '2026-10-08', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
    ]
    expect(computeStreak(completions, '2026-10-11')).toBe(1)
  })

  it('correctly handles local midnight IST edge case', () => {
    // 00:15 AM local time
    const midnightLocal = new Date(2026, 9, 11, 0, 15, 0)
    const localToday = todayKey(midnightLocal)
    expect(localToday).toBe('2026-10-11')

    const completions: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'R', date: '2026-10-11', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
      { id: '2', reminderId: 'r1', title: 'R', date: '2026-10-10', completedAt: '', kWh: 0, costSaved: 0, tariffAtTime: 8 },
    ]
    expect(computeStreak(completions, localToday)).toBe(2)
  })
})
