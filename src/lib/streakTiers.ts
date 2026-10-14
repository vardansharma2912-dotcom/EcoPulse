/**
 * EcoPulse Streak Tier System
 * Maps habit streak day counts into animated, tiered achievement levels.
 */

export type StreakTierId =
  | 'dormant'
  | 'spark'
  | 'flame'
  | 'blaze'
  | 'inferno'
  | 'aurora'
  | 'platinum'
  | 'legend'

export interface StreakTierColors {
  primary: string
  secondary: string
  accent?: string
  gradient: string
  text: string
  bg: string
  border: string
  fill: string
  stroke: string
}

export interface StreakFireShape {
  outer: string
  inner: string
}

export interface StreakTier {
  id: StreakTierId
  name: string
  minDays: number
  nextAt: number | null
  colors: StreakTierColors
  glow: string
  intensity: number // 0 (dormant) to 7 (legend)
  description: string
  animation: 'none' | 'subtle' | 'flame' | 'blaze' | 'inferno' | 'aurora' | 'shimmer' | 'legend'
  flameShape: StreakFireShape
}

export const STREAK_TIERS: StreakTier[] = [
  {
    id: 'dormant',
    name: 'Dormant',
    minDays: 0,
    nextAt: 1,
    intensity: 0,
    animation: 'none',
    description: 'Start your daily energy-saving habit today.',
    colors: {
      primary: '#64748b',
      secondary: '#cbd5e1',
      accent: '#475569',
      gradient: 'linear-gradient(135deg, #475569, #64748b, #94a3b8)',
      text: '#334155',
      bg: 'rgba(100, 116, 139, 0.12)',
      border: 'rgba(100, 116, 139, 0.28)',
      fill: '#64748b',
      stroke: '#0c2340',
    },
    glow: 'none',
    flameShape: {
      // Quiet, resting cartoon flame ember bud
      outer: 'M 13.2 6.2 C 11.8 6.5 10.0 8.0 9.0 10.8 C 8.0 13.5 8.2 16.8 10.2 19.5 C 11.0 20.2 11.8 20.5 12.5 20.5 C 13.8 20.5 15.5 19.8 16.2 18.0 C 17.2 15.5 17.0 12.2 15.2 9.5 C 14.5 8.2 14.0 7.0 13.2 6.2 Z',
      inner: 'M 13.0 11.2 C 11.8 12.5 11.0 14.2 11.0 16.0 C 11.0 17.8 11.8 19.0 12.5 19.0 C 13.5 19.0 14.5 17.8 14.5 16.0 C 14.5 14.2 13.8 12.5 13.0 11.2 Z',
    },
  },
  {
    id: 'spark',
    name: 'Spark',
    minDays: 1,
    nextAt: 3,
    intensity: 1,
    animation: 'subtle',
    description: 'First steps in mindful electricity conservation.',
    colors: {
      primary: '#10b981',
      secondary: '#fef08a',
      accent: '#047857',
      gradient: 'linear-gradient(135deg, #047857, #10b981, #34d399)',
      text: '#065f46',
      bg: 'rgba(16, 185, 129, 0.14)',
      border: 'rgba(16, 185, 129, 0.35)',
      fill: '#10b981',
      stroke: '#0c2340',
    },
    glow: '0 0 12px rgba(16, 185, 129, 0.35)',
    flameShape: {
      // Sprouting baby cartoon flame: lively curved main crest with playful side curl
      outer: 'M 13.5 4.5 C 11.8 5.0 10.2 6.8 9.5 8.8 C 9.0 9.8 8.2 9.2 7.5 9.6 C 6.5 10.2 6.0 12.2 6.5 14.2 C 6.8 15.2 6.2 14.5 5.5 13.8 C 5.0 14.5 4.8 16.0 5.2 17.8 C 5.8 19.8 8.5 21.0 12.5 21.0 C 16.2 21.0 18.5 18.8 18.5 15.5 C 18.5 13.2 17.5 10.8 16.2 9.5 C 15.5 9.0 15.0 10.0 15.2 11.2 C 15.5 12.0 15.0 11.0 14.2 8.8 C 13.8 7.2 13.6 5.2 13.5 4.5 Z',
      inner: 'M 13.0 8.8 C 11.8 10.8 11.0 13.0 10.5 14.8 C 9.8 15.8 9.2 17.0 9.2 18.2 C 9.2 19.5 10.5 20.2 12.5 20.2 C 14.8 20.2 16.8 19.2 17.0 17.0 C 17.2 15.0 16.2 13.0 15.2 13.8 C 14.5 14.5 14.0 13.5 14.0 12.2 C 14.0 10.8 13.5 9.5 13.0 8.8 Z',
    },
  },
  {
    id: 'flame',
    name: 'Flame',
    minDays: 3,
    nextAt: 7,
    intensity: 2,
    animation: 'flame',
    description: 'A steady habit begins to burn bright.',
    colors: {
      primary: '#f97316',
      secondary: '#fef08a',
      accent: '#f43f5e',
      gradient: 'linear-gradient(135deg, #f43f5e, #f97316, #fbbf24)',
      text: '#9a3412',
      bg: 'rgba(254, 243, 199, 0.55)',
      border: 'rgba(245, 158, 11, 0.45)',
      fill: '#f97316',
      stroke: '#0c2340',
    },
    glow: '0 0 16px rgba(245, 158, 11, 0.45)',
    flameShape: {
      // Iconic 3-crested whipping campfire flame (exact match to fire.mp4)
      outer: 'M 13.5 3.0 C 11.5 3.2 9.8 4.6 9.0 6.6 C 8.6 7.6 8.2 6.9 7.7 7.1 C 6.8 7.6 6.2 9.5 6.4 11.4 C 6.8 12.6 5.8 11.8 5.0 10.8 C 4.6 11.0 4.4 12.0 4.5 14.8 C 4.8 17.8 8.0 21.0 12.5 21.0 C 16.5 21.0 19.5 17.8 19.5 14.2 C 19.5 12.0 18.5 9.2 17.2 8.0 C 16.5 7.6 16.2 8.2 16.6 9.5 C 16.8 10.5 16.2 9.5 14.8 6.8 C 14.0 5.2 13.8 3.5 13.5 3.0 Z',
      inner: 'M 13.2 7.2 C 11.8 9.5 11.0 12.2 10.5 13.8 C 9.8 14.8 8.8 16.2 8.5 17.8 C 8.5 19.2 10.0 20.2 12.5 20.2 C 15.5 20.2 18.5 18.8 18.8 15.5 C 19.0 13.0 18.0 10.5 17.0 11.8 C 16.0 12.8 15.2 12.2 15.2 11.0 C 15.2 9.5 14.2 8.0 13.2 7.2 Z',
    },
  },
  {
    id: 'blaze',
    name: 'Blaze',
    minDays: 7,
    nextAt: 14,
    intensity: 3,
    animation: 'blaze',
    description: 'One full week of continuous eco-conscious actions.',
    colors: {
      primary: '#ea580c',
      secondary: '#fef08a',
      accent: '#e11d48',
      gradient: 'linear-gradient(135deg, #e11d48, #ea580c, #f59e0b)',
      text: '#991b1b',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      fill: '#ea580c',
      stroke: '#0c2340',
    },
    glow: '0 0 18px rgba(239, 68, 68, 0.5)',
    flameShape: {
      // Roaring 4-crested cartoon bonfire: central soaring plume flanked by leaping tongues
      outer: 'M 13.2 1.8 C 11.8 2.5 10.2 4.2 9.6 5.8 C 9.0 6.6 8.2 6.0 7.5 6.4 C 6.5 7.0 5.8 8.8 6.0 10.6 C 6.4 11.8 5.4 11.2 4.6 10.2 C 3.8 10.8 3.5 12.5 3.8 15.2 C 4.2 18.5 7.8 21.2 12.5 21.2 C 17.2 21.2 20.5 18.5 20.8 15.0 C 21.0 12.5 19.8 9.5 18.5 8.2 C 17.8 7.8 17.5 8.8 17.8 10.0 C 18.0 11.0 17.2 10.0 16.0 7.2 C 15.2 5.5 14.8 4.2 14.2 2.2 C 13.8 1.8 13.5 1.8 13.2 1.8 Z',
      inner: 'M 13.0 5.8 C 11.5 8.0 10.5 10.5 9.8 12.5 C 9.0 13.5 8.0 15.0 7.8 16.8 C 7.8 18.8 9.5 20.2 12.5 20.2 C 15.8 20.2 18.8 18.5 19.0 15.2 C 19.2 12.5 18.0 9.8 17.0 11.2 C 16.0 12.5 15.0 11.8 15.0 10.2 C 15.0 8.5 14.0 6.8 13.0 5.8 Z',
    },
  },
  {
    id: 'inferno',
    name: 'Inferno',
    minDays: 14,
    nextAt: 30,
    intensity: 4,
    animation: 'inferno',
    description: 'Two unbroken weeks of conscious campus power-saving.',
    colors: {
      primary: '#c026d3',
      secondary: '#f5d0fe',
      accent: '#701a75',
      gradient: 'linear-gradient(135deg, #701a75, #c026d3, #a855f7)',
      text: '#701a75',
      bg: 'rgba(192, 38, 211, 0.15)',
      border: 'rgba(192, 38, 211, 0.42)',
      fill: '#c026d3',
      stroke: '#0c2340',
    },
    glow: '0 0 20px rgba(192, 38, 211, 0.55)',
    flameShape: {
      // 5-crested crowned royal cartoon inferno with dynamic dragon-tail curling licks
      outer: 'M 13.0 1.2 C 11.5 2.0 10.2 3.8 9.5 5.2 C 8.8 6.0 8.0 5.2 7.2 5.8 C 6.0 6.8 5.2 8.8 5.5 10.8 C 5.8 11.8 4.8 11.2 4.0 10.2 C 3.2 11.0 2.8 13.0 3.2 15.8 C 3.8 19.2 7.8 21.5 12.5 21.5 C 17.5 21.5 21.2 19.0 21.5 15.2 C 21.8 12.2 20.2 9.0 18.8 7.8 C 18.0 7.2 17.6 8.5 18.0 9.8 C 18.2 10.8 17.2 9.8 16.0 6.8 C 15.2 4.8 14.8 3.5 14.0 1.8 C 13.6 1.2 13.2 1.2 13.0 1.2 Z',
      inner: 'M 12.8 4.8 C 11.2 7.0 10.2 9.8 9.5 11.8 C 8.6 13.0 7.6 14.5 7.5 16.5 C 7.5 18.8 9.5 20.5 12.5 20.5 C 16.0 20.5 19.2 18.5 19.5 14.8 C 19.8 12.0 18.2 9.0 17.0 10.5 C 15.8 11.8 14.8 11.0 14.8 9.2 C 14.8 7.5 13.8 5.8 12.8 4.8 Z',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    minDays: 30,
    nextAt: 60,
    intensity: 5,
    animation: 'aurora',
    description: 'One month milestone: glowing atmospheric sustainability.',
    colors: {
      primary: '#06b6d4',
      secondary: '#a7f3d0',
      accent: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #06b6d4, #10b981)',
      text: '#0e7490',
      bg: 'rgba(6, 182, 212, 0.16)',
      border: 'rgba(6, 182, 212, 0.45)',
      fill: '#06b6d4',
      stroke: '#0c2340',
    },
    glow: '0 0 22px rgba(6, 182, 212, 0.6)',
    flameShape: {
      // Celestial spirit cartoon flame with sweeping, ethereal wing plumes
      outer: 'M 12.8 1.0 C 11.2 1.8 9.8 3.5 9.0 5.2 C 8.2 6.2 7.2 5.5 6.5 6.2 C 5.2 7.2 4.5 9.5 4.8 11.5 C 5.2 12.8 4.0 12.0 3.2 11.0 C 2.5 12.0 2.2 14.0 2.8 16.5 C 3.5 19.5 7.5 21.5 12.5 21.5 C 17.5 21.5 21.5 19.5 22.0 16.0 C 22.5 12.5 20.8 9.2 19.2 8.0 C 18.2 7.5 17.8 8.8 18.2 10.2 C 18.5 11.2 17.5 10.2 16.2 7.0 C 15.2 4.8 14.5 3.2 13.8 1.5 C 13.4 1.0 13.0 1.0 12.8 1.0 Z',
      inner: 'M 12.5 4.5 C 11.0 6.8 9.8 9.5 9.2 11.5 C 8.2 12.8 7.2 14.2 7.2 16.2 C 7.2 18.8 9.2 20.5 12.5 20.5 C 16.0 20.5 19.2 18.5 19.5 14.8 C 19.8 11.8 18.2 9.0 16.8 10.5 C 15.5 11.8 14.5 11.0 14.5 9.0 C 14.5 7.2 13.5 5.5 12.5 4.5 Z',
    },
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minDays: 60,
    nextAt: 100,
    intensity: 6,
    animation: 'shimmer',
    description: 'Sixty consecutive days: radiant ice-blue precision.',
    colors: {
      primary: '#38bdf8',
      secondary: '#f0f9ff',
      accent: '#0284c7',
      gradient: 'linear-gradient(135deg, #0284c7, #38bdf8, #e0f2fe)',
      text: '#0369a1',
      bg: 'rgba(56, 189, 248, 0.16)',
      border: 'rgba(56, 189, 248, 0.45)',
      fill: '#38bdf8',
      stroke: '#0c2340',
    },
    glow: '0 0 24px rgba(56, 189, 248, 0.65)',
    flameShape: {
      // Pristine crystalline cartoon flame with sculpted diamond plumes
      outer: 'M 12.5 0.8 C 11.0 1.6 9.5 3.2 8.8 5.0 C 8.0 6.0 7.0 5.2 6.2 6.0 C 5.0 7.0 4.2 9.2 4.5 11.2 C 4.8 12.5 3.8 11.8 3.0 10.8 C 2.2 11.8 1.8 13.8 2.5 16.5 C 3.2 19.6 7.2 21.6 12.5 21.6 C 17.8 21.6 21.8 19.6 22.5 16.0 C 23.0 12.5 21.2 9.0 19.5 7.8 C 18.5 7.2 18.0 8.5 18.5 10.0 C 18.8 11.0 17.8 10.0 16.5 6.8 C 15.5 4.5 14.8 3.0 13.8 1.2 C 13.2 0.8 12.8 0.8 12.5 0.8 Z',
      inner: 'M 12.5 4.2 C 10.8 6.5 9.6 9.2 9.0 11.2 C 8.0 12.5 7.0 14.0 7.0 16.0 C 7.0 18.6 9.0 20.5 12.5 20.5 C 16.2 20.5 19.5 18.5 19.8 14.5 C 20.0 11.5 18.5 8.8 17.0 10.2 C 15.6 11.5 14.6 10.8 14.6 8.8 C 14.6 7.0 13.6 5.2 12.5 4.2 Z',
    },
  },
  {
    id: 'legend',
    name: 'Legend',
    minDays: 100,
    nextAt: null,
    intensity: 7,
    animation: 'legend',
    description: '100+ days: pinnacle champion of green living.',
    colors: {
      primary: '#f59e0b',
      secondary: '#fef9c3',
      accent: '#b45309',
      gradient: 'linear-gradient(135deg, #b45309, #f59e0b, #fef08a)',
      text: '#854d0e',
      bg: 'rgba(234, 179, 8, 0.18)',
      border: 'rgba(234, 179, 8, 0.55)',
      fill: '#eab308',
      stroke: '#0c2340',
    },
    glow: '0 0 26px rgba(234, 179, 8, 0.75)',
    flameShape: {
      // Grand Phoenix Emperor Flame: 5 majestic soaring plumes with royal sun-god crown
      outer: 'M 12.5 0.5 C 10.8 1.4 9.2 3.0 8.5 4.8 C 7.8 5.8 6.8 5.0 6.0 5.8 C 4.8 6.8 4.0 9.0 4.2 11.0 C 4.6 12.2 3.5 11.5 2.8 10.5 C 1.8 11.5 1.5 13.5 2.2 16.5 C 3.0 19.8 7.0 21.8 12.5 21.8 C 18.0 21.8 22.0 19.8 22.8 16.0 C 23.2 12.2 21.5 8.8 19.8 7.5 C 18.8 7.0 18.2 8.2 18.8 9.8 C 19.0 10.8 18.0 9.8 16.8 6.5 C 15.8 4.2 15.0 2.8 13.8 1.0 C 13.2 0.5 12.8 0.5 12.5 0.5 Z',
      inner: 'M 12.5 3.8 C 10.6 6.2 9.5 9.0 8.8 11.0 C 7.8 12.2 6.8 13.8 6.8 15.8 C 6.8 18.5 8.8 20.6 12.5 20.6 C 16.5 20.6 19.8 18.5 20.0 14.5 C 20.2 11.2 18.6 8.5 17.2 10.0 C 15.8 11.5 14.8 10.6 14.8 8.6 C 14.8 6.8 13.8 4.8 12.5 3.8 Z',
    },
  },
]

/**
 * Returns the StreakTier corresponding to the given streak day count.
 */
export function getStreakTier(days: number): StreakTier {
  const safeDays = Math.max(0, Math.floor(days || 0))

  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (safeDays >= STREAK_TIERS[i].minDays) {
      return STREAK_TIERS[i]
    }
  }

  return STREAK_TIERS[0]
}

/**
 * Calculates fractional progress (0 to 1) toward the next streak tier.
 * Returns null when at the highest tier (Legend).
 */
export function getProgressToNext(days: number): number | null {
  const safeDays = Math.max(0, Math.floor(days || 0))
  const currentTier = getStreakTier(safeDays)

  if (currentTier.nextAt === null) {
    return null // Max level
  }

  const range = currentTier.nextAt - currentTier.minDays
  if (range <= 0) return 1

  const progress = (safeDays - currentTier.minDays) / range
  return Math.max(0, Math.min(1, progress))
}

/**
 * Returns the number of days required to unlock the next streak tier.
 * Returns null when already at the max tier (Legend).
 */
export function getDaysToNext(days: number): number | null {
  const safeDays = Math.max(0, Math.floor(days || 0))
  const currentTier = getStreakTier(safeDays)

  if (currentTier.nextAt === null) {
    return null
  }

  return Math.max(0, currentTier.nextAt - safeDays)
}
