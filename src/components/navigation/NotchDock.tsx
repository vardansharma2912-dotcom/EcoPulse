import React, { useEffect, useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
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

/**
 * NotchDock
 * Sharp rectangular mobile bottom navigation bar touching left, right, and bottom screen sides.
 * Drag feature removed; provides clean, accessible tab navigation below 1024px.
 */
export const NotchDock: React.FC = () => {
  const location = useLocation()
  const { state } = useAppState()

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Find active index (-1 when in settings or non-dock route)
  const activeIndex = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/settings')) return -1
    if (path === '/') return 0
    const idx = DOCK_TABS.findIndex((tab) => tab.to !== '/' && path.startsWith(tab.to))
    return idx
  }, [location.pathname])

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

  if (isKeyboardOpen || isModalOpen) {
    return null
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-emerald-950/15 shadow-[0_-4px_24px_rgba(10,56,30,0.08)] rounded-none select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="h-16 flex items-stretch justify-around px-1 max-w-lg mx-auto">
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
              className={`flex-1 flex flex-col items-center justify-center relative py-1 transition-colors cursor-pointer group ${
                isActive
                  ? 'text-[#0a381e]'
                  : 'text-[#486352] hover:text-[#0a381e]'
              }`}
            >
              {/* Active top indicator line */}
              {isActive && (
                <motion.div
                  layoutId="active-dock-indicator"
                  className="absolute top-0 inset-x-3 h-0.5 bg-emerald-600 rounded-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 transition-all ${
                    isActive
                      ? 'text-[#0a381e]'
                      : 'text-[#486352] group-hover:text-[#0a381e] group-active:scale-90'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200" />
                </div>

                {/* Pending reminders badge */}
                {tab.to === '/reminders' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border border-white">
                    {pendingCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-all ${
                  isActive
                    ? 'font-bold text-[#0a381e]'
                    : 'font-medium text-[#486352] group-hover:text-[#0a381e]'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
