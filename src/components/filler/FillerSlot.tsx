import React, { Suspense, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppState } from '../../state'
import { isWelcomeHandled, isTourSeen } from '../../lib/storage'
import { getNextUpReminder } from '../../lib/dashboardWeek'
import { selectFiller } from './selection'
import type { FillerPage, FillerContext } from './types'

export interface FillerSlotProps {
  page: FillerPage
  gap: number
  className?: string
  onSelectPreset?: (presetName: string) => void
  selectedPreset?: string
  contextOverride?: Partial<FillerContext>
  onRenderedHeightChange?: (height: number) => void
}

/**
 * FillerSlot renders an adaptive, measured filler in the short column's tail.
 *
 * Rules:
 * - Renders NOTHING if gap < 160 px or if no filler fits within the space.
 * - Renders NOTHING on mobile (< 1024 px).
 * - Renders NOTHING during welcome, tour, 404, Settings, or open dialogs/drawers.
 * - Excludes itself from measurement to eliminate feedback loops.
 */
export const FillerSlot: React.FC<FillerSlotProps> = ({
  page,
  gap,
  className = '',
  onSelectPreset,
  selectedPreset,
  contextOverride,
  onRenderedHeightChange,
}) => {
  const location = useLocation()
  const { state } = useAppState()

  // 1. Prohibited conditions evaluation
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const isFresh = !isWelcomeHandled() || !isTourSeen()

  const path = location.pathname.toLowerCase()
  const isProhibitedPage =
    path === '/welcome' ||
    path === '/tour' ||
    path === '/settings' ||
    path.includes('404')

  const isDialogOpen =
    typeof document !== 'undefined' &&
    (document.querySelector('[role="dialog"]') !== null ||
      document.querySelector('[aria-modal="true"]') !== null ||
      document.querySelector('dialog[open]') !== null)

  const isDisabled = isMobile || isFresh || isProhibitedPage || isDialogOpen

  // 2. Assemble context from real user data (Unconditional Hook calls)
  const nextUp = useMemo(() => {
    return getNextUpReminder(state.reminders, state.completions)
  }, [state.reminders, state.completions])

  const context: FillerContext = useMemo(() => {
    return {
      reminders: state.reminders,
      completions: state.completions,
      tariff: state.settings.tariffPerKwh,
      currency: state.settings.currency,
      nextUpReminder: nextUp
        ? state.reminders.find((r) => r.id === nextUp.reminderId) || null
        : null,
      onSelectPreset,
      selectedPreset,
      ...contextOverride,
    }
  }, [
    state.reminders,
    state.completions,
    state.settings.tariffPerKwh,
    state.settings.currency,
    nextUp,
    onSelectPreset,
    selectedPreset,
    contextOverride,
  ])

  // 3. Select fitting filler from catalog
  const selection = useMemo(() => {
    if (isDisabled) return null
    return selectFiller(page, gap, context)
  }, [isDisabled, page, gap, context])

  // 4. Inform parent of rendered height
  useEffect(() => {
    if (!selection) {
      onRenderedHeightChange?.(0)
    } else if (selection.type === 'single') {
      onRenderedHeightChange?.(selection.height)
    } else {
      onRenderedHeightChange?.(selection.heights[0] + selection.heights[1] + 16)
    }
  }, [selection, onRenderedHeightChange])

  if (isDisabled || !selection) {
    return null
  }

  if (selection.type === 'single') {
    const SingleComponent = selection.filler.Component
    return (
      <div
        data-filler-slot="true"
        data-filler-id={selection.filler.id}
        data-filler-tier={selection.filler.tier}
        data-filler-height={selection.height}
        data-gap-before={gap}
        className={`w-full ${className}`}
      >
        <Suspense fallback={null}>
          <SingleComponent
            height={selection.height}
            context={context}
          />
        </Suspense>
      </div>
    )
  }

  // Double stacked fillers (Tier XL)
  const [Comp1, Comp2] = [
    selection.fillers[0].Component,
    selection.fillers[1].Component,
  ]
  const [h1, h2] = selection.heights
  const totalH = h1 + h2 + 16

  return (
    <div
      data-filler-slot="true"
      data-filler-tier="XL"
      data-filler-ids={`${selection.fillers[0].id}+${selection.fillers[1].id}`}
      data-filler-height={totalH}
      data-gap-before={gap}
      className={`w-full flex flex-col gap-4 ${className}`}
    >
      <Suspense fallback={null}>
        <Comp1 height={h1} context={context} />
      </Suspense>
      <Suspense fallback={null}>
        <Comp2 height={h2} context={context} />
      </Suspense>
    </div>
  )
}

export default FillerSlot
