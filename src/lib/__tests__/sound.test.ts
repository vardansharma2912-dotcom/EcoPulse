import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  AVAILABLE_TONES,
  DEFAULT_REMINDER_TONE,
  DEFAULT_NOTIFICATION_TONE,
  playTone,
  stopAllTones,
  unlockAudio,
  playReminderDue,
  playSnooze,
  playTaskComplete,
  playStreakTierUp,
  triggerVibration,
  _resetAudioContextForTesting,
} from '../sound'

describe('Sound Engine (Web Audio Synthesis)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    _resetAudioContextForTesting()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    _resetAudioContextForTesting()
  })

  it('provides at least 8 distinct tones including Silent', () => {
    expect(AVAILABLE_TONES.length).toBeGreaterThanOrEqual(8)
    const ids = AVAILABLE_TONES.map((t) => t.id)
    expect(ids).toContain('Chime')
    expect(ids).toContain('Droplet')
    expect(ids).toContain('Leaf')
    expect(ids).toContain('Pulse')
    expect(ids).toContain('Spark')
    expect(ids).toContain('Zen')
    expect(ids).toContain('Alert')
    expect(ids).toContain('Silent')
  })

  it('has valid defaults for reminders and notifications', () => {
    expect(DEFAULT_REMINDER_TONE).toBe('Chime')
    expect(DEFAULT_NOTIFICATION_TONE).toBe('Droplet')
  })

  it('fails gracefully and never throws when AudioContext is undefined or suspended', () => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    _resetAudioContextForTesting()

    expect(() => {
      unlockAudio()
      playTone('Chime', { volume: 70 })
      playTone('Silent', { volume: 70 })
      playReminderDue('Leaf', { volume: 50 })
      playSnooze({ volume: 50 })
      playTaskComplete({ volume: 50 })
      playStreakTierUp({ volume: 50 })
      stopAllTones()
    }).not.toThrow()
  })

  it('does not play when muted or volume is 0', () => {
    expect(() => {
      playTone('Chime', { volume: 0 })
      playTone('Chime', { muted: true })
      playSnooze({ volume: 0 })
      playTaskComplete({ muted: true })
      playStreakTierUp({ volume: 0 })
    }).not.toThrow()
  })

  it('handles mock AudioContext properly without errors', () => {
    const mockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
    }

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      context: { currentTime: 0 },
    }

    class MockAudioContext {
      state = 'running'
      currentTime = 0
      destination = {}
      createGain = () => mockGainNode
      createOscillator = () => ({ ...mockOscillator, context: { currentTime: 0 } })
      resume = vi.fn().mockResolvedValue(undefined)
    }

    vi.stubGlobal('window', {
      AudioContext: MockAudioContext,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    _resetAudioContextForTesting()

    expect(() => {
      unlockAudio()
      playTone('Chime', { volume: 80 })
      playTone('Droplet', { volume: 80 })
      playTone('Leaf', { volume: 80 })
      playTone('Pulse', { volume: 80 })
      playTone('Spark', { volume: 80 })
      playTone('Zen', { volume: 80 })
      playTone('Alert', { volume: 80 })
      playTone('Silent', { volume: 80 })
      playSnooze({ volume: 80 })
      playTaskComplete({ volume: 80 })
      playStreakTierUp({ volume: 80 })
      stopAllTones()
    }).not.toThrow()
  })

  it('safely invokes vibration when supported or fails silently when missing', () => {
    const mockVibrate = vi.fn().mockReturnValue(true)
    vi.stubGlobal('navigator', {
      vibrate: mockVibrate,
    })

    expect(() => {
      triggerVibration(200)
      triggerVibration([100, 50, 100])
    }).not.toThrow()

    expect(mockVibrate).toHaveBeenCalledWith(200)
    expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100])
  })
})
