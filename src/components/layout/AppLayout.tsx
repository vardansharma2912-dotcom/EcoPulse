import React, { useMemo, useState, Suspense } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  LayoutDashboard,
  Bell,
  Calculator,
  BarChart3,
  BookOpen,
  Settings as SettingsIcon,
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
const WelcomeScreen = React.lazy(() =>
  import('../welcome/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen }))
)
import { useAppState } from '../../state'
import { todayKey } from '../../lib/dates'
import { isDueOn, computeStreak } from '../../lib/schedule'
import { CountUp } from '../ui/CountUp'
import { Logo } from '../ui/Logo'
import { StreakBadge } from '../ui/StreakBadge'
import { useSeo } from '../../lib/seo'
import { isWelcomeHandled, isTourSeen } from '../../lib/storage'
import { useTour } from '../../context/useTour'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export const AppLayout: React.FC = () => {
  const { openTour } = useTour()
  const { state } = useAppState()
  const location = useLocation()
  const today = todayKey()

  const isReducedMotion = useReducedMotion()
  const [searchOpen, setSearchOpen] = useState(false)
  const [alertsPopoverOpen, setAlertsPopoverOpen] = useState(false)
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  // Welcome screen is shown once on first launch or after reset when displayName is empty
  const isReset = !isWelcomeHandled() && !state.settings.displayName
  const showWelcome = isReset && !welcomeDismissed

  // Hold all alert evaluation until BOTH the welcome step and the tour are finished
  const alertsEnabled = !showWelcome && (isWelcomeHandled() || welcomeDismissed) && isTourSeen()

  const { activeAlerts, dismissAlert, markAlertDone, snoozeAlert } = useReminderAlerts({
    enabled: alertsEnabled,
  })

  const handleWelcomeComplete = (_enteredName?: string) => {
    setWelcomeDismissed(true)
    // Go immediately to the tour as first-run tour
    openTour(true)
  }

  // Page title for compact mobile header
  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path === '/reminders' || path.startsWith('/reminders/')) return 'Reminders'
    if (path === '/calculator' || path.startsWith('/calculator/')) return 'Calculator'
    if (path === '/analytics' || path.startsWith('/analytics/')) return 'Analytics'
    if (path === '/learn' || path.startsWith('/learn/')) return 'Learn'
    if (path === '/settings' || path.startsWith('/settings/')) return 'Settings'
    return 'Page not found'
  }, [location.pathname])

  // Update document title, meta tags, Open Graph, canonical, and JSON-LD
  useSeo(location.pathname)

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

  // Compute active habit streak for sidebar and mobile indicators
  const currentStreak = useMemo(() => {
    return computeStreak(state.completions, today)
  }, [state.completions, today])

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: isReducedMotion ? 0 : 0.25 } }}
          className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-4 text-[#14301f]"
        >
          {/* Fixed Botanical Background Layer */}
          <LeafBackground />

          <Suspense fallback={null}>
            <WelcomeScreen onComplete={handleWelcomeComplete} />
          </Suspense>
        </motion.div>
      ) : (
        <motion.div
          key="app-shell"
          initial={{ opacity: isReducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: isReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[100dvh] text-[#14301f] flex flex-col lg:flex-row relative"
        >
          {/* Fixed Botanical Background Layer */}
          <LeafBackground />

          {/* Touch Custom Scrollbar Indicator */}
          <ScrollThumb />

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
      <aside className="hidden lg:flex w-64 flex-col justify-between m-4 glass-panel rounded-2xl p-4 xl:p-5 pb-5 xl:pb-6 shrink-0 sticky top-4 h-[calc(100vh-2rem)] z-30 overflow-hidden scrollbar-none">
        <div>
          {/* Logo & Project Banner */}
          <div className="px-2 py-1 mb-4 xl:mb-5">
            <Logo size={40} withWordmark />
          </div>

          {/* Navigation Links with Shared Sliding Pill & 3px Indicator */}
          <nav className="space-y-1 xl:space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.to || location.pathname.startsWith(item.to + '/')

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

        {/* Sidebar Footer with Streak Level & Animated Tip Card */}
        <div className="pt-2 pb-2 space-y-2">
          <NavLink
            to="/analytics"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/45 hover:bg-white/70 border border-white/60 transition-all text-xs group"
            title="View streak tier progression in Analytics"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Streak Level
              </span>
              <span className="text-xs font-black text-[#0f2819] tabular-nums">
                {currentStreak} day{currentStreak === 1 ? '' : 's'}
              </span>
            </div>
            <StreakBadge days={currentStreak} size="sm" showLabel={true} showDaysCount={false} />
          </NavLink>
          <SidebarTipCard />
        </div>
      </aside>

      {/* Main Content Area: Document itself scrolls below 1024px */}
      <div className="flex-1 flex flex-col min-w-0 z-10 pb-[calc(64px+env(safe-area-inset-bottom,0px)+24px)] lg:pb-0">
        {/* Mobile Compact Glass Header (< 1024px) */}
        <header className="lg:hidden glass-panel border-b border-white/60 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Left: Logo & Current Page Title */}
          <div className="flex items-center gap-2 min-w-0">
            <Logo size={28} className="shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-sm text-[#14301f] leading-tight truncate block">
                {pageTitle}
              </span>
              <p className="text-[10px] text-emerald-900 font-semibold leading-none">
                EcoPulse
              </p>
            </div>
          </div>

          {/* Right: Search, Bell Popover, and Settings Avatar Chip */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Header Compact Streak Level Badge */}
            <NavLink
              to="/analytics"
              className="px-2 py-1 rounded-xl bg-white/50 hover:bg-white/75 border border-white/60 flex items-center gap-1.5 transition-all text-xs font-black text-[#0f2819] tabular-nums"
              title="View streak tiers in Analytics"
              aria-label={`Current streak: ${currentStreak} days`}
            >
              <StreakBadge days={currentStreak} size="sm" compact showDaysCount={false} showLabel={false} />
              <span>{currentStreak}d</span>
            </NavLink>

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
        <main className="flex-1 p-3.5 sm:p-5 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-8">
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
              <Suspense
                fallback={
                  <div
                    role="status"
                    aria-label="Loading page content"
                    className="min-h-[40vh] flex items-center justify-center p-4 sm:p-8 select-none"
                  >
                    <div className="glass-panel px-6 py-5 rounded-2xl flex items-center gap-3.5 shadow-lg border border-white/60">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-emerald-600/30 border-t-emerald-700 animate-spin"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-[#14301f] tracking-wide">
                        Loading EcoPulse...
                      </span>
                    </div>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Small Glass Footer: Accessible Internal Links + Credits, Desktop and Mobile Safe */}
        <footer className="mt-auto border-t border-emerald-900/10 bg-white/40 backdrop-blur-md py-6 px-4 sm:px-8 text-xs text-slate-700 pb-28 lg:pb-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Logo size={20} />
              <span>EcoPulse</span>
              <span className="font-normal text-slate-600 hidden sm:inline">· Smart Energy Saving Habit Tracker</span>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-medium">
              <Link to="/" className="hover:text-emerald-950 hover:underline transition-colors">
                Dashboard
              </Link>
              <Link to="/reminders" className="hover:text-emerald-950 hover:underline transition-colors">
                Scheduled Reminders
              </Link>
              <Link to="/calculator" className="hover:text-emerald-950 hover:underline transition-colors">
                Energy Calculator
              </Link>
              <Link to="/analytics" className="hover:text-emerald-950 hover:underline transition-colors">
                Habit Analytics
              </Link>
              <Link to="/learn" className="hover:text-emerald-950 hover:underline transition-colors">
                Conservation Guides
              </Link>
              <Link to="/settings" className="hover:text-emerald-950 hover:underline transition-colors">
                Settings & Tariffs
              </Link>
              <Link to="/settings#credits" className="hover:text-emerald-950 hover:underline transition-colors">
                Project Credits
              </Link>
            </nav>
            <div className="text-[11px] text-slate-600 text-center md:text-right">
              Built for CHE110 · All user data stays private in local browser storage
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Notch Dock: Fixed at Root, Replaces Bottom Tab Bar below 1024px */}
      <NotchDock />
    </motion.div>
  )}
</AnimatePresence>
  )
}
