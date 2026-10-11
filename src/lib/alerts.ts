import type { Completion, Reminder } from '../types'
import { isDueOn } from './schedule'
import { todayKey } from './dates'

/**
 * Derives a unique alert key for a reminder on a given date.
 * If the reminder was snoozed and the snooze has expired, a snooze-specific key is used
 * so that the reminder re-alerts immediately after the snooze expiration.
 */
export function getAlertKey(reminder: Reminder, dateKey: string): string {
  if (reminder.snoozedUntil) {
    return `${reminder.id}_${dateKey}_snooze_${reminder.snoozedUntil}`
  }
  return `${reminder.id}_${dateKey}_${reminder.time}`
}

/**
 * Returns reminders that are currently due for an in-app alert or notification.
 * Criteria:
 * - Active
 * - Due on today's local date
 * - Scheduled time has passed (or is right now)
 * - Not marked as done today
 * - Not currently in an active snooze window (re-alerts once snooze expires)
 * - Not already alerted for this specific alert key
 */
export function dueAlerts(
  reminders: Reminder[],
  completions: Completion[],
  now: Date = new Date(),
  alreadyAlerted: Set<string> | string[] = new Set()
): Reminder[] {
  const today = todayKey(now)
  const alertedSet = alreadyAlerted instanceof Set ? alreadyAlerted : new Set(alreadyAlerted)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return reminders.filter((reminder) => {
    // 1. Must be active
    if (!reminder.active) {
      return false
    }

    // 2. Must be scheduled for today
    if (!isDueOn(reminder, today)) {
      return false
    }

    // 3. Must not be done today
    const isDone = completions.some(
      (c) => c.reminderId === reminder.id && c.date === today
    )
    if (isDone) {
      return false
    }

    // 4. Must not be currently snoozed
    if (reminder.snoozedUntil) {
      const snoozeDate = new Date(reminder.snoozedUntil)
      if (!isNaN(snoozeDate.getTime()) && now.getTime() < snoozeDate.getTime()) {
        return false
      }
    }

    // 5. Scheduled time must have passed
    const [h, m] = reminder.time.split(':').map((v) => parseInt(v, 10))
    const reminderMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
    if (currentMinutes < reminderMinutes) {
      return false
    }

    // 6. Must not already have been alerted
    const key = getAlertKey(reminder, today)
    if (alertedSet.has(key)) {
      return false
    }

    return true
  })
}
