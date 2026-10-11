import React, { useMemo, useState } from 'react'
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
  Search,
} from 'lucide-react'
import { LeafBackground } from './LeafBackground'
import { useReminderAlerts } from '../../lib/useReminderAlerts'
import { InAppAlertBanner } from './InAppAlertBanner'
import { SidebarTipCard } from './SidebarTipCard'
import { MobileSearchSheet } from './MobileSearchSheet'
import { MobileAlertsPopover } from './MobileAlertsPopover'
import { NotchDock } from '../navigation/NotchDock'
import { ScrollThumb } from '../ui/ScrollThumb'
import { WelcomeScreen } from '../welcome/WelcomeScreen'
import { useAppState } from '../../state'
import { todayKey } from '../../lib/dates'
import { isDueOn } from '../../lib/schedule'
import { CountUp } from '../ui/CountUp'
import { isWelcomeHandled } from '../../lib/storage'

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

  const [searchOpen, setSearchOpen] = useState(false)
  const [alertsPopoverOpen, setAlertsPopoverOpen] = useState(false)
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  // Welcome screen is shown once on first launch or after reset when displayName is empty
  const showWelcome = !welcomeDismissed && !isWelcomeHandled() && !state.settings.displayName

  // Page title for compact mobile header
  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path.startsWith('/reminders')) return 'Reminders'
    if (path.startsWith('/calculator')) return 'Calculator'
    if (path.startsWith('/analytics')) return 'Analytics'
    if (path.startsWith('/learn')) return 'Learn'
    if (path.startsWith('/settings')) return 'Settings'
    return 'EcoPulse'
  }, [location.pathname])

  // User initials for mobile avatar chip
  const userInitial = useMemo(() => {
    const name = state.settings.displayName?.trim()
    return name ? name.charAt(0).toUpperCase() : 'G'
  }, [state.settings.displayName])

  // Compute pending reminders due today for the nav badge
  const pendingTodayCount = useMemo(() => {
    const dueToday = state.reminders.filter((r) => isDueOn(r, today))
    const doneToday = state.completions.filter((c) => c.date === today)
    const doneIds = new Set(doneToday.map((c) => c.reminderId))
    return dueToday.filter((r) => !doneIds.has(r.id)).length
  }, [state.reminders, state.completions, today])

  return (
    <div className="min-h-[100dvh] text-[#14301f] flex flex-col lg:flex-row relative">
      {/* Fixed Botanical Background Layer */}
      <LeafBackground />

      {/* Touch Custom Scrollbar Indicator */}
      <ScrollThumb />

      {/* First-Launch Welcome Screen (Not Authentication) */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeScreen onComplete={() => setWelcomeDismissed(true)} />
        )}
      </AnimatePresence>

      {/* Global In-App Alert Toasts */}
      <InAppAlertBanner
        alerts={activeAlerts}
        onMarkDone={markAlertDone}
        onSnooze={snoozeAlert}
        onDismiss={dismissAlert}
      />

      {/* Mobile Search Sheet Modal */}
      <MobileSearchSheet
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Mobile Alerts Popover Dropdown */}
      <MobileAlertsPopover
        isOpen={alertsPopoverOpen}
        onClose={() => setAlertsPopoverOpen(false)}
      />

      {/* Desktop Floating Glass Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between m-4 glass-panel rounded-2xl p-4 xl:p-5 shrink-0 sticky top-4 h-[calc(100vh-2rem)] z-30 overflow-hidden scrollbar-none">
        <div>
          {/* Logo & Project Banner */}
          <div className="flex items-center gap-3 px-2 py-1 mb-4 xl:mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm shadow-emerald-950/15">
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
          <nav className="space-y-1 xl:space-y-1.5" aria-label="Main Navigation">
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
                  className={`relative flex items-center gap-3 px-3.5 py-2 xl:py-2.5 rounded-xl text-sm font-semibold transition-colors ${
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
        <div className="pt-4">
          <SidebarTipCard />
        </div>
      </aside>

      {/* Main Content Area: Document itself scrolls below 1024px */}
      <div className="flex-1 flex flex-col min-w-0 z-10 pb-[calc(64px+env(safe-area-inset-bottom,0px)+24px)] lg:pb-8">
        {/* Mobile Compact Glass Header (< 1024px) */}
        <header className="lg:hidden glass-panel border-b border-white/60 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Left: Logo & Current Page Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-[#14301f] leading-tight truncate">
                {pageTitle}
              </h1>
              <p className="text-[10px] text-emerald-900 font-semibold leading-none">
                EcoPulse
              </p>
            </div>
          </div>

          {/* Right: Search, Bell Popover, and Settings Avatar Chip */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search sheet"
              className="p-2 rounded-xl text-[#14301f] hover:bg-emerald-800/10 active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Bell Trigger */}
            <button
              type="button"
              onClick={() => setAlertsPopoverOpen((prev) => !prev)}
              aria-label="Toggle notifications popover"
              className="relative p-2 rounded-xl text-[#14301f] hover:bg-emerald-800/10 active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4" />
              {pendingTodayCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Avatar Chip linking to Settings */}
            <NavLink
              to="/settings"
              aria-label="Settings"
              className="w-8 h-8 rounded-full bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white/90 shadow-xs hover:bg-emerald-900 active:scale-95 transition-all"
            >
              {userInitial}
            </NavLink>
          </div>
        </header>

        {/* Page Content with Route AnimatePresence Transitions */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-8 max-w-6xl w-full mx-auto">
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

      {/* Floating Notch Dock: Fixed at Root, Replaces Bottom Tab Bar below 1024px */}
      <NotchDock />
    </div>
  )
}
