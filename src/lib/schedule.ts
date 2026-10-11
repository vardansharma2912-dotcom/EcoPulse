import type { Completion, Reminder } from '../types'
import { todayKey, parseDateKey, addDays } from './dates'

export type ReminderStatus = 'done' | 'snoozed' | 'overdue' | 'upcoming' | 'not-due'

/**
 * Determines whether a reminder is scheduled/due on a specific local date ("YYYY-MM-DD").
 * Inactive reminders are never due.
 */
export function isDueOn(reminder: Reminder, dateKey: string): boolean {
  if (!reminder.active) {
    return false
  }

  const targetDate = parseDateKey(dateKey)
  if (isNaN(targetDate.getTime())) {
    return false
  }

  const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  switch (reminder.recurrence) {
    case 'once': {
      // Due only on the calendar day of its creation
      const createdDateKey = todayKey(new Date(reminder.createdAt))
      return createdDateKey === dateKey
    }

    case 'daily':
      return true

    case 'weekdays':
      // Monday (1) through Friday (5)
      return dayOfWeek >= 1 && dayOfWeek <= 5

    case 'weekly':
      // Only on user-selected days
      return Array.isArray(reminder.days) && reminder.days.includes(dayOfWeek)

    default:
      return false
  }
}

/**
 * Computes the operational status of a reminder for today.
 * Status:
 * - "done": already completed on today's local date
 * - "snoozed": active snooze timestamp in future
 * - "overdue": scheduled for today, time has passed, not completed, not snoozed
 * - "upcoming": scheduled for today, time is in future
 * - "not-due": not scheduled for today (e.g. inactive or non-matching recurrence)
 */
export function todayStatus(
  reminder: Reminder,
  completions: Completion[],
  now: Date = new Date()
): ReminderStatus {
  const today = todayKey(now)

  if (!isDueOn(reminder, today)) {
    return 'not-due'
  }

  const isDone = completions.some(
    (c) => c.reminderId === reminder.id && c.date === today
  )
  if (isDone) {
    return 'done'
  }

  if (reminder.snoozedUntil) {
    const snoozeDate = new Date(reminder.snoozedUntil)
    if (!isNaN(snoozeDate.getTime()) && now.getTime() < snoozeDate.getTime()) {
      return 'snoozed'
    }
  }

  // Parse reminder time (HH:mm)
  const [remH, remM] = reminder.time.split(':').map((v) => parseInt(v, 10))
  const reminderMinutes = (isNaN(remH) ? 0 : remH) * 60 + (isNaN(remM) ? 0 : remM)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (currentMinutes > reminderMinutes) {
    return 'overdue'
  }

  return 'upcoming'
}

/**
 * Computes consecutive active streak days ending today (or yesterday if today has none yet).
 * Purely derived from completions; never stored.
 */
export function computeStreak(
  completions: Completion[],
  today: string = todayKey()
): number {
  if (!completions || completions.length === 0) {
    return 0
  }

  const completedDates = new Set<string>()
  for (const c of completions) {
    if (c.date) {
      completedDates.add(c.date)
    }
  }

  if (completedDates.size === 0) {
    return 0
  }

  const todayDate = parseDateKey(today)
  const hasToday = completedDates.has(today)
  const yesterdayKey = todayKey(addDays(todayDate, -1))
  const hasYesterday = completedDates.has(yesterdayKey)

  // If neither today nor yesterday has a completion, streak is broken / 0
  if (!hasToday && !hasYesterday) {
    return 0
  }

  let streak = 0
  let checkDate = hasToday ? todayDate : parseDateKey(yesterdayKey)

  while (true) {
    const key = todayKey(checkDate)
    if (completedDates.has(key)) {
      streak++
      checkDate = addDays(checkDate, -1)
    } else {
      break
    }
  }

  return streak
}
