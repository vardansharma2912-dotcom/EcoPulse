/**
 * Web Audio Sound Engine for EcoPulse
 * Pure procedural synthesis with zero audio files or assets.
 */

export type ToneId =
  | 'Chime'
  | 'Droplet'
  | 'Leaf'
  | 'Pulse'
  | 'Spark'
  | 'Zen'
  | 'Alert'
  | 'Silent'

export interface ToneDefinition {
  id: ToneId
  name: string
  description: string
  durationSec: number
}

export const AVAILABLE_TONES: ToneDefinition[] = [
  {
    id: 'Chime',
    name: 'Chime',
    description: 'Two-note rising bell with a gentle resonance',
    durationSec: 0.8,
  },
  {
    id: 'Droplet',
    name: 'Droplet',
    description: 'Single soft water-drop pluck',
    durationSec: 0.5,
  },
  {
    id: 'Leaf',
    name: 'Leaf',
    description: 'Gentle airy marimba notes with wooden warmth',
    durationSec: 0.9,
  },
  {
    id: 'Pulse',
    name: 'Pulse',
    description: 'Soft double pulse aligned with the EcoPulse beat',
    durationSec: 0.6,
  },
  {
    id: 'Spark',
    name: 'Spark',
    description: 'Bright quick rising arpeggio',
    durationSec: 0.7,
  },
  {
    id: 'Zen',
    name: 'Zen',
    description: 'Low warm singing bowl with a lingering decay',
    durationSec: 1.4,
  },
  {
    id: 'Alert',
    name: 'Alert',
    description: 'Firmer triple tone for high-priority reminders',
    durationSec: 0.9,
  },
  {
    id: 'Silent',
    name: 'Silent',
    description: 'No audio tone (vibration only on supported devices)',
    durationSec: 0.0,
  },
]

export const DEFAULT_REMINDER_TONE: ToneId = 'Chime'
export const DEFAULT_NOTIFICATION_TONE: ToneId = 'Droplet'

// Single lazily-instantiated AudioContext
let audioCtx: AudioContext | null = null
let unlocked = false
let activeNodes: Array<{ stop: (fadeTime?: number) => void }> = []

export function _resetAudioContextForTesting(): void {
  audioCtx = null
  unlocked = false
  activeNodes = []
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass()
      }
    } catch {
      audioCtx = null
    }
  }
  return audioCtx
}

/**
 * Returns true if Web Audio is currently supported and running without gesture lock.
 */
export function isAudioReady(): boolean {
  if (!audioCtx) return false
  return audioCtx.state === 'running'
}

/**
 * Unlocks the Web Audio context on the first user interaction.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      unlocked = true
    }).catch(() => {
      // Fail silently if browser policy blocks
    })
  } else if (ctx.state === 'running') {
    unlocked = true
  }
}

/**
 * Attaches a one-time global user gesture listener to unlock audio.
 */
export function initAudioGestureUnlock(): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleGesture = () => {
    unlockAudio()
    if (unlocked || (audioCtx && audioCtx.state === 'running')) {
      cleanup()
    }
  }

  const cleanup = () => {
    window.removeEventListener('click', handleGesture, true)
    window.removeEventListener('keydown', handleGesture, true)
    window.removeEventListener('touchstart', handleGesture, true)
  }

  window.addEventListener('click', handleGesture, { capture: true, passive: true })
  window.addEventListener('keydown', handleGesture, { capture: true, passive: true })
  window.addEventListener('touchstart', handleGesture, { capture: true, passive: true })

  return cleanup
}

/**
 * Normalizes volume 0-100 into a safe gain 0.0 - 0.28.
 */
function toSafeGain(volume: number = 70): number {
  const clamped = Math.max(0, Math.min(100, volume))
  if (clamped <= 0) return 0
  // Peak max gain is 0.28 to prevent any ear fatigue or clipping
  return (clamped / 100) * 0.28
}

/**
 * Stops all currently active tones immediately with a click-free 25ms fade-out.
 */
export function stopAllTones(): void {
  const nodes = [...activeNodes]
  activeNodes = []
  nodes.forEach((item) => {
    try {
      item.stop(0.025)
    } catch {
      // Ignore
    }
  })
}

interface PlayToneOptions {
  volume?: number // 0 - 100
  muted?: boolean
}

/**
 * Plays one of the defined synthesised tones.
 * Never throws an error if Web Audio is suspended or disabled.
 */
export function playTone(
  toneId: ToneId | string,
  options: PlayToneOptions = {}
): void {
  const { volume = 70, muted = false } = options
  if (muted || volume <= 0 || toneId === 'Silent') return

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  if (ctx.state !== 'running') return

  const masterGain = toSafeGain(volume)
  if (masterGain <= 0) return

  try {
    switch (toneId) {
      case 'Droplet':
        synthDroplet(ctx, masterGain)
        break
      case 'Leaf':
        synthLeaf(ctx, masterGain)
        break
      case 'Pulse':
        synthPulse(ctx, masterGain)
        break
      case 'Spark':
        synthSpark(ctx, masterGain)
        break
      case 'Zen':
        synthZen(ctx, masterGain)
        break
      case 'Alert':
        synthAlert(ctx, masterGain)
        break
      case 'Chime':
      default:
        synthChime(ctx, masterGain)
        break
    }
  } catch {
    // Fail silently
  }
}

// -------------------------------------------------------------
// EVENT SOUNDS (Quieter and shorter than reminder tones)
// -------------------------------------------------------------

/**
 * Plays the reminder due sound (uses the reminder's tone or the default tone).
 */
export function playReminderDue(
  toneId: ToneId | string = DEFAULT_REMINDER_TONE,
  options: PlayToneOptions = {}
): void {
  playTone(toneId, options)
}

/**
 * Plays a soft descending blip when snoozing a reminder.
 */
export function playSnooze(options: PlayToneOptions = {}): void {
  const { volume = 70, muted = false } = options
  if (muted || volume <= 0) return
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return

  const gain = toSafeGain(volume) * 0.75 // 25% softer
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(460, now)
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.22)

    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
    trackNode(osc, gainNode, now + 0.25)
  } catch {
    // Fail silently
  }
}

/**
 * Plays a tiny soft click for UI interactions or mini-game taps.
 */
export function playClick(options: PlayToneOptions = {}): void {
  const { volume = 60, muted = false } = options
  if (muted || volume <= 0) return
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return

  const gain = toSafeGain(volume) * 0.45
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(480, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035)

    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.004)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.045)
    trackNode(osc, gainNode, now + 0.045)
  } catch {
    // Fail silently
  }
}

/**
 * Plays a short upbeat two-note success chime when completing a habit.
 */
export function playTaskComplete(options: PlayToneOptions = {}): void {
  const { volume = 70, muted = false } = options
  if (muted || volume <= 0) return
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return

  const gain = toSafeGain(volume) * 0.8
  try {
    const now = ctx.currentTime
    // Note 1: E5 (659.25 Hz)
    createToneNote(ctx, 659.25, 'triangle', now, 0.16, gain * 0.75)
    // Note 2: B5 (987.77 Hz)
    createToneNote(ctx, 987.77, 'sine', now + 0.1, 0.28, gain)
  } catch {
    // Fail silently
  }
}

/**
 * Plays an energetic ascending celebratory sweep on streak tier upgrade.
 */
export function playStreakTierUp(options: PlayToneOptions = {}): void {
  const { volume = 70, muted = false } = options
  if (muted || volume <= 0) return
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return

  const gain = toSafeGain(volume) * 0.85
  try {
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      createToneNote(ctx, freq, 'triangle', now + idx * 0.08, 0.28, gain * 0.85)
    })
  } catch {
    // Fail silently
  }
}

// -------------------------------------------------------------
// VIBRATION HELPER
// -------------------------------------------------------------

export function triggerVibration(pattern: number | number[] = 200): boolean {
  if (typeof navigator === 'undefined') return false
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      return navigator.vibrate(pattern)
    }
  } catch {
    // Fail silently
  }
  return false
}

// -------------------------------------------------------------
// TONE SYNTHESIZERS (Procedural oscillators + envelopes)
// -------------------------------------------------------------

function trackNode(
  osc: OscillatorNode,
  gainNode: GainNode,
  endTime: number
): void {
  const item = {
    stop: (fadeTime = 0.02) => {
      try {
        const t = osc.context.currentTime
        gainNode.gain.cancelScheduledValues(t)
        gainNode.gain.setValueAtTime(gainNode.gain.value, t)
        gainNode.gain.linearRampToValueAtTime(0.0001, t + fadeTime)
        osc.stop(t + fadeTime + 0.005)
      } catch {
        // Ignore
      }
    },
  }
  activeNodes.push(item)
  setTimeout(() => {
    const idx = activeNodes.indexOf(item)
    if (idx !== -1) activeNodes.splice(idx, 1)
  }, Math.max(0, (endTime - osc.context.currentTime) * 1000 + 100))
}

function createToneNote(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  peakGain: number
): void {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)

  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.015)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
  trackNode(osc, gainNode, startTime + duration)
}

/**
 * 1. Chime: Two-note rising bell (C5: 523.25 Hz -> G5: 783.99 Hz)
 */
function synthChime(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  createToneNote(ctx, 523.25, 'sine', now, 0.45, gain * 0.9)
  createToneNote(ctx, 783.99, 'sine', now + 0.22, 0.55, gain)
}

/**
 * 2. Droplet: Soft pitch-drop pluck with resonant acoustic swell
 */
function synthDroplet(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08)
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35)

  gainNode.gain.setValueAtTime(0.001, now)
  gainNode.gain.linearRampToValueAtTime(gain * 0.95, now + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.4)
  trackNode(osc, gainNode, now + 0.4)
}

/**
 * 3. Leaf: Airy marimba harmony (dual pleasant frequencies)
 */
function synthLeaf(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  // Warm marimba notes: E5 (659.25 Hz), A5 (880 Hz), C#6 (1108.73 Hz)
  createToneNote(ctx, 659.25, 'triangle', now, 0.4, gain * 0.8)
  createToneNote(ctx, 880, 'sine', now + 0.14, 0.45, gain * 0.85)
  createToneNote(ctx, 1108.73, 'triangle', now + 0.28, 0.55, gain * 0.9)
}

/**
 * 4. Pulse: Dual rhythmic pulse (520 Hz)
 */
function synthPulse(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  createToneNote(ctx, 520, 'sine', now, 0.16, gain * 0.9)
  createToneNote(ctx, 520, 'sine', now + 0.2, 0.26, gain)
}

/**
 * 5. Spark: Fast bright arpeggio (C5, G5, C6)
 */
function synthSpark(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  createToneNote(ctx, 523.25, 'triangle', now, 0.16, gain * 0.7)
  createToneNote(ctx, 659.25, 'sine', now + 0.09, 0.18, gain * 0.8)
  createToneNote(ctx, 783.99, 'triangle', now + 0.18, 0.22, gain * 0.85)
  createToneNote(ctx, 1046.5, 'sine', now + 0.27, 0.38, gain)
}

/**
 * 6. Zen: Low singing bowl (220 Hz with subtle octave overtone)
 */
function synthZen(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  // Fundamental 220Hz (A3)
  createToneNote(ctx, 220, 'sine', now, 1.3, gain * 0.95)
  // Harmonic overtone 440Hz (A4)
  createToneNote(ctx, 440, 'triangle', now + 0.01, 1.1, gain * 0.4)
}

/**
 * 7. Alert: Triple firm ascending chime (D5, E5, G5)
 */
function synthAlert(ctx: AudioContext, gain: number): void {
  const now = ctx.currentTime
  createToneNote(ctx, 587.33, 'triangle', now, 0.2, gain * 0.9)
  createToneNote(ctx, 659.25, 'triangle', now + 0.16, 0.2, gain * 0.95)
  createToneNote(ctx, 783.99, 'sine', now + 0.32, 0.45, gain)
}
