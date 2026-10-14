import React from 'react'
import {
  Lightbulb,
  Fan,
  Laptop,
  Plug,
  Snowflake,
  Tv,
  Monitor,
  AirVent,
  Microwave,
} from 'lucide-react'

export const BEST_SCORE_STORAGE_KEY = 'ecopulse_game_best_v1'

export interface ApplianceItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

export const APPLIANCES: ApplianceItem[] = [
  { id: 'lamp', name: 'Desk lamp', icon: Lightbulb },
  { id: 'fan', name: 'Ceiling fan', icon: Fan },
  { id: 'laptop', name: 'Laptop', icon: Laptop },
  { id: 'charger', name: 'Phone charger', icon: Plug },
  { id: 'ac', name: 'AC unit', icon: Snowflake },
  { id: 'tv', name: 'Television', icon: Tv },
  { id: 'monitor', name: 'Monitor', icon: Monitor },
  { id: 'vent', name: 'Air vent', icon: AirVent },
  { id: 'microwave', name: 'Microwave', icon: Microwave },
]

export function getStoredBestScore(): number {
  try {
    if (typeof localStorage === 'undefined') return 0
    const raw = localStorage.getItem(BEST_SCORE_STORAGE_KEY)
    if (!raw) return 0
    const val = parseInt(raw, 10)
    return isNaN(val) || val < 0 ? 0 : val
  } catch {
    return 0
  }
}

export function saveStoredBestScore(score: number): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score))
  } catch {
    // Gracefully ignore storage failures/quota exceeded
  }
}

export type GameStatus = 'idle' | 'playing' | 'finished'
export type FinishReason = 'time-up' | 'too-many' | 'hidden' | null

export interface GameEngineState {
  status: GameStatus
  score: number
  bestScore: number
  timeLeft: number
  activeTiles: boolean[]
  isBonusActive: boolean
  finishReason: FinishReason
}

export type GameAction =
  | { type: 'START' }
  | { type: 'TICK_SECOND' }
  | { type: 'SPAWN'; index?: number }
  | { type: 'TAP'; index: number }
  | { type: 'ACTIVATE_BONUS' }
  | { type: 'DEACTIVATE_BONUS' }
  | { type: 'VISIBILITY_HIDDEN' }
  | { type: 'SET_BEST_SCORE'; bestScore: number }
  | { type: 'RESET' }

export function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        status: 'playing',
        score: 0,
        timeLeft: 30,
        activeTiles: new Array(state.activeTiles.length).fill(false),
        finishReason: null,
      }
    case 'TICK_SECOND':
      if (state.status !== 'playing') return state
      if (state.timeLeft <= 1) {
        return {
          ...state,
          timeLeft: 0,
          status: 'finished',
          finishReason: 'time-up',
          bestScore: Math.max(state.bestScore, state.score),
        }
      }
      return {
        ...state,
        timeLeft: state.timeLeft - 1,
      }
    case 'SPAWN': {
      if (state.status !== 'playing') return state
      const offIndices = state.activeTiles
        .map((isOn, idx) => (!isOn ? idx : -1))
        .filter((idx) => idx !== -1)
      if (offIndices.length === 0) return state

      const chosenIndex =
        action.index !== undefined && offIndices.includes(action.index)
          ? action.index
          : offIndices[Math.floor(Math.random() * offIndices.length)]

      const nextTiles = [...state.activeTiles]
      nextTiles[chosenIndex] = true

      const litCount = nextTiles.filter(Boolean).length
      if (litCount >= 6) {
        return {
          ...state,
          activeTiles: nextTiles,
          status: 'finished',
          finishReason: 'too-many',
          bestScore: Math.max(state.bestScore, state.score),
        }
      }

      return {
        ...state,
        activeTiles: nextTiles,
      }
    }
    case 'TAP': {
      if (state.status !== 'playing') return state
      if (!state.activeTiles[action.index]) return state // Already off

      const nextTiles = [...state.activeTiles]
      nextTiles[action.index] = false

      const points = state.isBonusActive ? 2 : 1
      const newScore = state.score + points
      const newBest = Math.max(state.bestScore, newScore)

      return {
        ...state,
        activeTiles: nextTiles,
        score: newScore,
        bestScore: newBest,
      }
    }
    case 'ACTIVATE_BONUS':
      return { ...state, isBonusActive: true }
    case 'DEACTIVATE_BONUS':
      return { ...state, isBonusActive: false }
    case 'VISIBILITY_HIDDEN':
      if (state.status !== 'playing') return state
      return {
        ...state,
        status: 'finished',
        finishReason: 'hidden',
        bestScore: Math.max(state.bestScore, state.score),
      }
    case 'SET_BEST_SCORE':
      return { ...state, bestScore: action.bestScore }
    case 'RESET':
      return {
        ...state,
        status: 'idle',
        score: 0,
        timeLeft: 30,
        activeTiles: new Array(state.activeTiles.length).fill(false),
        finishReason: null,
      }
    default:
      return state
  }
}

export function createInitialGameState(tileCount: number = 9): GameEngineState {
  return {
    status: 'idle',
    score: 0,
    bestScore: getStoredBestScore(),
    timeLeft: 30,
    activeTiles: new Array(tileCount).fill(false),
    isBonusActive: false,
    finishReason: null,
  }
}
