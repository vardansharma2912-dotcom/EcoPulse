import type { Completion, Reminder } from '../types'
import { startOfWeek, addDays, todayKey } from './dates'
import { isDueOn } from './schedule'
import { getWeekComparison } from './analytics'

export type DotStatus = 'completed' | 'missed' | 'future'

export interface WeekDayGlance {
  dateKey: string // "YYYY-MM-DD"
  dayLabel: string // "Mon", "Tue", ...
  dayNumber: number // 1..31
  isToday: boolean
  isPast: boolean
  isFuture: boolean
  status: DotStatus
  actionsCount: number
  kwhAvoided: number
}

export interface WeekGlanceStats {
  actionsThisWeek: number
  kwhAvoidedThisWeek: number
  bestDay: string
  totalCompletions: number
  isEmpty: boolean
}

export interface NextUpReminderInfo {
  type: 'today' | 'tomorrow'
  title: string
  time: string
  reminderId: string
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Returns 7 days of data for the current Monday-to-Sunday week.
 * Dot status rules:
 * - 'completed': at least one completed action on this local calendar date
 * - 'missed': 0 completed actions and date is in the past (< today)
 * - 'future': date is in the future (> today), or today with 0 completions yet
 */
export function getWeekGlanceDays(
  completions: Completion[],
  baseDate: Date = new Date()
): WeekDayGlance[] {
  const monday = startOfWeek(baseDate, 1)
  const todayStr = todayKey(baseDate)

  // Map completions by date key
  const completionMap = new Map<string, { count: number; kwh: number }>()
  for (const c of completions) {
    const existing = completionMap.get(c.date) || { count: 0, kwh: 0 }
    completionMap.set(c.date, {
      count: existing.count + 1,
      kwh: existing.kwh + (c.kWh || 0),
    })
  }

  const days: WeekDayGlance[] = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i)
    const key = todayKey(d)
    const isToday = key === todayStr
    const isPast = key < todayStr
    const isFuture = key > todayStr

    const stat = completionMap.get(key) || { count: 0, kwh: 0 }
    const actionsCount = stat.count
    const kwhAvoided = Math.round(stat.kwh * 1000) / 1000

    let status: DotStatus
    if (actionsCount > 0) {
      status = 'completed'
    } else if (isPast) {
      status = 'missed'
    } else {
      status = 'future'
    }

    days.push({
      dateKey: key,
      dayLabel: DAY_LABELS[i],
      dayNumber: d.getDate(),
      isToday,
      isPast,
      isFuture,
      status,
      actionsCount,
      kwhAvoided,
    })
  }

  return days
}

/**
 * Computes week summary statistics matching Analytics page helpers exactly.
 */
export function getWeekGlanceStats(
  days: WeekDayGlance[],
  completions: Completion[],
  baseDate: Date = new Date()
): WeekGlanceStats {
  const comparison = getWeekComparison(completions, baseDate)
  const actionsThisWeek = comparison.thisWeekActions
  const kwhAvoidedThisWeek = comparison.thisWeekKwh

  // Best day: day with the most actions (must be > 0)
  let bestDay = '-'
  let maxActions = 0
  for (const d of days) {
    if (d.actionsCount > maxActions) {
      maxActions = d.actionsCount
      bestDay = d.dayLabel
    }
  }

  return {
    actionsThisWeek,
    kwhAvoidedThisWeek,
    bestDay,
    totalCompletions: completions.length,
    isEmpty: completions.length === 0,
  }
}

/**
 * Finds the next upcoming scheduled reminder for today or tomorrow.
 * Prioritizes upcoming reminders today (time >= current time), then tomorrow's reminders.
 * Returns null if none are scheduled or all are completed.
 */
export function getNextUpReminder(
  reminders: Reminder[],
  completions: Completion[],
  now: Date = new Date()
): NextUpReminderInfo | null {
  const today = todayKey(now)
  const tomorrow = todayKey(addDays(now, 1))
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const activeReminders = reminders.filter((r) => r.active !== false)

  // 1. Incomplete reminders due today
  const todayCompletedIds = new Set(
    completions.filter((c) => c.date === today).map((c) => c.reminderId)
  )

  const upcomingToday = activeReminders
    .filter((r) => isDueOn(r, today) && !todayCompletedIds.has(r.id))
    .filter((r) => {
      const [h, m] = r.time.split(':').map((v) => parseInt(v, 10))
      const remMins = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
      return remMins >= currentMinutes
    })
    .sort((a, b) => a.time.localeCompare(b.time))

  if (upcomingToday.length > 0) {
    return {
      type: 'today',
      title: upcomingToday[0].title,
      time: upcomingToday[0].time,
      reminderId: upcomingToday[0].id,
    }
  }

  // 2. Earliest reminder due tomorrow
  const upcomingTomorrow = activeReminders
    .filter((r) => isDueOn(r, tomorrow))
    .sort((a, b) => a.time.localeCompare(b.time))

  if (upcomingTomorrow.length > 0) {
    return {
      type: 'tomorrow',
      title: upcomingTomorrow[0].title,
      time: upcomingTomorrow[0].time,
      reminderId: upcomingTomorrow[0].id,
    }
  }

  return null
}
