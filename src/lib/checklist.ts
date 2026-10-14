import { CHECKLIST_FIRST_SEEN_KEY } from './storage'

export const CALC_VISITED_KEY = 'ecopulse_calc_visited_v1'
export const CHECKLIST_EXPIRY_DAYS = 3
export const CHECKLIST_EXPIRY_MS = CHECKLIST_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 3 days in milliseconds

/**
 * Returns or initializes the timestamp when the Getting Started Checklist was first seen/created.
 * If pre-existing reminder data exists with an earlier createdAt date, that is respected as the fallback.
 */
export function getChecklistFirstSeenTimestamp(earliestCreatedAtFallback?: string): number {
  if (typeof localStorage === 'undefined') return Date.now()
  try {
    const stored = localStorage.getItem(CHECKLIST_FIRST_SEEN_KEY)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }

    let initialTimestamp = Date.now()
    if (earliestCreatedAtFallback) {
      const fallbackTime = new Date(earliestCreatedAtFallback).getTime()
      if (!isNaN(fallbackTime) && fallbackTime > 0) {
        initialTimestamp = Math.min(initialTimestamp, fallbackTime)
      }
    }

    localStorage.setItem(CHECKLIST_FIRST_SEEN_KEY, initialTimestamp.toString())
    return initialTimestamp
  } catch {
    return Date.now()
  }
}

/**
 * Checks whether the checklist has passed the 3-day lifespan.
 */
export function isChecklistExpired(firstSeenTimestamp: number, now: number = Date.now()): boolean {
  return now - firstSeenTimestamp >= CHECKLIST_EXPIRY_MS
}
