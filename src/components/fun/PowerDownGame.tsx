import React, { useEffect, useRef, useCallback, useReducer } from 'react'
import {
  Play,
  RotateCcw,
  Trophy,
  Clock,
  Zap,
} from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { playClick } from '../../lib/sound'
import { useAppState } from '../../state'
import { KONAMI_CODE } from '../../lib/easterEgg'
import {
  APPLIANCES,
  gameReducer,
  createInitialGameState,
  saveStoredBestScore,
} from './powerDownLogic'

interface PowerDownGameProps {
  className?: string
  /** Optionally render a 2x3 compact grid (6 appliances) */
  compact?: boolean
}

export const PowerDownGame: React.FC<PowerDownGameProps> = ({
  className = '',
  compact = false,
}) => {
  const { state: appState } = useAppState()
  const isReducedMotion = useReducedMotion()

  const displayedAppliances = compact ? APPLIANCES.slice(0, 6) : APPLIANCES
  const tileCount = displayedAppliances.length

  const [gameState, dispatch] = useReducer(
    gameReducer,
    tileCount,
    createInitialGameState
  )

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bonusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current)
      spawnTimeoutRef.current = null
    }
    if (bonusTimeoutRef.current) {
      clearTimeout(bonusTimeoutRef.current)
      bonusTimeoutRef.current = null
    }
  }, [])

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  // Save best score to localStorage when it increases
  useEffect(() => {
    if (gameState.bestScore > 0) {
      saveStoredBestScore(gameState.bestScore)
    }
  }, [gameState.bestScore])

  // Difficulty ramp spawn scheduler
  const scheduleNextSpawn = useCallback(() => {
    if (gameState.status !== 'playing') return

    // 0-10s left: 600ms, 10-20s left: 720ms, 20-30s left: 850ms
    const baseInterval = gameState.timeLeft <= 10 ? 600 : gameState.timeLeft <= 20 ? 720 : 850
    const variance = Math.floor(Math.random() * 80) - 40 // +/- 40ms jitter
    const nextDelay = Math.max(550, baseInterval + variance)

    spawnTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SPAWN' })
    }, nextDelay)
  }, [gameState.status, gameState.timeLeft])

  // Trigger next spawn whenever activeTiles changes in playing state
  useEffect(() => {
    if (gameState.status === 'playing') {
      scheduleNextSpawn()
    } else {
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current)
        spawnTimeoutRef.current = null
      }
    }
  }, [gameState.status, gameState.activeTiles, scheduleNextSpawn])

  // Stop countdown if status transitions out of playing
  useEffect(() => {
    if (gameState.status !== 'playing' && countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [gameState.status])

  const startGame = useCallback(() => {
    clearAllTimers()
    dispatch({ type: 'START' })

    // Countdown 1s timer
    countdownIntervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK_SECOND' })
    }, 1000)

    // First spawn after 600ms
    spawnTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SPAWN' })
    }, 600)
  }, [clearAllTimers])

  // Tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && gameState.status === 'playing') {
        clearAllTimers()
        dispatch({ type: 'VISIBILITY_HIDDEN' })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [gameState.status, clearAllTimers])

  // Konami code listener
  useEffect(() => {
    let konamiIdx = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI_CODE[konamiIdx]
      if (e.key.toLowerCase() === expected.toLowerCase()) {
        konamiIdx++
        if (konamiIdx === KONAMI_CODE.length) {
          konamiIdx = 0
          dispatch({ type: 'ACTIVATE_BONUS' })
          if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
          bonusTimeoutRef.current = setTimeout(() => {
            dispatch({ type: 'DEACTIVATE_BONUS' })
          }, 10000)
        }
      } else {
        konamiIdx = e.key.toLowerCase() === KONAMI_CODE[0].toLowerCase() ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
    }
  }, [])

  const handleTileClick = (index: number) => {
    if (gameState.status !== 'playing') return
    if (!gameState.activeTiles[index]) return

    dispatch({ type: 'TAP', index })

    if (appState?.settings?.notificationsEnabled) {
      playClick()
    }
  }

  const litCount = gameState.activeTiles.filter(Boolean).length

  // Accessible message for polite live region
  const liveMessage =
    gameState.status === 'playing'
      ? `Score: ${gameState.score}`
      : gameState.status === 'finished'
      ? `${gameState.finishReason === 'too-many' ? 'Too many left on!' : "Time's up!"} Final score: ${gameState.score}. Best: ${gameState.bestScore}.`
      : 'Power Down ready.'

  return (
    <Card
      variant="glass"
      className={`p-4 sm:p-5 flex flex-col justify-between select-none relative overflow-hidden min-h-[350px] ${className}`}
    >
      {/* Accessibility polite announcer */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {/* Header with Title, Instruction, and Status Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-800 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-bold text-[#14301f] tracking-tight">Power Down</h3>
            {gameState.isBonusActive && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider animate-bounce ml-1">
                Bonus! (+2)
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1e3f2b] font-medium leading-tight mt-0.5">
            Tap the appliances left on before they pile up.
          </p>
        </div>

        {/* Dynamic Status / Score Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {gameState.status === 'playing' ? (
            <>
              <Badge variant="neutral" size="sm" className="font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-800" />
                <span>{gameState.timeLeft}s</span>
              </Badge>
              <Badge variant="emerald" size="sm" className="font-bold">
                {gameState.score} pts
              </Badge>
            </>
          ) : gameState.status === 'finished' ? (
            <Badge
              variant={gameState.finishReason === 'too-many' ? 'amber' : 'emerald'}
              size="sm"
              className="font-bold"
            >
              {gameState.finishReason === 'too-many' ? 'Too many on!' : "Time's up!"}
            </Badge>
          ) : (
            gameState.bestScore > 0 && (
              <Badge variant="neutral" size="sm" className="flex items-center gap-1 font-semibold text-xs">
                <Trophy className="w-3 h-3 text-amber-600" />
                <span>Best: {gameState.bestScore}</span>
              </Badge>
            )
          )}
        </div>
      </div>

      {/* Grid of Appliance Tiles */}
      <div
        className={`grid ${
          compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3'
        } gap-2 sm:gap-2.5 my-2.5`}
        role="group"
        aria-label="Appliance tiles"
      >
        {displayedAppliances.map((appliance, index) => {
          const isOn = gameState.activeTiles[index]
          const Icon = appliance.icon

          return (
            <button
              key={appliance.id}
              type="button"
              disabled={gameState.status !== 'playing'}
              onClick={() => handleTileClick(index)}
              aria-label={`${appliance.name}, ${isOn ? 'on' : 'off'}`}
              className={`min-w-[44px] min-h-[44px] h-12 sm:h-13 rounded-xl flex flex-col items-center justify-center p-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 active:scale-95 touch-manipulation border ${
                isOn
                  ? `bg-amber-500/20 text-amber-900 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.25)] ${
                      isReducedMotion ? '' : 'animate-pulse'
                    }`
                  : 'bg-emerald-950/5 text-emerald-800/60 border-emerald-900/10 hover:bg-emerald-900/10'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-semibold leading-none mt-1 truncate max-w-full px-1">
                {appliance.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bottom Area: Controls & Score Information */}
      <div className="pt-1 border-t border-emerald-900/10 space-y-1.5">
        {gameState.status === 'idle' ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#14301f]">
              {gameState.bestScore > 0
                ? `Best record: ${gameState.bestScore} points`
                : 'Ready to test your reflexes?'}
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={startGame}
            >
              Start Game
            </Button>
          </div>
        ) : gameState.status === 'playing' ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-[#1e3f2b]">
              Lit: <strong className={litCount >= 4 ? 'text-amber-800 font-bold' : 'text-[#14301f]'}>{litCount}</strong>/6 (6 = loss)
            </span>
            <span className="text-[11px] text-emerald-900 font-semibold tabular-nums">
              Score: <strong>{gameState.score}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs">
              <span className="font-bold text-[#102819] block leading-tight">
                Score: {gameState.score} point{gameState.score === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] text-[#1e3f2b]">
                {gameState.score >= gameState.bestScore && gameState.score > 0
                  ? '🏆 New personal best!'
                  : `Best: ${gameState.bestScore}`}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={startGame}
            >
              Play Again
            </Button>
          </div>
        )}

        {/* Static Disclaimer Caption */}
        <p className="text-[10px] text-[#1e3f2b]/75 text-center pt-0.5">
          Just for fun. Real savings come from your reminders.
        </p>
      </div>
    </Card>
  )
}

export default PowerDownGame
