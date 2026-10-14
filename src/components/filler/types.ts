import type React from 'react'
import type { Reminder, Completion, CurrencySymbol } from '../../types'

export type FillerPage = 'dashboard' | 'calculator' | 'reminders' | 'analytics' | 'learn'
export type FillerTier = 'S' | 'M' | 'L' | 'XL'

export interface FillerContext {
  reminders: Reminder[]
  completions: Completion[]
  tariff: number
  currency: CurrencySymbol
  nextUpReminder: Reminder | null
  onSelectPreset?: (presetName: string) => void
  selectedPreset?: string
}

export interface FillerDefinition {
  id: string
  title: string
  tier: FillerTier
  pages: FillerPage[]
  minHeight: number
  idealHeight: number
  maxHeight: number
  priority: number
  canRender: (ctx: FillerContext) => boolean
  Component: React.ComponentType<{
    height: number
    context: FillerContext
    className?: string
  }>
}

export type SelectionResult =
  | {
      type: 'single'
      filler: FillerDefinition
      height: number
    }
  | {
      type: 'double'
      fillers: [FillerDefinition, FillerDefinition]
      heights: [number, number]
    }
  | null
