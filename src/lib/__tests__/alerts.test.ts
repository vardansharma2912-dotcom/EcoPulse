import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { dueAlerts, getAlertKey, getMissedReminders } from '../alerts'
import { todayStatus } from '../schedule'
import { createInitialReminders } from '../storage'
import type { Completion, Reminder } from '../../types'

const baseReminder: Reminder = {
  id: 'rem-alert-1',
  title: 'Turn off desk monitor',
  category: 'computing',
  time: '14:00',
  recurrence: 'daily',
  active: true,
  createdAt: '2026-10-10T10:00:00.000Z',
}

describe('alerts.ts - dueAlerts and grace window (with fake clock)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starters created at 12:40 are not due or alerted today', () => {
    // Clock at 12:45 PM on 2026-10-12
    const launchTime = new Date(2026, 9, 12, 12, 40, 0)
    const checkTime = new Date(2026, 9, 12, 12, 45, 0)
    vi.setSystemTime(checkTime)

    // Starters seeded at launch (08:00, 09:00, 10:00, 13:00, 21:30, 23:00)
    const starters = createInitialReminders(launchTime.toISOString())

    // 08:00, 09:00, 10:00 had times before 12:40, so they are not due on creation day.
    // 13:00, 21:30, 23:00 are in the future (after 12:45).
    const alerts = dueAlerts(starters, [], checkTime, new Set())
    expect(alerts.length).toBe(0)
  })

  it('a slot 3 minutes ago alerts (inside 10-minute grace window)', () => {
    // Scheduled at 14:00, now is 14:03 (3 minutes later)
    const testNow = new Date(2026, 9, 12, 14, 3, 0)
    vi.setSystemTime(testNow)

    const rem: Reminder = {
      ...baseReminder,
      time: '14:00',
      createdAt: '2026-10-10T10:00:00.000Z',
    }

    const alerts = dueAlerts([rem], [], testNow, new Set())
    expect(alerts.length).toBe(1)
    expect(alerts[0].id).toBe('rem-alert-1')
  })

  it('a slot 2 hours ago does not alert but shows Overdue in todayStatus', () => {
    // Scheduled at 14:00, now is 16:00 (2 hours later)
    const testNow = new Date(2026, 9, 12, 16, 0, 0)
    vi.setSystemTime(testNow)

    const rem: Reminder = {
      ...baseReminder,
      time: '14:00',
      createdAt: '2026-10-10T10:00:00.000Z',
    }

    // Does NOT alert because 2 hours is older than the 10-minute grace window
    const alerts = dueAlerts([rem], [], testNow, new Set())
    expect(alerts.length).toBe(0)

    // But shows as "overdue" in lists and status calculations
    const status = todayStatus(rem, [], testNow)
    expect(status).toBe('overdue')
  })

  it('a snooze expiring inside the grace window alerts', () => {
    // Now is 14:30
    const testNow = new Date(2026, 9, 12, 14, 30, 0)
    vi.setSystemTime(testNow)

    // Snooze expired 4 minutes ago (at 14:26)
    const expiredSnooze: Reminder = {
      ...baseReminder,
      time: '14:00',
      createdAt: '2026-10-10T10:00:00.000Z',
      snoozedUntil: new Date(testNow.getTime() - 4 * 60 * 1000).toISOString(),
    }

    const alerts = dueAlerts([expiredSnooze], [], testNow, new Set())
    expect(alerts.length).toBe(1)
    expect(alerts[0].id).toBe('rem-alert-1')
  })

  it('a snooze expired 20 minutes ago (outside grace window) does not alert', () => {
    const testNow = new Date(2026, 9, 12, 14, 30, 0)
    vi.setSystemTime(testNow)

    // Snooze expired 20 minutes ago (outside 10-min grace window)
    const longExpiredSnooze: Reminder = {
      ...baseReminder,
      time: '14:00',
      createdAt: '2026-10-10T10:00:00.000Z',
      snoozedUntil: new Date(testNow.getTime() - 20 * 60 * 1000).toISOString(),
    }

    const alerts = dueAlerts([longExpiredSnooze], [], testNow, new Set())
    expect(alerts.length).toBe(0)
  })

  it('does NOT alert if reminder is inactive or already completed today', () => {
    const testNow = new Date(2026, 9, 12, 14, 3, 0)
    vi.setSystemTime(testNow)

    const inactive = { ...baseReminder, active: false }
    expect(dueAlerts([inactive], [], testNow, new Set()).length).toBe(0)

    const completion: Completion = {
      id: 'c1',
      reminderId: baseReminder.id,
      title: baseReminder.title,
      date: '2026-10-12',
      completedAt: testNow.toISOString(),
      kWh: 0.1,
      costSaved: 0.8,
      tariffAtTime: 8,
    }
    expect(dueAlerts([baseReminder], [completion], testNow, new Set()).length).toBe(0)
  })

  it('does NOT alert if alert key has already fired', () => {
    const testNow = new Date(2026, 9, 12, 14, 3, 0)
    vi.setSystemTime(testNow)

    const key = getAlertKey(baseReminder, '2026-10-12')
    expect(dueAlerts([baseReminder], [], testNow, new Set([key])).length).toBe(0)
  })

  it('calculates the missed-summary count correctly for slots passed while closed', () => {
    // User last visited at 09:30 AM
    const lastVisit = new Date(2026, 9, 12, 9, 30, 0)
    // User returns at 13:00 PM
    const returnNow = new Date(2026, 9, 12, 13, 0, 0)
    vi.setSystemTime(returnNow)

    const rem1: Reminder = {
      ...baseReminder,
      id: 'r1',
      time: '10:00', // Missed (between 09:30 and 12:50)
      createdAt: '2026-10-10T00:00:00.000Z',
    }
    const rem2: Reminder = {
      ...baseReminder,
      id: 'r2',
      time: '11:30', // Missed (between 09:30 and 12:50)
      createdAt: '2026-10-10T00:00:00.000Z',
    }
    const rem3: Reminder = {
      ...baseReminder,
      id: 'r3',
      time: '12:55', // Inside grace window (passed 5 min ago) -> NOT missed, will alert
      createdAt: '2026-10-10T00:00:00.000Z',
    }
    const rem4: Reminder = {
      ...baseReminder,
      id: 'r4',
      time: '08:00', // Passed before last visit (08:00 < 09:30) -> NOT missed while closed
      createdAt: '2026-10-10T00:00:00.000Z',
    }

    const missed = getMissedReminders([rem1, rem2, rem3, rem4], [], returnNow, lastVisit)
    expect(missed.length).toBe(2)
    expect(missed.map((m) => m.id)).toEqual(['r1', 'r2'])
  })
})
