import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import {
  LayoutDashboard,
  Bell,
  Calculator,
  BarChart3,
  BookOpen,
} from 'lucide-react'
import { useAppState } from '../../state'
import { todayKey } from '../../lib/dates'
import { isDueOn } from '../../lib/schedule'

interface DockTab {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const DOCK_TABS: DockTab[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/learn', label: 'Learn', icon: BookOpen },
]

function computeNotchPath(w: number, h: number, r: number, x: number, sw = 48, d = 34): string {
  const leftShoulder = Math.max(r, x - sw)
  const rightShoulder = Math.min(w - r, x + sw)
  const cpX = Math.round(sw * 0.58)
  const troughCpX = Math.round(sw * 0.46)

  return `M ${r} 0 L ${leftShoulder} 0 C ${x - cpX} 0, ${x - troughCpX} ${d}, ${x} ${d} C ${x + troughCpX} ${d}, ${x + cpX} 0, ${rightShoulder} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
}

function computeFlatPath(w: number, h: number, r: number): string {
  return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
}

/**
 * NotchDock
 * Custom mobile bottom navigation dock with a dynamic SVG notch plate that follows
 * the animated/draggable active bead. Replaces the bottom tab bar below 1024px.
 */
export const NotchDock: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useAppState()
  const shouldReduceMotion = useReducedMotion()

  const dockRef = useRef<HTMLDivElement>(null)
  const [dockWidth, setDockWidth] = useState(360)
  const [isLandscapePhone, setIsLandscapePhone] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const barHeight = isLandscapePhone ? 52 : 64
  const cornerRadius = isLandscapePhone ? 16 : 20
  const beadDiameter = isLandscapePhone ? 44 : 52
  const notchDepth = isLandscapePhone ? 28 : 34
  const notchShoulder = isLandscapePhone ? 40 : 48

  // Find active index (-1 when in settings or non-dock route)
  const activeIndex = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/settings')) return -1
    if (path === '/') return 0
    const idx = DOCK_TABS.findIndex((tab) => tab.to !== '/' && path.startsWith(tab.to))
    return idx
  }, [location.pathname])

  // Center X of each tab
  const tabCenters = useMemo(() => {
    const tabWidth = dockWidth / DOCK_TABS.length
    return DOCK_TABS.map((_, i) => tabWidth * i + tabWidth / 2)
  }, [dockWidth])

  const beadX = useMotionValue(activeIndex >= 0 ? tabCenters[activeIndex] || 36 : 36)
  const [currentPath, setCurrentPath] = useState(() =>
    computeNotchPath(dockWidth, barHeight, cornerRadius, tabCenters[activeIndex] || 36, notchShoulder, notchDepth)
  )

  const updatePath = useCallback(
    (xVal: number) => {
      setCurrentPath(computeNotchPath(dockWidth, barHeight, cornerRadius, xVal, notchShoulder, notchDepth))
    },
    [dockWidth, barHeight, cornerRadius, notchShoulder, notchDepth]
  )

  // Listen to beadX changes to smoothly re-render SVG notch path
  useEffect(() => {
    const unsubscribe = beadX.on('change', (latestX) => {
      if (activeIndex >= 0) {
        updatePath(latestX)
      }
    })
    return () => unsubscribe()
  }, [beadX, updatePath, activeIndex])

  // Measure dock width and landscape status
  useEffect(() => {
    const measure = () => {
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect()
        if (rect.width > 0) {
          setDockWidth(rect.width)
        }
      }
      setIsLandscapePhone(window.innerHeight < 480)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Animate bead to target tab center on route change
  useEffect(() => {
    if (activeIndex >= 0) {
      const targetX = tabCenters[activeIndex] || 36
      if (shouldReduceMotion) {
        beadX.set(targetX)
      } else {
        const controls = animate(beadX, targetX, {
          type: 'spring',
          stiffness: 380,
          damping: 32,
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
    const observer = new MutationObserver(() => {
      const hasModal =
        document.body.getAttribute('data-modal-open') === 'true' ||
        document.querySelector('[role="dialog"]') !== null
      setIsModalOpen(hasModal)
    })

    observer.observe(document.body, { attributes: true, childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Snap bead on drag release
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (activeIndex < 0) return
    const current = beadX.get() + info.velocity.x * 0.05
    let closestIndex = 0
    let minDiff = Infinity

    tabCenters.forEach((center, idx) => {
      const diff = Math.abs(current - center)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = idx
      }
    })

    const targetTab = DOCK_TABS[closestIndex]
    if (targetTab && closestIndex !== activeIndex) {
      navigate(targetTab.to)
    } else if (activeIndex >= 0) {
      animate(beadX, tabCenters[activeIndex], {
        type: 'spring',
        stiffness: 380,
        damping: 32,
      })
    }
  }

  const ActiveIcon = activeIndex >= 0 ? DOCK_TABS[activeIndex].icon : null

  if (isKeyboardOpen || isModalOpen) {
    return null
  }

  const renderedPath = activeIndex < 0 ? computeFlatPath(dockWidth, barHeight, cornerRadius) : currentPath

  return (
    <div
      ref={dockRef}
      className="lg:hidden fixed z-40 inset-x-0 mx-3 max-w-[480px] sm:mx-auto select-none pointer-events-auto"
      style={{
        bottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        height: `${barHeight}px`,
      }}
    >
      {/* Dynamic SVG Notch Plate */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_10px_24px_rgba(20,48,31,0.15)]"
        viewBox={`0 0 ${dockWidth} ${barHeight}`}
        preserveAspectRatio="none"
      >
        <path
          d={renderedPath}
          fill="rgba(255, 255, 255, 0.88)"
          stroke="rgba(25, 111, 69, 0.22)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Backdrop blur layer clipped to the notch plate */}
      <div
        className="absolute inset-0 backdrop-blur-md pointer-events-none -z-10"
        style={{
          clipPath: `path('${renderedPath}')`,
          WebkitClipPath: `path('${renderedPath}')`,
        }}
      />

      {/* Floating Active Bead (Draggable Enhancement) */}
      <AnimatePresence>
        {activeIndex >= 0 && ActiveIcon && (
          <motion.div
            key="active-dock-bead"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            aria-hidden="true"
            drag="x"
            dragConstraints={{
              left: tabCenters[0] || 0,
              right: tabCenters[tabCenters.length - 1] || dockWidth,
            }}
            dragElastic={0.06}
            onDragEnd={handleDragEnd}
            style={{
              x: beadX,
              width: `${beadDiameter}px`,
              height: `${beadDiameter}px`,
              marginLeft: `-${beadDiameter / 2}px`,
              top: isLandscapePhone ? '-22px' : '-26px',
            }}
            className="absolute z-20 flex items-center justify-center rounded-full bg-gradient-to-b from-[#1f7a4d] to-[#196f45] text-white shadow-[0_8px_22px_rgba(25,111,69,0.42)] cursor-grab active:cursor-grabbing border border-emerald-300/40"
          >
            <ActiveIcon className={isLandscapePhone ? 'w-5 h-5' : 'w-6 h-6'} />
            {activeIndex === 1 && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Items */}
      <nav aria-label="Primary" className="relative z-10 w-full h-full flex items-center justify-around">
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
              className="flex-1 h-full flex flex-col items-center justify-center text-center relative focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none rounded-2xl"
              style={{
                paddingTop: isActive && !isLandscapePhone ? '36px' : '0px',
              }}
            >
              {!isActive && (
                <div className="relative text-[#3f5d4b] transition-transform active:scale-90">
                  <Icon className="w-[22px] h-[22px]" />
                  {tab.to === '/reminders' && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                      {pendingCount}
                    </span>
                  )}
                </div>
              )}

              {/* Active Tab Label inside bar under the bead */}
              {isActive && !isLandscapePhone && (
                <span className="text-[11px] font-bold text-[#0a381e] tracking-tight leading-none mt-1">
                  {tab.label}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
