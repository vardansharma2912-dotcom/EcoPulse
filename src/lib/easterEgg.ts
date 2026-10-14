/**
 * Easter Egg logic: Logo 5-tap counter and Konami code sequence.
 */

export const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

let globalEasterEggFired = false

export function isGlobalEasterEggFired(): boolean {
  return globalEasterEggFired
}

export function setGlobalEasterEggFired(fired = true): void {
  globalEasterEggFired = fired
}

export function _resetEasterEggForTesting(): void {
  globalEasterEggFired = false
}

/**
 * Tracks taps on the navbar logo.
 * Fires once per page load if 5 taps occur within a 2-second window.
 */
export class LogoTapCounter {
  private taps: number[] = []
  private fired = false
  private windowMs: number
  private requiredTaps: number
  private onTrigger: () => void

  constructor(onTrigger: () => void, windowMs = 2000, requiredTaps = 5) {
    this.onTrigger = onTrigger
    this.windowMs = windowMs
    this.requiredTaps = requiredTaps
  }

  /**
   * Registers a tap at a given timestamp.
   * Returns true if this tap caused the Easter egg to trigger.
   */
  registerTap(timestamp: number = Date.now()): boolean {
    if (this.fired || globalEasterEggFired) return false

    // Filter taps to only those within the sliding window
    this.taps = [...this.taps.filter((t) => timestamp - t <= this.windowMs), timestamp]

    if (this.taps.length >= this.requiredTaps) {
      this.fired = true
      globalEasterEggFired = true
      this.onTrigger()
      return true
    }

    return false
  }

  isFired(): boolean {
    return this.fired || globalEasterEggFired
  }

  getTapCount(): number {
    return this.taps.length
  }

  reset(): void {
    this.taps = []
    this.fired = false
  }
}
