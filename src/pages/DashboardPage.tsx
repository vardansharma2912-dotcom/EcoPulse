import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { CountUp } from '../components/ui/CountUp'
import { SemiCircleGauge } from '../components/charts/SemiCircleGauge'
import { PillBarChart } from '../components/charts/PillBarChart'
import { TimeTrackerCard } from '../components/charts/TimeTrackerCard'
import { useToast } from '../context/useToast'
import { useAppState } from '../state'
import { todayKey } from '../lib/dates'
import { isDueOn, computeStreak } from '../lib/schedule'
import { weeklySeries } from '../lib/analytics'
import { containerVariants, cardVariants, highlightCardVariants } from '../lib/motionVariants'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { DemoBanner } from '../components/layout/DemoBanner'
import { GettingStartedCard } from '../components/dashboard/GettingStartedCard'
import type { Reminder } from '../types'
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Plus,
  Calculator,
  RotateCcw,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { state, completeReminder, undoCompletion, addReminder } = useAppState()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [now] = useState(() => new Date())
  const today = todayKey(now)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [chartMetric, setChartMetric] = useState<'kwh' | 'actions'>('kwh')

  // Calculations derived purely from real state
  const dueTodayReminders = useMemo(() => {
    return state.reminders.filter((r) => isDueOn(r, today))
  }, [state.reminders, today])

  const totalDueToday = dueTodayReminders.length

  const todayCompletions = useMemo(() => {
    return state.completions.filter((c) => c.date === today)
  }, [state.completions, today])

  const completedTodayCount = todayCompletions.length

  const snoozedTodayCount = useMemo(() => {
    return dueTodayReminders.filter((r) => {
      return (
        r.snoozedUntil &&
        new Date(r.snoozedUntil) > now &&
        !todayCompletions.some((c) => c.reminderId === r.id)
      )
    }).length
  }, [dueTodayReminders, todayCompletions, now])

  const pendingTodayCount = Math.max(0, totalDueToday - completedTodayCount - snoozedTodayCount)

  const kwhSavedToday = todayCompletions.reduce((acc, c) => acc + c.kWh, 0)
  const kwhSavedAllTime = state.completions.reduce((acc, c) => acc + c.kWh, 0)
  const costSavedAllTime = state.completions.reduce((acc, c) => acc + c.costSaved, 0)

  const currentStreak = useMemo(() => {
    return computeStreak(state.completions, today)
  }, [state.completions, today])

  // Weekly series data for the PillBarChart
  const weeklyData = useMemo(() => {
    return weeklySeries(state.completions, now)
  }, [state.completions, now])

  // Recent 8 completions sorted latest first
  const recentCompletions = useMemo(() => {
    return [...state.completions]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 8)
  }, [state.completions])

  const isReminderDoneToday = (reminderId: string) => {
    return todayCompletions.some((c) => c.reminderId === reminderId)
  }

  const handleCreateReminder = (data: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => {
    if (!('id' in data)) {
      addReminder(data)
      showToast('Reminder created!')
    }
  }

  const handleComplete = (reminder: Reminder) => {
    completeReminder(reminder.id, today)
    showToast(`Marked "${reminder.title}" done`, {
      label: 'Undo',
      onClick: () => {
        undoCompletion(reminder.id, today)
        showToast('Completion undone')
      },
    })
  }

  const handleUndo = (reminderId: string) => {
    undoCompletion(reminderId, today)
    showToast('Completion undone')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Energy Conservation Dashboard"
        description="Daily overview of your energy-saving actions and estimated savings."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Calculator className="w-3.5 h-3.5" />}
              onClick={() => navigate('/calculator')}
            >
              Appliance Calculator
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Reminder
            </Button>
          </div>
        }
      />

      <DemoBanner />

      {/* Getting Started Progress Card */}
      <GettingStartedCard onOpenAddReminder={() => setAddDialogOpen(true)} />

      {/* Grid of Key Metrics Cards with CountUp - Forest Hero Card in Position 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Highlighted Solid Deep Forest Hero Metric Card */}
        <motion.div variants={highlightCardVariants}>
          <div className="h-full rounded-2xl p-4 sm:p-4.5 bg-[#0a381e] text-white shadow-xl border border-emerald-500/20 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-emerald-100 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Energy Saved Today</span>
                <div className="flex items-center gap-1 text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                <CountUp value={kwhSavedToday} decimals={2} /> <span className="text-sm font-bold text-emerald-300">kWh</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>{completedTodayCount} action{completedTodayCount === 1 ? '' : 's'} logged today</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Due Today */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" className="p-4 group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
                <div className="flex items-center gap-1 text-emerald-800">
                  <Calendar className="w-4 h-4" />
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                <CountUp value={totalDueToday} />
              </p>
            </div>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Scheduled for today</p>
          </Card>
        </motion.div>

        {/* Card 3: Completed Today */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" className="p-4 group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
                <div className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                <CountUp value={completedTodayCount} />
              </p>
            </div>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">
              <CountUp value={pendingTodayCount} /> pending action{pendingTodayCount === 1 ? '' : 's'}
            </p>
          </Card>
        </motion.div>

        {/* Card 4: Action Streak */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" className="p-4 group h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Action Streak</span>
                <div className="flex items-center gap-1 text-amber-700">
                  <Flame className="w-4 h-4" />
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 tabular-nums tracking-tight flex items-baseline gap-1">
                <CountUp value={currentStreak} />
                <span className="text-sm font-semibold text-[#1e3f2b]">day{currentStreak === 1 ? '' : 's'}</span>
              </p>
            </div>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Consecutive days active</p>
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Project Analytics (PillBarChart) + Featured Reminders Card (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Project Analytics Pill Bar Chart (7 cols on lg) */}
        <motion.div variants={cardVariants} className="lg:col-span-7 xl:col-span-8">
          <Card variant="glass-strong" className="p-5 sm:p-6 h-full flex flex-col justify-between">
            <PillBarChart
              data={weeklyData}
              metric={chartMetric}
              onMetricChange={setChartMetric}
              height={195}
            />
          </Card>
        </motion.div>

        {/* Featured Reminders Card (5 cols on lg) */}
        <motion.div variants={cardVariants} className="lg:col-span-5 xl:col-span-4">
          <Card variant="glass-strong" className="p-5 h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-[#14301f]">Today's Reminders</h3>
              </div>
              <Badge variant="emerald" size="sm">
                {completedTodayCount}/{totalDueToday} Done
              </Badge>
            </div>

            {dueTodayReminders.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/50 border border-white/70 text-center space-y-2">
                <p className="text-xs font-bold text-[#102819]">No Reminders Due Today</p>
                <p className="text-[11px] text-[#1e3f2b]">All quiet! You can add custom schedules anytime.</p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setAddDialogOpen(true)}
                  className="mx-auto"
                >
                  Add Reminder
                </Button>
              </div>
            ) : (() => {
              const pendingItem = dueTodayReminders.find((r) => !isReminderDoneToday(r.id))
              if (!pendingItem) {
                return (
                  <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
                    <p className="text-xs font-bold text-emerald-950">All Caught Up for Today!</p>
                    <p className="text-[11px] text-emerald-900">
                      Great job completing all {totalDueToday} scheduled energy checks today.
                    </p>
                  </div>
                )
              }
              return (
                <div className="p-4 rounded-2xl bg-white/70 border border-emerald-900/10 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Next Up • {pendingItem.time}
                      </span>
                      <h4 className="text-sm font-bold text-[#0f2819] mt-1.5 leading-snug">
                        {pendingItem.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#1e3f2b] font-medium">
                    {pendingItem.applianceWatts && (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Zap className="w-3 h-3 text-emerald-700" />
                        {pendingItem.applianceWatts}W
                      </span>
                    )}
                    <span>• Est. {pendingItem.avoidedHours ?? 1}h avoided</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    icon={
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    onClick={() => handleComplete(pendingItem)}
                  >
                    Complete Check
                  </Button>
                </div>
              )
            })()}

            {/* Quick Link to all reminders */}
            <div className="pt-2 border-t border-emerald-900/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#1e3f2b] font-medium">
                {pendingTodayCount} remaining check{pendingTodayCount === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={() => navigate('/reminders')}
                className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                View all schedules →
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Row 3: Active Device Habits + SemiCircleGauge + TimeTrackerCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Appliance Conservation Status (Matching Team Collaboration from video) */}
        <motion.div variants={cardVariants}>
          <Card variant="glass-strong" className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#14301f]">Conservation Habits</h3>
              <Badge variant="neutral" size="sm">Active</Badge>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Air Conditioning Set-Point', category: 'Cooling', status: 'Moderate Setting', impact: 'Compressor load reduced' },
                { name: 'Computer Workstation Standby', category: 'Computing', status: 'Unplugged at Wall', impact: 'Phantom load isolated' },
                { name: 'Fume Hood Sash Glass', category: 'Laboratory', status: 'Lowered', impact: 'Ventilation exhaust saved' },
                { name: 'Daylight Harvesting', category: 'Lighting', status: 'Lamps Off', impact: 'Natural daylight used' },
              ].map((habit) => (
                <div
                  key={habit.name}
                  className="p-2.5 rounded-xl bg-white/60 border border-emerald-950/5 flex items-center justify-between text-xs hover:bg-white/85 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#102819] truncate">{habit.name}</p>
                    <span className="text-[10px] text-[#1e3f2b]">{habit.category} · {habit.impact}</span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {habit.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#1e3f2b] font-medium pt-1">
              Top monitored appliances on campus & home
            </p>
          </Card>
        </motion.div>

        {/* Card 2: Today's Progress Semi-Circle Ring Gauge */}
        <motion.div variants={cardVariants}>
          <Card variant="glass-strong" className="p-5 flex flex-col items-center justify-between h-full">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">Today's Progress</span>
              <Badge variant="emerald" size="sm">Live</Badge>
            </div>

            <SemiCircleGauge
              completed={completedTodayCount}
              snoozed={snoozedTodayCount}
              pending={pendingTodayCount}
              total={totalDueToday}
              className="py-1"
            />

            <p className="text-[11px] text-[#1e3f2b] font-medium text-center mt-2">
              {completedTodayCount} of {totalDueToday} actions completed today
            </p>
          </Card>
        </motion.div>

        {/* Card 3: The Iconic Time Tracker Card from the Reference Video */}
        <motion.div variants={cardVariants}>
          <TimeTrackerCard className="h-full min-h-[220px]" />
        </motion.div>
      </div>

      {/* Two Column Layout: Today's Reminders & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Scheduled Reminders (2 Cols) */}
        <motion.div variants={cardVariants} className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#102819] flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" /> Today's Scheduled Reminders
            </h2>
            <span className="text-xs font-semibold text-emerald-900">
              <CountUp value={completedTodayCount} /> of <CountUp value={totalDueToday} /> Done
            </span>
          </div>

          {dueTodayReminders.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-6 h-6 text-emerald-800" />}
              title="No Reminders Due Today"
              description="You have no active energy reminders scheduled for today. You can add new reminders or check recurrence settings."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setAddDialogOpen(true)}
                >
                  Create a Reminder
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {dueTodayReminders.map((reminder) => {
                  const isDone = isReminderDoneToday(reminder.id)

                  return (
                    <motion.div
                      key={reminder.id}
                      layout
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    >
                      <Card
                        variant="glass"
                        className={`p-3.5 transition-colors ${
                          isDone
                            ? 'border-emerald-600/40 bg-emerald-50/70'
                            : 'hover:bg-white/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-bold text-sm truncate ${
                                  isDone ? 'line-through text-slate-500' : 'text-[#102819]'
                                }`}
                              >
                                {reminder.title}
                              </p>
                              <Badge variant={isDone ? 'emerald' : 'neutral'} size="sm">
                                {reminder.time}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#1e3f2b] font-medium">
                              {reminder.applianceWatts && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Zap className="w-3 h-3 text-emerald-700" />
                                  {reminder.applianceWatts}W
                                </span>
                              )}
                              <span>Est. {reminder.avoidedHours ?? 1}h avoided</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isDone ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<RotateCcw className="w-3.5 h-3.5" />}
                                onClick={() => handleUndo(reminder.id)}
                              >
                                Undo
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <motion.path
                                      d="M5 13l4 4L19 7"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.25, ease: 'easeOut' }}
                                    />
                                  </svg>
                                }
                                onClick={() => handleComplete(reminder)}
                              >
                                Mark Done
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Recent Activity Log (1 Col) */}
        <motion.div variants={cardVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#102819] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Recent Completed Actions
            </h2>
            <span className="text-xs font-semibold text-[#1e3f2b]">
              Last {recentCompletions.length}
            </span>
          </div>

          {/* All-Time Impact Snapshot */}
          <Card variant="glass" className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#102819]">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-800" /> All-Time Impact
              </span>
              <span className="text-emerald-900 font-extrabold tabular-nums">
                <CountUp value={kwhSavedAllTime} decimals={2} /> kWh
              </span>
            </div>
            <p className="text-[11px] text-[#1e3f2b] font-medium">
              Total ₹<CountUp value={costSavedAllTime} decimals={2} /> avoided across all recorded actions.
            </p>
          </Card>

          {recentCompletions.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="w-6 h-6 text-emerald-800" />}
              title="No Actions Completed Yet"
              description="When you mark reminders as done, your estimated energy savings and timestamps will be logged here."
            />
          ) : (
            <Card variant="glass" className="p-3 divide-y divide-emerald-900/10">
              {recentCompletions.map((comp) => {
                const timeStr = new Date(comp.completedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={comp.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#102819] truncate">{comp.title}</p>
                      <p className="text-[11px] text-[#1e3f2b] font-medium">
                        {comp.date} at {timeStr}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-900 tabular-nums">
                        +{comp.kWh.toFixed(2)} kWh
                      </p>
                      <p className="text-[11px] text-[#1e3f2b] tabular-nums font-semibold">
                        +₹{comp.costSaved.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </Card>
          )}
        </motion.div>
      </div>

      {/* Add Reminder Dialog (Renders as Drawer) */}
      <ReminderFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreateReminder}
      />
    </motion.div>
  )
}
