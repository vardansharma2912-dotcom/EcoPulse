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
      secondary: '#94a3b8',
      gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
      text: '#334155',
      bg: 'rgba(100, 116, 139, 0.12)',
      border: 'rgba(100, 116, 139, 0.28)',
      fill: '#64748b',
      stroke: '#475569',
    },
    glow: 'none',
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
      primary: '#059669',
      secondary: '#34d399',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      text: '#065f46',
      bg: 'rgba(16, 185, 129, 0.14)',
      border: 'rgba(16, 185, 129, 0.35)',
      fill: '#10b981',
      stroke: '#047857',
    },
    glow: '0 0 12px rgba(16, 185, 129, 0.35)',
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
      primary: '#d97706',
      secondary: '#fbbf24',
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      text: '#92400e',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      fill: '#f59e0b',
      stroke: '#b45309',
    },
    glow: '0 0 16px rgba(245, 158, 11, 0.45)',
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
      secondary: '#dc2626',
      gradient: 'linear-gradient(135deg, #ea580c, #ef4444)',
      text: '#991b1b',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      fill: '#ea580c',
      stroke: '#c2410c',
    },
    glow: '0 0 18px rgba(239, 68, 68, 0.5)',
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
      secondary: '#7c3aed',
      accent: '#9333ea',
      gradient: 'linear-gradient(135deg, #c026d3, #9333ea, #7c3aed)',
      text: '#701a75',
      bg: 'rgba(192, 38, 211, 0.15)',
      border: 'rgba(192, 38, 211, 0.42)',
      fill: '#c026d3',
      stroke: '#86198f',
    },
    glow: '0 0 20px rgba(192, 38, 211, 0.55)',
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
      secondary: '#8b5cf6',
      accent: '#10b981',
      gradient: 'linear-gradient(135deg, #06b6d4, #14b8a6, #8b5cf6)',
      text: '#0e7490',
      bg: 'rgba(6, 182, 212, 0.16)',
      border: 'rgba(6, 182, 212, 0.45)',
      fill: '#06b6d4',
      stroke: '#0891b2',
    },
    glow: '0 0 22px rgba(6, 182, 212, 0.6)',
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
      secondary: '#e2e8f0',
      accent: '#64748b',
      gradient: 'linear-gradient(135deg, #64748b, #38bdf8, #f8fafc)',
      text: '#0369a1',
      bg: 'rgba(56, 189, 248, 0.16)',
      border: 'rgba(56, 189, 248, 0.45)',
      fill: '#38bdf8',
      stroke: '#0284c7',
    },
    glow: '0 0 24px rgba(56, 189, 248, 0.65)',
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
      primary: '#eab308',
      secondary: '#f59e0b',
      accent: '#fef08a',
      gradient: 'linear-gradient(135deg, #f59e0b, #eab308, #fde047, #d97706)',
      text: '#854d0e',
      bg: 'rgba(234, 179, 8, 0.18)',
      border: 'rgba(234, 179, 8, 0.55)',
      fill: '#eab308',
      stroke: '#a16207',
    },
    glow: '0 0 26px rgba(234, 179, 8, 0.75)',
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
