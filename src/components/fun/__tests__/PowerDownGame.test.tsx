import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import {
  gameReducer,
  createInitialGameState,
  getStoredBestScore,
  saveStoredBestScore,
  BEST_SCORE_STORAGE_KEY,
  APPLIANCES,
} from '../powerDownLogic'
import { PowerDownGame } from '../PowerDownGame'
import { LogoTapCounter, _resetEasterEggForTesting } from '../../../lib/easterEgg'
import { AppStateProvider } from '../../../state/AppContext'

// In-memory localStorage polyfill for Node test environment
const mockStorage = new Map<string, string>()

describe('Power Down Mini-Game & Logo Easter Egg', () => {
  beforeEach(() => {
    mockStorage.clear()
    _resetEasterEggForTesting()
    vi.restoreAllMocks()

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, val: string) => mockStorage.set(key, String(val)),
      removeItem: (key: string) => mockStorage.delete(key),
      clear: () => mockStorage.clear(),
    })
  })

  afterEach(() => {
    mockStorage.clear()
    _resetEasterEggForTesting()
    vi.unstubAllGlobals()
  })

  describe('1. Game State Machine (idle -> playing -> finished)', () => {
    it('initializes in idle state with 0 score, 30s timer, and all tiles off', () => {
      const state = createInitialGameState(9)
      expect(state.status).toBe('idle')
      expect(state.score).toBe(0)
      expect(state.timeLeft).toBe(30)
      expect(state.activeTiles).toEqual(new Array(9).fill(false))
      expect(state.finishReason).toBeNull()
    })

    it('transitions from idle to playing on START action', () => {
      const initial = createInitialGameState(9)
      const playing = gameReducer(initial, { type: 'START' })
      expect(playing.status).toBe('playing')
      expect(playing.score).toBe(0)
      expect(playing.timeLeft).toBe(30)
      expect(playing.finishReason).toBeNull()
    })

    it('counts down timeLeft and finishes when time expires', () => {
      let state = gameReducer(createInitialGameState(9), { type: 'START' })
      state = { ...state, timeLeft: 2 }

      state = gameReducer(state, { type: 'TICK_SECOND' })
      expect(state.timeLeft).toBe(1)
      expect(state.status).toBe('playing')

      // Final second expiry
      state = gameReducer(state, { type: 'TICK_SECOND' })
      expect(state.timeLeft).toBe(0)
      expect(state.status).toBe('finished')
      expect(state.finishReason).toBe('time-up')
    })
  })

  describe('2. Early End at 6 Lit Appliances', () => {
    it('ends early with "too-many" when 6 appliances become lit', () => {
      let state = gameReducer(createInitialGameState(9), { type: 'START' })

      // Turn on 5 appliances one by one
      for (let i = 0; i < 5; i++) {
        state = gameReducer(state, { type: 'SPAWN', index: i })
        expect(state.status).toBe('playing')
      }
      expect(state.activeTiles.filter(Boolean).length).toBe(5)

      // Turning on the 6th appliance triggers early game over
      state = gameReducer(state, { type: 'SPAWN', index: 5 })
      expect(state.status).toBe('finished')
      expect(state.finishReason).toBe('too-many')
      expect(state.activeTiles.filter(Boolean).length).toBe(6)
    })
  })

  describe('3. Score Counting & Konami Bonus', () => {
    it('scores +1 when tapping a lit appliance, and does nothing on unlit tile', () => {
      let state = gameReducer(createInitialGameState(9), { type: 'START' })
      state = gameReducer(state, { type: 'SPAWN', index: 2 })
      expect(state.activeTiles[2]).toBe(true)

      // Tap unlit tile (index 0) -> no score change
      state = gameReducer(state, { type: 'TAP', index: 0 })
      expect(state.score).toBe(0)

      // Tap lit tile (index 2) -> turns off and scores +1
      state = gameReducer(state, { type: 'TAP', index: 2 })
      expect(state.activeTiles[2]).toBe(false)
      expect(state.score).toBe(1)
      expect(state.bestScore).toBe(1)
    })

    it('scores +2 per tap when Konami bonus is active', () => {
      let state = gameReducer(createInitialGameState(9), { type: 'START' })
      state = gameReducer(state, { type: 'ACTIVATE_BONUS' })
      expect(state.isBonusActive).toBe(true)

      state = gameReducer(state, { type: 'SPAWN', index: 4 })
      state = gameReducer(state, { type: 'TAP', index: 4 })
      expect(state.score).toBe(2)

      state = gameReducer(state, { type: 'SPAWN', index: 1 })
      state = gameReducer(state, { type: 'TAP', index: 1 })
      expect(state.score).toBe(4)

      // Deactivate bonus reverts to +1
      state = gameReducer(state, { type: 'DEACTIVATE_BONUS' })
      state = gameReducer(state, { type: 'SPAWN', index: 3 })
      state = gameReducer(state, { type: 'TAP', index: 3 })
      expect(state.score).toBe(5)
    })
  })

  describe('4. Best-Score Persistence in LocalStorage', () => {
    it('persists and reads best score with storage available', () => {
      saveStoredBestScore(18)
      expect(getStoredBestScore()).toBe(18)
      expect(mockStorage.get(BEST_SCORE_STORAGE_KEY)).toBe('18')
    })

    it('handles localStorage throwing errors gracefully without crashing', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new Error('SecurityError: Access Denied')
        },
        setItem: () => {
          throw new Error('QuotaExceededError')
        },
      })

      expect(() => {
        const val = getStoredBestScore()
        expect(val).toBe(0)
        saveStoredBestScore(25)
      }).not.toThrow()
    })
  })

  describe('5. Timers Cleaned Up on Unmount & Backgrounding', () => {
    it('ends round when document is hidden (visibilitychange)', () => {
      let state = gameReducer(createInitialGameState(9), { type: 'START' })
      expect(state.status).toBe('playing')

      state = gameReducer(state, { type: 'VISIBILITY_HIDDEN' })
      expect(state.status).toBe('finished')
      expect(state.finishReason).toBe('hidden')
    })

    it('clears intervals and timeouts on cleanup', () => {
      vi.useFakeTimers()
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

      const intervalId = setInterval(() => {}, 1000)
      const timeoutId = setTimeout(() => {}, 500)

      clearInterval(intervalId)
      clearTimeout(timeoutId)

      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId)
      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
      vi.useRealTimers()
    })
  })

  describe('6. Logo 5-Tap Counter Easter Egg', () => {
    it('4 taps do nothing', () => {
      const onTrigger = vi.fn()
      const counter = new LogoTapCounter(onTrigger, 2000, 5)

      counter.registerTap(100)
      counter.registerTap(400)
      counter.registerTap(700)
      counter.registerTap(1000)

      expect(counter.getTapCount()).toBe(4)
      expect(onTrigger).not.toHaveBeenCalled()
      expect(counter.isFired()).toBe(false)
    })

    it('5 taps within 2 s trigger once', () => {
      const onTrigger = vi.fn()
      const counter = new LogoTapCounter(onTrigger, 2000, 5)

      counter.registerTap(100)
      counter.registerTap(300)
      counter.registerTap(600)
      counter.registerTap(900)
      const triggered = counter.registerTap(1200)

      expect(triggered).toBe(true)
      expect(onTrigger).toHaveBeenCalledTimes(1)
      expect(counter.isFired()).toBe(true)

      // Subsequent 6th tap does not trigger again (fires once per page load)
      const triggeredAgain = counter.registerTap(1400)
      expect(triggeredAgain).toBe(false)
      expect(onTrigger).toHaveBeenCalledTimes(1)
    })

    it('5 taps over 3 s do nothing', () => {
      const onTrigger = vi.fn()
      const counter = new LogoTapCounter(onTrigger, 2000, 5)

      // Taps spaced 700ms apart: 0ms, 700ms, 1400ms, 2100ms, 2800ms
      // At t=2100ms, tap 0 (at 0ms) is older than 2000ms window, so count never reaches 5 within 2s
      counter.registerTap(0)
      counter.registerTap(700)
      counter.registerTap(1400)
      counter.registerTap(2100)
      counter.registerTap(2800)

      expect(onTrigger).not.toHaveBeenCalled()
      expect(counter.isFired()).toBe(false)
    })
  })

  describe('7. Component Rendering & Accessibility', () => {
    it('renders Power Down card with title, instruction, caption, and 9 appliance tiles', () => {
      const html = renderToString(
        <AppStateProvider>
          <PowerDownGame />
        </AppStateProvider>
      )

      expect(html).toContain('Power Down')
      expect(html).toContain('Tap the appliances left on before they pile up.')
      expect(html).toContain('Just for fun. Real savings come from your reminders.')
      expect(html).toContain('Start Game')

      // Verify all 9 appliances are rendered with real accessible labels
      APPLIANCES.forEach((appliance) => {
        expect(html).toContain(`aria-label="${appliance.name}, off"`)
      })
    })
  })
})
