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

export const GRACE_WINDOW_MINUTES = 10
export const GRACE_WINDOW_MS = GRACE_WINDOW_MINUTES * 60 * 1000

/**
 * Returns reminders that are currently due for an in-app alert or notification.
 * Criteria:
 * - Active
 * - Due on today's local date
 * - Scheduled time has passed within the last 10 minutes (grace window)
 *   OR an expired snooze passed within the last 10 minutes (grace window)
 * - Not marked as done today
 * - Not currently in an active (unexpired) snooze window
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

    // 4. Check snooze and grace window
    if (reminder.snoozedUntil) {
      const snoozeDate = new Date(reminder.snoozedUntil)
      if (!isNaN(snoozeDate.getTime())) {
        if (now.getTime() < snoozeDate.getTime()) {
          // Snooze still active in the future
          return false
        }
        // Snooze has expired: must have expired within the last 10 minutes
        const diffMs = now.getTime() - snoozeDate.getTime()
        if (diffMs > GRACE_WINDOW_MS) {
          // Snooze expired more than 10 minutes ago: missed, do not alert
          return false
        }
      }
    } else {
      // 5. If not snoozed, scheduled time must have passed within the last 10 minutes
      const [h, m] = reminder.time.split(':').map((v) => parseInt(v, 10))
      const remH = isNaN(h) ? 0 : h
      const remM = isNaN(m) ? 0 : m
      const scheduledTimeToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        remH,
        remM,
        0,
        0
      )
      const diffMs = now.getTime() - scheduledTimeToday.getTime()

      if (diffMs < 0) {
        // Scheduled time is in the future
        return false
      }
      if (diffMs > GRACE_WINDOW_MS) {
        // Scheduled time passed more than 10 minutes ago: missed, do not alert
        return false
      }
    }

    // 6. Must not already have been alerted
    const key = getAlertKey(reminder, today)
    if (alertedSet.has(key)) {
      return false
    }

    return true
  })
}

/**
 * Calculates reminder slots missed between `sinceTime` and `now`.
 * A slot is "missed" if:
 * - Active and due on today's local date
 * - Not marked as done today
 * - Scheduled slot (or expired snooze) occurred at or after `sinceTime`
 * - Scheduled slot (or expired snooze) occurred older than the 10-minute grace window
 */
export function getMissedReminders(
  reminders: Reminder[],
  completions: Completion[],
  now: Date = new Date(),
  sinceTime?: Date | string | null
): Reminder[] {
  if (!sinceTime) return []

  const since = typeof sinceTime === 'string' ? new Date(sinceTime) : sinceTime
  if (isNaN(since.getTime()) || since.getTime() >= now.getTime()) {
    return []
  }

  const today = todayKey(now)
  const graceCutoffMs = now.getTime() - GRACE_WINDOW_MS

  return reminders.filter((reminder) => {
    if (!reminder.active) return false
    if (!isDueOn(reminder, today)) return false

    const isDone = completions.some(
      (c) => c.reminderId === reminder.id && c.date === today
    )
    if (isDone) return false

    let slotTimeMs: number
    if (reminder.snoozedUntil) {
      const snoozeDate = new Date(reminder.snoozedUntil)
      if (isNaN(snoozeDate.getTime())) return false
      slotTimeMs = snoozeDate.getTime()
    } else {
      const [h, m] = reminder.time.split(':').map((v) => parseInt(v, 10))
      const remH = isNaN(h) ? 0 : h
      const remM = isNaN(m) ? 0 : m
      const scheduledTimeToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        remH,
        remM,
        0,
        0
      )
      slotTimeMs = scheduledTimeToday.getTime()
    }

    // Must have passed at or after sinceTime, but strictly before the grace cutoff (older than 10 minutes)
    return slotTimeMs >= since.getTime() && slotTimeMs < graceCutoffMs
  })
}
