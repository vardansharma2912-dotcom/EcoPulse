import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

export interface GapMeasureOptions {
  hostRef: React.RefObject<HTMLElement | null>
  targetRef: React.RefObject<HTMLElement | null>
  renderedFillerHeight?: number
  deps?: unknown[]
}

export interface GapMeasureResult {
  gap: number
  rawGap: number
  hostHeight: number
  targetHeight: number
  isShortColumn: boolean
  shouldShowFiller: boolean
}

const SHOW_THRESHOLD = 160
const HIDE_THRESHOLD = 120
const THROTTLE_MS = 500

/**
 * useGapMeasure hook measures the blank space between two sibling columns.
 *
 * Excludes filler height from measurement to prevent feedback loops.
 * Employs hysteresis: shows at >= 160px, hides at < 120px.
 * Rate-limits re-selection to once per 500ms.
 * Automatically disables below 1024px (mobile) or when a dialog/drawer/modal is open.
 */
export function useGapMeasure({
  hostRef,
  targetRef,
  renderedFillerHeight = 0,
  deps = [],
}: GapMeasureOptions): GapMeasureResult {
  const location = useLocation()
  const [rawGap, setRawGap] = useState(0)
  const [activeGap, setActiveGap] = useState(0)
  const [shouldShow, setShouldShow] = useState(false)
  const [hostHeight, setHostHeight] = useState(0)
  const [targetHeight, setTargetHeight] = useState(0)
  const [isShortColumn, setIsShortColumn] = useState(false)

  const lastUpdateRef = useRef<number>(0)
  const rafIdRef = useRef<number | null>(null)
  const isShowingRef = useRef<boolean>(false)

  useEffect(() => {
    isShowingRef.current = shouldShow
  }, [shouldShow])

  const measure = useCallback(() => {
    // 1. Mobile check: disabled below 1024 px
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setRawGap(0)
      setActiveGap(0)
      setShouldShow(false)
      setIsShortColumn(false)
      return
    }

    // 2. Disabled pages check
    const path = location.pathname.toLowerCase()
    if (
      path === '/welcome' ||
      path === '/tour' ||
      path === '/settings' ||
      path.includes('404')
    ) {
      setRawGap(0)
      setActiveGap(0)
      setShouldShow(false)
      setIsShortColumn(false)
      return
    }

    // 3. Dialog / Modal / Sheet check
    if (typeof document !== 'undefined') {
      const dialogOpen =
        document.querySelector('[role="dialog"]') !== null ||
        document.querySelector('[aria-modal="true"]') !== null ||
        document.querySelector('dialog[open]') !== null
      if (dialogOpen) {
        setRawGap(0)
        setActiveGap(0)
        setShouldShow(false)
        setIsShortColumn(false)
        return
      }
    }

    const hostEl = hostRef.current
    const targetEl = targetRef.current

    if (!hostEl || !targetEl) {
      setRawGap(0)
      setActiveGap(0)
      setShouldShow(false)
      setIsShortColumn(false)
      return
    }

    const hostRect = hostEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()

    const currentHostH = hostRect.height
    const currentTargetH = targetRect.height

    setHostHeight(currentHostH)
    setTargetHeight(currentTargetH)

    // Gap measured from bottom edge of host content to bottom edge of target content.
    // If host contains filler, exclude filler's height so gap is "before filler".
    const bottomDiff = targetRect.bottom - hostRect.bottom
    const computedGap = Math.max(0, Math.round(bottomDiff + renderedFillerHeight))

    const isShorter = computedGap > 0
    setIsShortColumn(isShorter)
    setRawGap(computedGap)

    const now = Date.now()
    const isCurrentlyShowing = isShowingRef.current

    if (!isCurrentlyShowing) {
      // Hysteresis: show only if gap >= 160 px
      if (computedGap >= SHOW_THRESHOLD) {
        if (now - lastUpdateRef.current >= THROTTLE_MS || lastUpdateRef.current === 0) {
          lastUpdateRef.current = now
          setActiveGap(computedGap)
          setShouldShow(true)
        }
      }
    } else {
      // Hysteresis: hide only if gap < 120 px
      if (computedGap < HIDE_THRESHOLD) {
        lastUpdateRef.current = now
        setActiveGap(0)
        setShouldShow(false)
      } else {
        // Still showing; update gap with rate limit of 500 ms
        if (now - lastUpdateRef.current >= THROTTLE_MS) {
          lastUpdateRef.current = now
          setActiveGap(computedGap)
        }
      }
    }
  }, [hostRef, targetRef, renderedFillerHeight, location.pathname])

  const scheduleMeasure = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
    }
    rafIdRef.current = requestAnimationFrame(() => {
      measure()
    })
  }, [measure])

  const depsKey = deps
    .map((d) =>
      typeof d === 'object' && d !== null
        ? Array.isArray(d)
          ? d.length
          : Object.keys(d).length
        : String(d)
    )
    .join(':')

  useEffect(() => {
    scheduleMeasure()

    const hostEl = hostRef.current
    const targetEl = targetRef.current

    // ResizeObserver on content wrappers only (not the filler itself)
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        scheduleMeasure()
      })
      if (hostEl) ro.observe(hostEl)
      if (targetEl) ro.observe(targetEl)
    }

    // Window resize
    const handleResize = () => scheduleMeasure()
    window.addEventListener('resize', handleResize)

    // Font load: document.fonts.ready
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        scheduleMeasure()
      })
    }

    // Modal / dialog observer on body
    let mo: MutationObserver | null = null
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      mo = new MutationObserver(() => {
        scheduleMeasure()
      })
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['role', 'aria-modal', 'open'],
      })
    }

    return () => {
      if (ro) ro.disconnect()
      if (mo) mo.disconnect()
      window.removeEventListener('resize', handleResize)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [scheduleMeasure, hostRef, targetRef, depsKey])

  return {
    gap: shouldShow ? activeGap : 0,
    rawGap,
    hostHeight,
    targetHeight,
    isShortColumn,
    shouldShowFiller: shouldShow,
  }
}
