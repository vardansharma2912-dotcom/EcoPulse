import type { Completion, Reminder } from '../types'
import { calculateKwh, calculateCost } from './energy'
import { addDays, todayKey } from './dates'

/**
 * Generates ~14 days of realistic demonstration completions.
 * Every item is strictly flagged with `isDemo: true` so it can be cleanly removed
 * without ever affecting authentic user completions.
 */
export function generateSampleCompletions(
  reminders: Reminder[],
  baseDate: Date = new Date(),
  tariff: number = 8
): Completion[] {
  const result: Completion[] = []

  // Fallback template actions if user has no reminders
  const actionTemplates = reminders.length > 0
    ? reminders.map((r) => ({
        reminderId: r.id,
        title: r.title,
        watts: r.applianceWatts || 60,
        hours: r.avoidedHours || 3,
        time: r.time,
      }))
    : [
        {
          reminderId: 'rem-demo-1',
          title: 'Turn off room lights before leaving',
          watts: 40,
          hours: 3,
          time: '09:15',
        },
        {
          reminderId: 'rem-demo-2',
          title: 'Switch off ceiling fan when room is unoccupied',
          watts: 75,
          hours: 4,
          time: '10:30',
        },
        {
          reminderId: 'rem-demo-3',
          title: 'Unplug phone & device chargers from wall socket',
          watts: 10,
          hours: 8,
          time: '08:20',
        },
        {
          reminderId: 'rem-demo-4',
          title: 'Switch off monitor & desk setup power strip at night',
          watts: 45,
          hours: 7,
          time: '23:10',
        },
      ]

  // Generate completions for each of the past 14 days (0 to 13 days ago)
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const d = addDays(baseDate, -dayOffset)
    const dateStr = todayKey(d)

    // Select 1 to 3 actions per day based on a predictable pattern
    const countForDay = ((dayOffset * 3 + 1) % 3) + 1 // 1, 2, or 3 actions
    for (let i = 0; i < countForDay; i++) {
      const template = actionTemplates[(dayOffset + i) % actionTemplates.length]
      const kwh = calculateKwh(template.watts, template.hours)
      const cost = calculateCost(kwh, tariff)

      // Generate a realistic ISO timestamp for that date
      const [hoursStr, minsStr] = template.time.split(':')
      const completionTime = new Date(d)
      completionTime.setHours(parseInt(hoursStr, 10) || 12, parseInt(minsStr, 10) || 0, 0, 0)

      result.push({
        id: `demo-comp-${dayOffset}-${i}`,
        reminderId: template.reminderId,
        title: template.title,
        date: dateStr,
        completedAt: completionTime.toISOString(),
        kWh: kwh,
        costSaved: cost,
        tariffAtTime: tariff,
        isDemo: true,
      })
    }
  }

  return result
}

/**
 * Returns true if the completions list contains any demo records.
 */
export function hasDemoCompletions(completions: Completion[]): boolean {
  return completions.some((c) => c.isDemo === true)
}
