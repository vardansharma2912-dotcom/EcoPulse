/**
 * Date utilities using LOCAL calendar fields only.
 * IMPORTANT: NEVER use toISOString() for calendar date keys as it converts to UTC,
 * which will output the previous day in India (IST, UTC+5:30) between 00:00 and 05:30 AM.
 */

/**
 * Returns a local date key in "YYYY-MM-DD" format.
 */
export function todayKey(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns a new Date object offset by the specified number of days (local time).
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Returns the start of the week for a given date (defaults to Monday = 1).
 */
export function startOfWeek(date: Date, startDay: number = 1): Date {
  const result = new Date(date)
  const currentDay = result.getDay() // 0 = Sunday, 1 = Monday, ...
  
  // Calculate distance from startDay
  let diff = currentDay - startDay
  if (diff < 0) {
    diff += 7
  }
  
  result.setDate(result.getDate() - diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Parses a "YYYY-MM-DD" local date string into a Date object set at local midnight.
 */
export function parseDateKey(dateKey: string): Date {
  const [yearStr, monthStr, dayStr] = dateKey.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const day = parseInt(dayStr, 10)
  return new Date(year, month, day)
}

/**
 * Formats a local "YYYY-MM-DD" key into a human-friendly string.
 */
export function formatDisplayDate(dateKey: string): string {
  const date = parseDateKey(dateKey)
  if (isNaN(date.getTime())) return dateKey
  
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
