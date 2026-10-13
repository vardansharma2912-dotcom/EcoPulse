/**
 * EcoPulse Personalized Greeting Engine
 * Warm, conversational, time-aware greetings themed around energy conservation and habits.
 */

export type TimeOfDayBucket = 'morning' | 'afternoon' | 'evening' | 'late-night'

export interface GreetingContext {
  totalDueToday: number
  completedToday: number
  currentStreak: number
  totalCompletionsCount: number
}

export interface GreetingResult {
  headline: string
  subline: string
  timeOfDay: TimeOfDayBucket
}

export function getTimeOfDayBucket(date: Date = new Date()): TimeOfDayBucket {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'late-night'
}

export function sanitizeGreetingName(rawName?: string | null): string {
  if (!rawName) return ''
  const trimmed = rawName.trim()
  if (!trimmed) return ''
  // Prevent excessive length from breaking responsive mobile headers
  if (trimmed.length > 20) {
    return trimmed.slice(0, 18).trim() + '…'
  }
  return trimmed
}

type GreetingTemplate = {
  withName: (name: string) => string
  withoutName: () => string
}

const GREETING_POOLS: Record<TimeOfDayBucket, GreetingTemplate[]> = {
  morning: [
    {
      withName: (name) => `Good morning, ${name}. Ready to power down some phantom waste today?`,
      withoutName: () => 'Good morning! Ready to power down some phantom waste today?',
    },
    {
      withName: (name) => `Rise and shine, ${name}. A clean energy day starts with small switches.`,
      withoutName: () => 'Rise and shine! A clean energy day starts with small switches.',
    },
    {
      withName: (name) => `Morning, ${name}! Natural daylight is rising—time to keep room bulbs resting.`,
      withoutName: () => 'Good morning! Natural daylight is rising—time to keep room bulbs resting.',
    },
    {
      withName: (name) => `Bright morning, ${name}. Let's make every kilowatt-hour count today.`,
      withoutName: () => "Bright morning! Let's make every kilowatt-hour count today.",
    },
    {
      withName: (name) => `Hey ${name}, energized for today? Small conservation habits build real momentum.`,
      withoutName: () => 'Hey there, energized for today? Small conservation habits build real momentum.',
    },
  ],
  afternoon: [
    {
      withName: (name) => `Good afternoon, ${name}. Keeping campus energy in check?`,
      withoutName: () => 'Good afternoon. Keeping campus energy in check?',
    },
    {
      withName: (name) => `Hey ${name}, afternoon peak hours are here—time for mindful power habits.`,
      withoutName: () => 'Afternoon peak hours are here—time for mindful power habits.',
    },
    {
      withName: (name) => `Sun's high, ${name}. Remember to shut off desk equipment before stepping out.`,
      withoutName: () => "Sun's high! Remember to shut off desk equipment before stepping out.",
    },
    {
      withName: (name) => `Midday check-in, ${name}. How is your workstation efficiency looking?`,
      withoutName: () => 'Midday check-in. How is your workstation efficiency looking?',
    },
    {
      withName: (name) => `Good afternoon, ${name}! Keep the fans breezy and unneeded displays resting.`,
      withoutName: () => 'Good afternoon! Keep the fans breezy and unneeded displays resting.',
    },
  ],
  evening: [
    {
      withName: (name) => `Good evening, ${name}. Ready to wind down your workstation power?`,
      withoutName: () => 'Good evening. Ready to wind down your workstation power?',
    },
    {
      withName: (name) => `Evening, ${name}! Unplugging idle laptop chargers keeps phantom draw at zero.`,
      withoutName: () => 'Good evening! Unplugging idle laptop chargers keeps phantom draw at zero.',
    },
    {
      withName: (name) => `Hey ${name}, the campus grid thanks you for today's conservation efforts.`,
      withoutName: () => 'Hey there! The campus grid thanks you for today\'s conservation efforts.',
    },
    {
      withName: (name) => `Winding down, ${name}? A quick sweep of switched sockets finishes the day strong.`,
      withoutName: () => 'Winding down? A quick sweep of switched sockets finishes the day strong.',
    },
    {
      withName: (name) => `Good evening, ${name}. Time to dim excess ambient lights and relax.`,
      withoutName: () => 'Good evening. Time to dim excess ambient lights and relax.',
    },
  ],
  'late-night': [
    {
      withName: (name) => `Burning the midnight oil, ${name}? Keep unneeded room lights dimmed.`,
      withoutName: () => 'Burning the midnight oil? Keep unneeded room lights dimmed.',
    },
    {
      withName: (name) => `Late hours, ${name}. Remember to shut down sleep-mode displays before bed.`,
      withoutName: () => 'Late hours. Remember to shut down sleep-mode displays before bed.',
    },
    {
      withName: (name) => `Quiet night, ${name}. Cutting wall socket power lets your appliances rest too.`,
      withoutName: () => 'Quiet night. Cutting wall socket power lets your appliances rest too.',
    },
    {
      withName: (name) => `Still awake, ${name}? Rest well, and let standby electronics recharge tomorrow.`,
      withoutName: () => 'Still awake? Rest well, and let standby electronics recharge tomorrow.',
    },
    {
      withName: (name) => `Late night study session, ${name}? Focus mode on, phantom power off.`,
      withoutName: () => 'Late night study session? Focus mode on, phantom power off.',
    },
  ],
}

const LAST_GREETING_KEY = 'ecopulse_last_greeting_key'

/**
 * Returns a context-accurate subline based solely on genuine user metrics.
 * Never invents numbers or displays fake claims.
 */
export function getContextSubline(context: GreetingContext): string {
  const { totalDueToday, completedToday, currentStreak, totalCompletionsCount } = context

  // 1. Brand new user with zero completions
  if (totalCompletionsCount === 0) {
    return 'Welcome to EcoPulse! Complete your first energy reminder below to start building your streak.'
  }

  // 2. All scheduled reminders done today
  if (totalDueToday > 0 && completedToday >= totalDueToday) {
    return `All ${completedToday} of your scheduled habits are checked off today. Fantastic work keeping energy lean!`
  }

  // 3. No reminders scheduled for today
  if (totalDueToday === 0) {
    if (currentStreak > 0) {
      return `No reminders scheduled for today. You're holding a ${currentStreak}-day conservation streak!`
    }
    return 'No reminders scheduled for today. Check the appliance calculator or add a custom habit.'
  }

  // 4. Strong active streak with pending habits
  if (currentStreak >= 3) {
    const remaining = totalDueToday - completedToday
    return `You're on an impressive ${currentStreak}-day streak! ${completedToday} of ${totalDueToday} habit${totalDueToday === 1 ? '' : 's'} completed today (${remaining} remaining).`
  }

  // 5. Normal active day with progress
  const remaining = totalDueToday - completedToday
  return `${completedToday} of ${totalDueToday} habit${totalDueToday === 1 ? '' : 's'} completed today (${remaining} remaining).`
}

/**
 * Selects a non-repeating index from the greeting pool.
 */
function pickGreetingIndex(
  poolSize: number,
  bucket: TimeOfDayBucket,
  rng: () => number = Math.random
): number {
  if (poolSize <= 1) return 0

  let lastKey = ''
  try {
    if (typeof sessionStorage !== 'undefined') {
      lastKey = sessionStorage.getItem(LAST_GREETING_KEY) || ''
    }
  } catch {
    // Ignore storage restrictions
  }

  const [lastBucket, lastIdxStr] = lastKey.split(':')
  const lastIdx = lastBucket === bucket && lastIdxStr !== undefined ? parseInt(lastIdxStr, 10) : -1

  // Filter out the last index so we avoid repeating the same greeting twice in a row
  const availableIndices: number[] = []
  for (let i = 0; i < poolSize; i++) {
    if (i !== lastIdx) {
      availableIndices.push(i)
    }
  }

  const choice = Math.floor(rng() * availableIndices.length)
  const selectedIdx = availableIndices[choice] ?? 0

  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(LAST_GREETING_KEY, `${bucket}:${selectedIdx}`)
    }
  } catch {
    // Ignore storage restrictions
  }

  return selectedIdx
}

/**
 * Returns a personalized, time-aware and data-driven greeting.
 */
export function getGreeting(
  name?: string | null,
  context: GreetingContext = {
    totalDueToday: 0,
    completedToday: 0,
    currentStreak: 0,
    totalCompletionsCount: 0,
  },
  now: Date = new Date(),
  rng: () => number = Math.random
): GreetingResult {
  const bucket = getTimeOfDayBucket(now)
  const pool = GREETING_POOLS[bucket]
  const cleanName = sanitizeGreetingName(name)

  const selectedIdx = pickGreetingIndex(pool.length, bucket, rng)
  const template = pool[selectedIdx] || pool[0]

  const headline = cleanName ? template.withName(cleanName) : template.withoutName()
  const subline = getContextSubline(context)

  return {
    headline,
    subline,
    timeOfDay: bucket,
  }
}
