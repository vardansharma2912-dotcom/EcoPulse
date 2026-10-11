import { describe, it, expect } from 'vitest'
import { dueAlerts, getAlertKey } from '../alerts'
import type { Completion, Reminder } from '../../types'

const baseReminder: Reminder = {
  id: 'rem-alert-1',
  title: 'Turn off lab monitor',
  category: 'computing',
  time: '14:00',
  recurrence: 'daily',
  active: true,
  createdAt: '2026-10-10T10:00:00.000Z',
}

describe('alerts.ts - dueAlerts', () => {
  const testNow = new Date(2026, 9, 11, 14, 30, 0) // 11 Oct 2026 at 14:30 local time (after 14:00)

  it('alerts an active reminder when its time has passed and not done/snoozed', () => {
    const alerts = dueAlerts([baseReminder], [], testNow, new Set())
    expect(alerts.length).toBe(1)
    expect(alerts[0].id).toBe('rem-alert-1')
  })

  it('does NOT alert if reminder is inactive', () => {
    const inactive = { ...baseReminder, active: false }
    const alerts = dueAlerts([inactive], [], testNow, new Set())
    expect(alerts.length).toBe(0)
  })

  it('does NOT alert if scheduled time is still in the future', () => {
    const futureReminder = { ...baseReminder, time: '16:00' } // 16:00 is after 14:30
    const alerts = dueAlerts([futureReminder], [], testNow, new Set())
    expect(alerts.length).toBe(0)
  })

  it('does NOT alert if already completed today', () => {
    const completion: Completion = {
      id: 'c1',
      reminderId: baseReminder.id,
      title: baseReminder.title,
      date: '2026-10-11',
      completedAt: testNow.toISOString(),
      kWh: 0.1,
      costSaved: 0.8,
      tariffAtTime: 8,
    }
    const alerts = dueAlerts([baseReminder], [completion], testNow, new Set())
    expect(alerts.length).toBe(0)
  })

  it('does NOT alert if key is already alerted', () => {
    const key = getAlertKey(baseReminder, '2026-10-11')
    const alreadyAlerted = new Set([key])
    const alerts = dueAlerts([baseReminder], [], testNow, alreadyAlerted)
    expect(alerts.length).toBe(0)
  })

  it('does NOT alert while currently within active snooze window', () => {
    const snoozed: Reminder = {
      ...baseReminder,
      snoozedUntil: new Date(testNow.getTime() + 15 * 60000).toISOString(), // 15 min in future
    }
    const alerts = dueAlerts([snoozed], [], testNow, new Set())
    expect(alerts.length).toBe(0)
  })

  it('RE-ALERTS after snooze expires', () => {
    // Snooze expired 5 minutes ago
    const expiredSnooze: Reminder = {
      ...baseReminder,
      snoozedUntil: new Date(testNow.getTime() - 5 * 60000).toISOString(),
    }

    // Previous standard key had already alerted before snoozing
    const initialKey = `${baseReminder.id}_2026-10-11_14:00`
    const alreadyAlerted = new Set([initialKey])

    // Should return the reminder again because the snooze key is distinct
    const alerts = dueAlerts([expiredSnooze], [], testNow, alreadyAlerted)
    expect(alerts.length).toBe(1)
    expect(alerts[0].id).toBe(baseReminder.id)
  })
})
