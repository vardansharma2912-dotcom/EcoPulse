import React, { useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Bell,
  Calculator,
  BarChart3,
  BookOpen,
  Settings as SettingsIcon,
  Leaf,
} from 'lucide-react'
import { LeafBackground } from './LeafBackground'
import { useReminderAlerts } from '../../lib/useReminderAlerts'
import { InAppAlertBanner } from './InAppAlertBanner'
import { SidebarTipCard } from './SidebarTipCard'
import { useAppState } from '../../state'
import { todayKey } from '../../lib/dates'
import { isDueOn } from '../../lib/schedule'
import { CountUp } from '../ui/CountUp'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export const AppLayout: React.FC = () => {
  const { activeAlerts, dismissAlert, markAlertDone, snoozeAlert } = useReminderAlerts()
  const { state } = useAppState()
  const location = useLocation()
  const today = todayKey()

  // Compute pending reminders due today for the nav badge
  const pendingTodayCount = useMemo(() => {
    const dueToday = state.reminders.filter((r) => isDueOn(r, today))
    const doneToday = state.completions.filter((c) => c.date === today)
    const doneIds = new Set(doneToday.map((c) => c.reminderId))
    return dueToday.filter((r) => !doneIds.has(r.id)).length
  }, [state.reminders, state.completions, today])

  return (
    <div className="min-h-screen text-[#14301f] flex flex-col lg:flex-row relative">
      {/* Fixed Botanical Background Layer */}
      <LeafBackground />

      {/* Global In-App Alert Toasts */}
      <InAppAlertBanner
        alerts={activeAlerts}
        onMarkDone={markAlertDone}
        onSnooze={snoozeAlert}
        onDismiss={dismissAlert}
      />

      {/* Desktop Floating Glass Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between m-4 glass-panel rounded-2xl p-5 shrink-0 sticky top-4 h-[calc(100vh-2rem)] z-30 overflow-y-auto">
        <div>
          {/* Logo & Project Banner */}
          <div className="flex items-center gap-3 px-2 py-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm shadow-emerald-950/15">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-[#14301f] tracking-tight block">
                EcoPulse
              </span>
              <p className="text-[11px] text-[#1e3f2b] font-semibold">Smart Energy Reminder</p>
            </div>
          </div>

          {/* Navigation Links with Shared Sliding Pill & 3px Indicator */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to)

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-slate-700 hover:text-[#14301f] hover:bg-white/60'
                  }`}
                >
                  {/* Sliding Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-emerald-700 rounded-xl -z-10 shadow-sm shadow-emerald-950/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* 3px Green Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-1 top-2.5 bottom-2.5 w-[3.5px] bg-emerald-300 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>

                  {/* Reminders Pending Count Badge */}
                  {item.to === '/reminders' && (
                    <AnimatePresence>
                      {pendingTodayCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          className={`ml-auto px-2 py-0.5 text-[11px] font-extrabold rounded-full ${
                            isActive
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : 'bg-emerald-800 text-white'
                          }`}
                        >
                          <CountUp value={pendingTodayCount} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Animated Tip Card */}
        <div className="space-y-3 pt-4">
          <SidebarTipCard />

          <div className="p-3.5 rounded-xl glass-card text-[11px] space-y-1 border border-white/70">
            <p className="font-bold text-[#0f2418]">CHE110 Environmental Studies</p>
            <p className="text-[#183624] font-semibold">Assignment Due: 20 Oct 2026</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 z-10">
        {/* Mobile Glass Header */}
        <header className="lg:hidden glass-panel border-b border-white/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#14301f]">EcoPulse</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-900 px-2 py-0.5 rounded-md bg-white/80 border border-emerald-900/15">
            CHE110
          </span>
        </header>

        {/* Page Container with Route AnimatePresence Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{
                opacity: 0,
                y: 12,
                filter: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'blur(6px)' : 'none',
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.12 },
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="min-w-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Glass Bottom Tab Bar (< lg) with layoutId Pill */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 glass-panel border-t border-white/75 z-50 px-2 py-1.5 flex justify-around backdrop-blur-md shadow-lg"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-emerald-900 font-bold' : 'text-slate-600 hover:text-[#14301f]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileNavPill"
                  className="absolute inset-0 bg-emerald-700/15 rounded-lg -z-10 border border-emerald-700/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon className="w-4 h-4 mb-0.5" />
                {item.to === '/reminders' && pendingTodayCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-emerald-800 text-white text-[9px] font-extrabold flex items-center justify-center">
                    {pendingTodayCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
