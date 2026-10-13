import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, useMotionValue, animate, useReducedMotion } from 'motion/react'
import {
  DashboardNavIcon,
  RemindersNavIcon,
  CalculatorNavIcon,
  AnalyticsNavIcon,
  LearnNavIcon,
} from './NavIcons'
import { useAppState } from '../../state'
import { todayKey } from '../../lib/dates'
import { isDueOn } from '../../lib/schedule'

interface DockTab {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string; isHovered?: boolean; isActive?: boolean; trigger?: number | boolean }>
}

const DOCK_TABS: DockTab[] = [
  { to: '/', label: 'Dashboard', icon: DashboardNavIcon },
  { to: '/reminders', label: 'Reminders', icon: RemindersNavIcon },
  { to: '/calculator', label: 'Calculator', icon: CalculatorNavIcon },
  { to: '/analytics', label: 'Analytics', icon: AnalyticsNavIcon },
  { to: '/learn', label: 'Learn', icon: LearnNavIcon },
]

function computeFlatPath(w: number, h: number): string {
  return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
}

function computeNotchPath(w: number, h: number, x: number, sw = 44, d = 26): string {
  const leftShoulder = Math.max(0, x - sw)
  const rightShoulder = Math.min(w, x + sw)
  const cpX = Math.round(sw * 0.58)
  const troughCpX = Math.round(sw * 0.46)

  return `M 0 0 L ${leftShoulder} 0 C ${x - cpX} 0, ${x - troughCpX} ${d}, ${x} ${d} C ${x + troughCpX} ${d}, ${x + cpX} 0, ${rightShoulder} 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
}

/**
 * NotchDock
 * Fixed sticky bottom navigation bar below 1024px.
 * Features 5 items, notch + bead design, portaled directly to document.body,
 * safe-area inset at bottom, capped to 480px wide and centered on tablets.
 */
export const NotchDock: React.FC = () => {
  const location = useLocation()
  const { state } = useAppState()
  const dockRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const [dockWidth, setDockWidth] = useState(360)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dockClicks, setDockClicks] = useState<Record<string, number>>({})
  const [bottomOffset, setBottomOffset] = useState(0)

  const barHeight = 64
  const beadDiameter = 48

  // Find active index (-1 when in settings or non-dock route)
  const activeIndex = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/settings')) return -1
    if (path === '/') return 0
    const idx = DOCK_TABS.findIndex(
      (tab) => tab.to !== '/' && (path === tab.to || path.startsWith(tab.to + '/'))
    )
    return idx
  }, [location.pathname])

  // Center X coordinates for each tab
  const tabCenters = useMemo(() => {
    const count = DOCK_TABS.length
    const tabW = dockWidth / count
    return DOCK_TABS.map((_, i) => tabW * i + tabW / 2)
  }, [dockWidth])

  const beadX = useMotionValue(tabCenters[activeIndex] || 36)
  const [currentPath, setCurrentPath] = useState(() =>
    activeIndex >= 0
      ? computeNotchPath(dockWidth, barHeight, tabCenters[activeIndex] || 36)
      : computeFlatPath(dockWidth, barHeight)
  )

  const updatePath = useCallback(
    (xVal: number) => {
      if (activeIndex >= 0) {
        setCurrentPath(computeNotchPath(dockWidth, barHeight, xVal))
      } else {
        setCurrentPath(computeFlatPath(dockWidth, barHeight))
      }
    },
    [dockWidth, barHeight, activeIndex]
  )

  useEffect(() => {
    const unsubscribe = beadX.on('change', (latestX) => {
      updatePath(latestX)
    })
    return () => unsubscribe()
  }, [beadX, updatePath])

  // Measure dock width on mount and resize
  useEffect(() => {
    const measure = () => {
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect()
        if (rect.width > 0) {
          setDockWidth(rect.width)
        }
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Animate bead to active tab center
  useEffect(() => {
    if (activeIndex >= 0) {
      const targetX = tabCenters[activeIndex] || 36
      if (shouldReduceMotion) {
        beadX.set(targetX)
      } else {
        const controls = animate(beadX, targetX, {
          type: 'spring',
          stiffness: 420,
          damping: 34,
        })
        return () => controls.stop()
      }
    }
  }, [activeIndex, tabCenters, shouldReduceMotion, beadX])

  // Pending reminder count for badge
  const pendingCount = useMemo(() => {
    const today = todayKey()
    const dueToday = state.reminders.filter((r) => isDueOn(r, today))
    const doneToday = state.completions.filter((c) => c.date === today)
    const doneIds = new Set(doneToday.map((c) => c.reminderId))
    return dueToday.filter((r) => !doneIds.has(r.id)).length
  }, [state.reminders, state.completions])

  // Virtual keyboard detector
  useEffect(() => {
    if (typeof window === 'undefined') return

    let inputFocused = false

    const handleFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        inputFocused = true
        checkViewport()
      }
    }

    const handleFocusOut = () => {
      inputFocused = false
      setIsKeyboardOpen(false)
    }

    const checkViewport = () => {
      if (!inputFocused) return
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.75) {
        setIsKeyboardOpen(true)
      } else {
        setIsKeyboardOpen(false)
      }
    }

    window.addEventListener('focusin', handleFocusIn)
    window.addEventListener('focusout', handleFocusOut)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkViewport)
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn)
      window.removeEventListener('focusout', handleFocusOut)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkViewport)
      }
    }
  }, [])

  // Dialog / bottom sheet active detector
  useEffect(() => {
    const checkModal = () => {
      const hasModal =
        document.body.getAttribute('data-modal-open') === 'true' ||
        document.querySelector('[role="dialog"]') !== null
      setIsModalOpen(hasModal)
    }

    checkModal()
    const observer = new MutationObserver(checkModal)
    observer.observe(document.body, { attributes: true, childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Dynamic visual viewport offset: guarantees dock always sticks to visible screen bottom
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateVisualBottom = () => {
      if (window.visualViewport) {
        const layoutHeight = window.innerHeight
        const visualHeight = window.visualViewport.height
        const visualTop = window.visualViewport.offsetTop || 0
        const hiddenBottom = Math.max(0, Math.round(layoutHeight - (visualTop + visualHeight)))
        setBottomOffset(hiddenBottom)
        document.documentElement.style.setProperty('--mobile-dock-bottom', `${hiddenBottom}px`)
      } else {
        setBottomOffset(0)
        document.documentElement.style.setProperty('--mobile-dock-bottom', '0px')
      }
    }

    updateVisualBottom()
    window.visualViewport?.addEventListener('resize', updateVisualBottom)
    window.visualViewport?.addEventListener('scroll', updateVisualBottom)
    window.addEventListener('resize', updateVisualBottom)
    window.addEventListener('scroll', updateVisualBottom)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateVisualBottom)
      window.visualViewport?.removeEventListener('scroll', updateVisualBottom)
      window.removeEventListener('resize', updateVisualBottom)
      window.removeEventListener('scroll', updateVisualBottom)
    }
  }, [])

  if (isKeyboardOpen || isModalOpen) {
    return null
  }

  const ActiveIcon = activeIndex >= 0 ? DOCK_TABS[activeIndex].icon : null
  const renderedPlatePath = activeIndex >= 0 ? currentPath : computeFlatPath(dockWidth, barHeight)

  const handleDockKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % DOCK_TABS.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + DOCK_TABS.length) % DOCK_TABS.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = DOCK_TABS.length - 1
    }

    if (nextIndex >= 0 && dockRef.current) {
      e.preventDefault()
      const links = dockRef.current.querySelectorAll<HTMLAnchorElement>('a')
      if (links[nextIndex]) {
        links[nextIndex].focus()
      }
    }
  }

  return createPortal(
    <nav
      ref={dockRef}
      aria-label="Mobile Navigation"
      className="lg:hidden fixed inset-x-0 z-40 max-w-[480px] w-full mx-auto select-none pointer-events-auto"
      style={{
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))`,
        height: `${barHeight}px`,
      }}
    >
      {/* SVG Notch Plate */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_-4px_16px_rgba(10,56,30,0.08)]"
        viewBox={`0 0 ${dockWidth} ${barHeight}`}
        preserveAspectRatio="none"
      >
        <path
          d={renderedPlatePath}
          fill="rgba(255, 255, 255, 0.94)"
          stroke="rgba(25, 111, 69, 0.16)"
          strokeWidth="1"
        />
      </svg>

      {/* Floating Active Bead */}
      {activeIndex >= 0 && ActiveIcon && (
        <motion.div
          aria-hidden="true"
          style={{
            x: beadX,
            width: `${beadDiameter}px`,
            height: `${beadDiameter}px`,
            marginLeft: `-${beadDiameter / 2}px`,
            top: '-18px',
          }}
          className="absolute z-20 flex items-center justify-center rounded-full bg-gradient-to-b from-[#1f7a4d] to-[#0a381e] text-white shadow-[0_6px_18px_rgba(20,48,31,0.32)] border border-emerald-300/40 pointer-events-none"
        >
          <ActiveIcon
            className="w-5 h-5"
            isActive={true}
            trigger={dockClicks[DOCK_TABS[activeIndex]?.to] || 0}
          />
          {activeIndex === 1 && pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold flex items-center justify-center border border-white">
              {pendingCount}
            </span>
          )}
        </motion.div>
      )}

      {/* Navigation Tab Links */}
      <div className="relative z-10 w-full h-full flex items-stretch justify-around px-1">
        {DOCK_TABS.map((tab, idx) => {
          const isActive = idx === activeIndex
          const Icon = tab.icon

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() =>
                setDockClicks((prev) => ({
                  ...prev,
                  [tab.to]: (prev[tab.to] || 0) + 1,
                }))
              }
              onKeyDown={(e) => handleDockKeyDown(e, idx)}
              className={`flex-1 flex flex-col items-center justify-end pb-2 pt-1 relative transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-emerald-800 focus-visible:outline-offset-[-2px] rounded-xl ${
                isActive ? 'text-[#0a381e]' : 'text-[#2d4a37] hover:text-[#0a381e]'
              }`}
            >
              {!isActive && (
                <div className="relative p-1 text-[#2d4a37] group-hover:text-[#0a381e] group-active:scale-90 transition-transform">
                  <Icon className="w-5 h-5" trigger={dockClicks[tab.to] || 0} />
                  {tab.to === '/reminders' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center border border-white">
                      {pendingCount}
                    </span>
                  )}
                </div>
              )}

              <span
                className={`text-[10px] tracking-tight leading-none mt-0.5 transition-all ${
                  isActive
                    ? 'font-bold text-[#0a381e]'
                    : 'font-semibold text-[#2d4a37] group-hover:text-[#0a381e]'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>,
    document.body
  )
}
