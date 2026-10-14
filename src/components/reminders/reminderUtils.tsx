import { Badge } from '../ui/Badge'
import type { Reminder, ReminderCategory } from '../../types'
import type { ReminderStatus } from '../../lib/schedule'

export const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  lighting: 'Lighting',
  cooling: 'Cooling',
  chargers: 'Chargers',
  computing: 'Computers',
  appliances: 'Appliances',
  standby: 'Standby',
  shared: 'Shared spaces',
  other: 'Other',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatRecurrence(reminder: Reminder): string {
  switch (reminder.recurrence) {
    case 'once':
      return 'Once'
    case 'daily':
      return 'Daily (Every day)'
    case 'weekdays':
      return 'Weekdays (Mon – Fri)'
    case 'weekly': {
      if (!reminder.days || reminder.days.length === 0) return 'Weekly'
      const names = reminder.days.map((d) => DAY_LABELS[d]).join(', ')
      return `Weekly (${names})`
    }
    default:
      return reminder.recurrence
  }
}

export function formatEnergyEstimate(reminder: Reminder): string {
  if (
    reminder.applianceWatts !== undefined &&
    reminder.avoidedHours !== undefined &&
    reminder.applianceWatts > 0 &&
    reminder.avoidedHours > 0
  ) {
    const kwh = (reminder.applianceWatts * reminder.avoidedHours) / 1000
    return `${reminder.applianceWatts}W × ${reminder.avoidedHours}h ≈ ${kwh.toFixed(2)} kWh/action`
  }
  return 'No energy estimate set'
}

export function renderStatusBadge(status: ReminderStatus, active: boolean) {
  if (!active) {
    return <Badge variant="neutral" size="sm">Inactive</Badge>
  }
  switch (status) {
    case 'done':
      return <Badge variant="emerald" size="sm">Done today</Badge>
    case 'snoozed':
      return <Badge variant="amber" size="sm">Snoozed</Badge>
    case 'overdue':
      return <Badge variant="rose" size="sm">Overdue</Badge>
    case 'upcoming':
      return <Badge variant="blue" size="sm">Upcoming today</Badge>
    case 'not-due':
      return <Badge variant="neutral" size="sm">Not due today</Badge>
  }
}
