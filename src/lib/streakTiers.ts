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
      secondary: '#94a3b8',
      gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
      text: '#334155',
      bg: 'rgba(100, 116, 139, 0.12)',
      border: 'rgba(100, 116, 139, 0.28)',
      fill: '#64748b',
      stroke: '#475569',
    },
    glow: 'none',
    flameShape: {
      // Soft, quiet droplet ember (single calm droplet shape)
      outer: 'M12 4.5 C10.8 7.5 8.5 10 8.5 13.5 C8.5 16.5 10.1 19 12 19 C13.9 19 15.5 16.5 15.5 13.5 C15.5 10 13.2 7.5 12 4.5 Z',
      inner: 'M12 9 C11.2 11 10.2 12.8 10.2 14.5 C10.2 16 11 17 12 17 C13 17 13.8 16 13.8 14.5 C13.8 12.8 12.8 11 12 9 Z',
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
    flameShape: {
      // Classic starter flame: clean single-tongue flame with gentle curve
      outer: 'M12 2.5 C11.2 5 9.2 7.2 8.5 9.5 C7.5 12.2 8 15.2 10 17.5 C8.8 16.2 8.5 14.5 9 13 C9.5 11.5 10.8 10.2 11.6 9 C12.4 11.2 14 12.5 14.6 14.2 C15 15.5 14.5 17 13.5 18 C16.8 17.2 18.2 14 17.5 10.8 C16.8 8.2 14.2 5.2 12 2.5 Z',
      inner: 'M12 9.5 L10.5 13.2 H12.6 L11 16.8 L14.2 12.2 H12.2 L13.2 9.5 H12 Z',
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
      secondary: '#dc2626',
      gradient: 'linear-gradient(135deg, #ea580c, #ef4444)',
      text: '#991b1b',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      fill: '#ea580c',
      stroke: '#c2410c',
    },
    glow: '0 0 18px rgba(239, 68, 68, 0.5)',
    flameShape: {
      // Triple-tongued roaring fire: central soaring tongue flanked by two leaping side wings
      outer: 'M12 1.5 C10.8 4.2 8.2 6.2 6.8 9 C5.5 11.5 5.5 14.2 6.8 16.8 C6.2 15 7 13.2 8 12.2 C9.2 11.2 10 12 10.5 13.5 C11 11.2 11.8 9.2 12 7 C12.6 9 13.6 10.5 14.5 9.5 C15.5 8.5 15.2 6.8 16.2 8.2 C18 10.5 18.8 13.5 18 16.8 C19.2 14.5 19.5 11.8 18.2 9 C17 6.2 14.5 3.8 12 1.5 Z',
      inner: 'M12 7 C11 9.2 9.5 11 9.8 13.2 C10.5 12.5 11.2 11.8 12 10.5 C12.8 12 13.8 12.5 14.4 11.8 C14 10.2 13.2 8.8 12 7 Z',
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
    flameShape: {
      // Four-crested aggressive crown fire with sharp dancing spurs
      outer: 'M12 1.2 C11 3.8 8.2 5.5 6.5 8.5 C4.8 11.5 4.8 14.5 6.5 17.2 C5.8 15.2 6.8 13.2 8 12.2 C9.2 11.2 10 12.2 10.5 13.8 C11 11.2 11.8 8.8 12 6 C12.6 8.5 13.5 10.2 14.5 9 C15.5 7.8 15.2 5.8 16.5 7.8 C18 10 18.2 8.8 19.2 10.8 C20.5 13.2 20 16.5 18.5 19 C19.8 16.5 20.2 12.8 18.8 9.8 C17.5 6.5 14.8 3.8 12 1.2 Z',
      inner: 'M12 6.2 L10 10.8 H12.5 L10.8 15.5 L14.5 10.5 H12.2 L13.5 6.2 Z',
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
    flameShape: {
      // Mystical sweeping celestial flame with flowing wings and cosmic aura
      outer: 'M12 1 C10.5 3.8 7.2 6 5.5 9.5 C3.8 12.8 4.2 16.5 6.5 19.5 C5.8 17.2 6.8 14.8 8.2 13.5 C9.8 12 10.5 13.5 11.2 15 C11.8 12 12.5 9.5 12 6.5 C12.8 9 14 10.8 15.2 9.5 C16.5 8.2 16 6 17.2 8 C19.2 10.8 20.5 14 19.2 17.5 C20.5 14.8 20.8 11.5 19.2 8.5 C17.8 5.2 14.8 3 12 1 Z',
      inner: 'M12 7 L10.2 11.5 H12.6 L10.8 16 L14.5 11.2 H12.2 L13.5 7 Z',
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
    flameShape: {
      // Crystalline 5-point royal flame: faceted diamond-crested tips with sharp royal spikes
      outer: 'M12 0.8 L10.2 5.2 L7.5 4.5 L8.5 8.8 L5.2 9.5 L7.2 13.8 C6.2 15.5 6.5 17.8 8 19.5 C9.5 18 10 16 10.8 14.2 L12 16.5 L13.2 14.2 C14 16 14.5 18 16 19.5 C17.5 17.8 17.8 15.5 16.8 13.8 L18.8 9.5 L15.5 8.8 L16.5 4.5 L13.8 5.2 Z',
      inner: 'M12 6.5 L9.8 11.2 H12.5 L10.8 16 L14.5 10.8 H12.2 L13.5 6.5 Z',
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
    flameShape: {
      // Grand Phoenix Emperor Flame: 5 majestic soaring plumes with royal crown points
      outer: 'M12 0.5 C10.8 3.2 9.2 5 7 6.2 L8 9.2 C6 9.8 4.6 11.8 4 14.5 C5 13.5 6.2 13 7.5 13.5 C8.5 14 9.2 15.2 10 16.8 C10.6 13.5 11.4 10.2 12 6.5 C12.6 10.2 13.4 13.5 14 16.8 C14.8 15.2 15.5 14 16.5 13.5 C17.8 13 19 13.5 20 14.5 C19.4 11.8 18 9.8 16 9.2 L17 6.2 C14.8 5 13.2 3.2 12 0.5 Z',
      inner: 'M12 5 L9.5 10.8 H12.8 L10.2 17.2 L15.2 10.2 H12.4 L14 5 Z',
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
