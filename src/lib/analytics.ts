import type { Completion } from '../types'
import { startOfWeek, addDays, todayKey, formatDisplayDate } from './dates'

export interface WeeklyChartDataPoint {
  dateKey: string
  day: string
  fullDate: string
  kwh: number
  actions: number
}

export interface WeekComparisonStats {
  thisWeekKwh: number
  thisWeekActions: number
  lastWeekKwh: number
  lastWeekActions: number
  hasLastWeekData: boolean
  kwhDiff: number
  actionsDiff: number
}

export interface DateGroupedCompletions {
  dateKey: string
  displayDate: string
  totalKwh: number
  totalCost: number
  completions: Completion[]
}

export interface AchievementBadge {
  id: string
  title: string
  description: string
  unlocked: boolean
  progressText: string
  current: number
  target: number
  type: 'action' | 'streak' | 'energy'
}

/**
 * Returns 7 days of chart data (Mon-Sun) for the current week containing baseDate.
 */
export function getWeeklyChartData(
  completions: Completion[],
  baseDate: Date = new Date()
): WeeklyChartDataPoint[] {
  const monday = startOfWeek(baseDate, 1)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Pre-index completions by dateKey for fast lookup
  const dateMap = new Map<string, { kwh: number; actions: number }>()
  for (const c of completions) {
    const existing = dateMap.get(c.date) || { kwh: 0, actions: 0 }
    dateMap.set(c.date, {
      kwh: existing.kwh + (c.kWh || 0),
      actions: existing.actions + 1,
    })
  }

  const result: WeeklyChartDataPoint[] = []
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(monday, i)
    const key = todayKey(currentDate)
    const stat = dateMap.get(key) || { kwh: 0, actions: 0 }

    result.push({
      dateKey: key,
      day: dayNames[i],
      fullDate: currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      kwh: Math.round(stat.kwh * 1000) / 1000,
      actions: stat.actions,
    })
  }

  return result
}

/**
 * Compares current Monday-Sunday week with previous Monday-Sunday week.
 */
export function getWeekComparison(
  completions: Completion[],
  baseDate: Date = new Date()
): WeekComparisonStats {
  const thisWeekMonday = startOfWeek(baseDate, 1)
  const lastWeekMonday = addDays(thisWeekMonday, -7)

  const thisWeekKeys = new Set<string>()
  for (let i = 0; i < 7; i++) {
    thisWeekKeys.add(todayKey(addDays(thisWeekMonday, i)))
  }

  const lastWeekKeys = new Set<string>()
  for (let i = 0; i < 7; i++) {
    lastWeekKeys.add(todayKey(addDays(lastWeekMonday, i)))
  }

  let thisWeekKwh = 0
  let thisWeekActions = 0
  let lastWeekKwh = 0
  let lastWeekActions = 0

  for (const c of completions) {
    if (thisWeekKeys.has(c.date)) {
      thisWeekKwh += c.kWh || 0
      thisWeekActions++
    } else if (lastWeekKeys.has(c.date)) {
      lastWeekKwh += c.kWh || 0
      lastWeekActions++
    }
  }

  const hasLastWeekData = lastWeekActions > 0

  return {
    thisWeekKwh: Math.round(thisWeekKwh * 1000) / 1000,
    thisWeekActions,
    lastWeekKwh: Math.round(lastWeekKwh * 1000) / 1000,
    lastWeekActions,
    hasLastWeekData,
    kwhDiff: Math.round((thisWeekKwh - lastWeekKwh) * 1000) / 1000,
    actionsDiff: thisWeekActions - lastWeekActions,
  }
}

/**
 * Computes current streak and longest consecutive days streak derived from completions.
 */
export function computeStreaksFromCompletions(
  completions: Completion[],
  referenceDate: Date = new Date()
): { currentStreak: number; longestStreak: number } {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const completionDates = new Set<string>()
  for (const c of completions) {
    if (c.date) {
      completionDates.add(c.date)
    }
  }

  const todayStr = todayKey(referenceDate)
  const yesterdayStr = todayKey(addDays(referenceDate, -1))

  // 1. Current streak calculation
  let currentStreak = 0
  let checkDate: Date | null = null

  if (completionDates.has(todayStr)) {
    checkDate = referenceDate
  } else if (completionDates.has(yesterdayStr)) {
    checkDate = addDays(referenceDate, -1)
  }

  if (checkDate) {
    while (true) {
      const key = todayKey(checkDate)
      if (completionDates.has(key)) {
        currentStreak++
        checkDate = addDays(checkDate, -1)
      } else {
        break
      }
    }
  }

  // 2. Longest streak calculation
  const sortedDates = Array.from(completionDates).sort()
  let longestStreak = 0
  let currentRun = 0
  let previousDate: Date | null = null

  for (const dateKey of sortedDates) {
    const [y, m, d] = dateKey.split('-').map((v) => parseInt(v, 10))
    const thisDate = new Date(y, m - 1, d)

    if (!previousDate) {
      currentRun = 1
    } else {
      const expectedNext = addDays(previousDate, 1)
      if (todayKey(expectedNext) === dateKey) {
        currentRun++
      } else {
        currentRun = 1
      }
    }

    if (currentRun > longestStreak) {
      longestStreak = currentRun
    }
    previousDate = thisDate
  }

  return {
    currentStreak,
    longestStreak,
  }
}

/**
 * Groups completions by date in reverse chronological order (newest date first).
 */
export function groupCompletionsByDate(
  completions: Completion[],
  todayStr: string = todayKey()
): DateGroupedCompletions[] {
  const groupsMap = new Map<string, Completion[]>()

  // Sort raw completions descending by completion timestamp first
  const sorted = [...completions].sort((a, b) => {
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  })

  for (const c of sorted) {
    const key = c.date
    const list = groupsMap.get(key) || []
    list.push(c)
    groupsMap.set(key, list)
  }

  // Sort date keys descending
  const sortedKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a))

  const yesterdayDate = addDays(new Date(), -1)
  const yesterdayStr = todayKey(yesterdayDate)

  return sortedKeys.map((key) => {
    const items = groupsMap.get(key) || []
    const totalKwh = items.reduce((sum, item) => sum + (item.kWh || 0), 0)
    const totalCost = items.reduce((sum, item) => sum + (item.costSaved || 0), 0)

    let displayDate = formatDisplayDate(key)
    if (key === todayStr) {
      displayDate = `Today, ${displayDate}`
    } else if (key === yesterdayStr) {
      displayDate = `Yesterday, ${displayDate}`
    }

    return {
      dateKey: key,
      displayDate,
      totalKwh: Math.round(totalKwh * 1000) / 1000,
      totalCost: Math.round(totalCost * 100) / 100,
      completions: items,
    }
  })
}

/**
 * Computes live achievement badges based on completions and streak progress.
 * Badges are dynamically derived and never stored.
 */
export function getAchievements(
  completions: Completion[],
  streaks: { currentStreak: number; longestStreak: number }
): AchievementBadge[] {
  const totalActions = completions.length
  const totalKwh = completions.reduce((sum, c) => sum + (c.kWh || 0), 0)
  const maxStreak = Math.max(streaks.currentStreak, streaks.longestStreak)

  return [
    {
      id: 'first-action',
      title: 'First Step',
      description: 'Completed your first energy-saving action',
      unlocked: totalActions >= 1,
      progressText: totalActions >= 1 ? 'Unlocked' : `${totalActions}/1 action`,
      current: Math.min(totalActions, 1),
      target: 1,
      type: 'action',
    },
    {
      id: 'streak-3',
      title: '3-Day Streak',
      description: 'Built a 3-day conscious conservation habit',
      unlocked: maxStreak >= 3,
      progressText: maxStreak >= 3 ? 'Unlocked' : `${maxStreak}/3 days`,
      current: Math.min(maxStreak, 3),
      target: 3,
      type: 'streak',
    },
    {
      id: 'streak-7',
      title: '7-Day Champion',
      description: 'Maintained a full 7-day energy saving habit',
      unlocked: maxStreak >= 7,
      progressText: maxStreak >= 7 ? 'Unlocked' : `${maxStreak}/7 days`,
      current: Math.min(maxStreak, 7),
      target: 7,
      type: 'streak',
    },
    {
      id: 'actions-10',
      title: 'Deca Saver',
      description: 'Completed 10 energy saving reminders',
      unlocked: totalActions >= 10,
      progressText: totalActions >= 10 ? 'Unlocked' : `${totalActions}/10 actions`,
      current: Math.min(totalActions, 10),
      target: 10,
      type: 'action',
    },
    {
      id: 'actions-25',
      title: 'Quarter Century',
      description: 'Completed 25 energy saving reminders',
      unlocked: totalActions >= 25,
      progressText: totalActions >= 25 ? 'Unlocked' : `${totalActions}/25 actions`,
      current: Math.min(totalActions, 25),
      target: 25,
      type: 'action',
    },
    {
      id: 'kwh-1',
      title: '1 kWh Saved',
      description: 'Saved an estimated 1 unit (1 kWh) of electricity',
      unlocked: totalKwh >= 1.0,
      progressText: totalKwh >= 1.0 ? 'Unlocked' : `${totalKwh.toFixed(2)}/1.0 kWh`,
      current: Math.min(totalKwh, 1.0),
      target: 1.0,
      type: 'energy',
    },
  ]
}
