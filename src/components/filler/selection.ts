import type {
  FillerDefinition,
  FillerPage,
  FillerContext,
  SelectionResult,
} from './types'
import { FILLER_CATALOG } from './fillerCatalog'

export const MIN_GAP_THRESHOLD = 160
export const BREATHING_ROOM = 16
export const STACKED_GAP = 16

/**
 * Pure selection algorithm for adaptive filler slots.
 *
 * Rules:
 * - Gap < 160 px -> null (no filler)
 * - Size tiers:
 *    Tier S:  160 <= gap < 240
 *    Tier M:  240 <= gap < 380
 *    Tier L:  380 <= gap < 560
 *    Tier XL: 560 <= gap (two stacked Tier M cards with gap-4; max 792 px)
 * - Gap > 792 px -> null (no filler stretched)
 * - Priority first, then closest idealHeight to target
 * - Never duplicate the same filler on a page
 * - All guards (canRender) must pass
 */
export function selectFiller(
  page: FillerPage,
  gap: number,
  context: FillerContext,
  catalog: FillerDefinition[] = FILLER_CATALOG
): SelectionResult {
  // 1. Minimum gap threshold
  if (gap < MIN_GAP_THRESHOLD) {
    return null
  }

  const targetHeight = gap - BREATHING_ROOM

  // --- Tier S: 160 - 240 px ---
  if (gap >= 160 && gap < 240) {
    const candidates = catalog.filter(
      (f) =>
        f.tier === 'S' &&
        f.pages.includes(page) &&
        f.canRender(context) &&
        f.minHeight <= targetHeight &&
        targetHeight <= f.maxHeight
    )

    if (candidates.length === 0) return null

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return (
        Math.abs(a.idealHeight - targetHeight) -
        Math.abs(b.idealHeight - targetHeight)
      )
    })

    return {
      type: 'single',
      filler: candidates[0],
      height: targetHeight,
    }
  }

  // --- Tier M: 240 - 380 px ---
  if (gap >= 240 && gap < 380) {
    const candidates = catalog.filter(
      (f) =>
        f.tier === 'M' &&
        f.pages.includes(page) &&
        f.canRender(context) &&
        f.minHeight <= targetHeight &&
        targetHeight <= f.maxHeight
    )

    if (candidates.length === 0) return null

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return (
        Math.abs(a.idealHeight - targetHeight) -
        Math.abs(b.idealHeight - targetHeight)
      )
    })

    return {
      type: 'single',
      filler: candidates[0],
      height: targetHeight,
    }
  }

  // --- Tier L: 380 - 560 px ---
  if (gap >= 380 && gap < 560) {
    const candidates = catalog.filter(
      (f) =>
        f.tier === 'L' &&
        f.pages.includes(page) &&
        f.canRender(context) &&
        f.minHeight <= targetHeight &&
        targetHeight <= f.maxHeight
    )

    if (candidates.length === 0) return null

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return (
        Math.abs(a.idealHeight - targetHeight) -
        Math.abs(b.idealHeight - targetHeight)
      )
    })

    return {
      type: 'single',
      filler: candidates[0],
      height: targetHeight,
    }
  }

  // --- Tier XL: 560+ px ---
  // Combine two Tier M fillers stacked with gap-4 (16 px), or render nothing
  if (gap >= 560) {
    const availableTotal = gap - BREATHING_ROOM - STACKED_GAP
    const h1 = Math.floor(availableTotal / 2)
    const h2 = availableTotal - h1

    const candidates = catalog.filter(
      (f) =>
        f.tier === 'M' &&
        f.pages.includes(page) &&
        f.canRender(context)
    )

    // Need at least 2 distinct Tier M fillers
    if (candidates.length < 2) {
      return null
    }

    candidates.sort((a, b) => b.priority - a.priority)
    const f1 = candidates[0]
    const f2 = candidates[1]

    // Both cards must fit within their minHeight and maxHeight
    if (
      f1.minHeight <= h1 &&
      h1 <= f1.maxHeight &&
      f2.minHeight <= h2 &&
      h2 <= f2.maxHeight
    ) {
      return {
        type: 'double',
        fillers: [f1, f2],
        heights: [h1, h2],
      }
    }

    // Exceeds max Tier M height (e.g. gap = 900 px) -> do not stretch, render nothing
    return null
  }

  return null
}
