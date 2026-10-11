import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { staggerContainerVariant, cardEntranceVariant } from '../lib/motionVariants'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { CountUp } from '../components/ui/CountUp'
import { PillBarChart } from '../components/charts/PillBarChart'
import { RingGauge } from '../components/charts/RingGauge'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { DemoBanner } from '../components/layout/DemoBanner'
import { useAppState } from '../state'
import { useToast } from '../context/useToast'
import { todayKey } from '../lib/dates'
import { isDueOn, computeStreak } from '../lib/schedule'
import { weeklySeries } from '../lib/analytics'
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
  const { toast } = useToast()
  const navigate = useNavigate()
  const [now] = useState(() => new Date())
  const today = todayKey(now)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [weeklyMetric, setWeeklyMetric] = useState<'kwh' | 'actions'>('kwh')
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null)

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
      if (!r.snoozedUntil) return false
      return new Date(r.snoozedUntil) > now
    }).length
  }, [dueTodayReminders, now])

  const pendingTodayCount = Math.max(0, totalDueToday - completedTodayCount - snoozedTodayCount)

  const kwhSavedToday = todayCompletions.reduce((acc, c) => acc + c.kWh, 0)
  const kwhSavedAllTime = state.completions.reduce((acc, c) => acc + c.kWh, 0)
  const costSavedAllTime = state.completions.reduce((acc, c) => acc + c.costSaved, 0)

  const currentStreak = useMemo(() => {
    return computeStreak(state.completions, today)
  }, [state.completions, today])

  // Weekly data series for PillBarChart
  const weeklyData = useMemo(() => {
    return weeklySeries(state.completions, now)
  }, [state.completions, now])

  // Recent 6 completions sorted latest first
  const recentCompletions = useMemo(() => {
    return [...state.completions]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 6)
  }, [state.completions])

  const isReminderDoneToday = (reminderId: string) => {
    return todayCompletions.some((c) => c.reminderId === reminderId)
  }

  const handleCreateReminder = (data: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => {
    if (!('id' in data)) {
      addReminder(data)
      toast(`Created reminder "${data.title}"`)
    }
  }

  const handleComplete = (reminder: Reminder) => {
    setJustCompletedId(reminder.id)
    completeReminder(reminder.id, today)
    toast(`Marked "${reminder.title}" done`, {
      action: {
        label: 'Undo',
        onClick: () => undoCompletion(reminder.id, today),
      },
    })
    setTimeout(() => setJustCompletedId(null), 1200)
  }

  const handleUndo = (reminder: Reminder) => {
    undoCompletion(reminder.id, today)
    toast(`Restored "${reminder.title}" to pending`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Conservation Dashboard"
        description="Daily overview of your energy-saving actions and estimated campus savings."
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

      {/* Grid 1: Staggered Key Metrics Cards */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        {/* Due Today */}
        <motion.div variants={cardEntranceVariant}>
          <Card interactive variant="glass" className="p-4 group">
            <div className="flex items-center justify-between text-[#14301f] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
              <div className="p-1.5 rounded-lg bg-emerald-800/10 text-emerald-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={totalDueToday} />
            </p>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Scheduled for today</p>
          </Card>
        </motion.div>

        {/* Completed Today */}
        <motion.div variants={cardEntranceVariant}>
          <Card interactive variant="glass" className="p-4 group">
            <div className="flex items-center justify-between text-[#14301f] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
              <div className="p-1.5 rounded-lg bg-emerald-800/10 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={completedTodayCount} />
            </p>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">
              {pendingTodayCount} action{pendingTodayCount === 1 ? '' : 's'} remaining
            </p>
          </Card>
        </motion.div>

        {/* Energy Saved Today */}
        <motion.div variants={cardEntranceVariant}>
          <Card interactive variant="glass" className="p-4 group">
            <div className="flex items-center justify-between text-[#14301f] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Saved Today</span>
              <div className="p-1.5 rounded-lg bg-emerald-800/10 text-emerald-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={kwhSavedToday} decimals={2} suffix=" kWh" />
            </p>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Estimated avoidance</p>
          </Card>
        </motion.div>

        {/* Current Active Streak (Highlighted Forest Metric Card with Shadow Bloom) */}
        <motion.div
          variants={cardEntranceVariant}
          animate={{
            boxShadow: [
              '0 4px 6px -1px rgba(10,56,30,0.1)',
              '0 14px 28px -4px rgba(10,56,30,0.28)',
            ],
          }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <Card
            interactive
            variant="forest"
            className="p-4 group"
          >
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Habit Streak</span>
              <div className="p-1.5 rounded-lg bg-white/15 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight flex items-baseline gap-1">
              <CountUp value={currentStreak} />
              <span className="text-sm font-semibold text-emerald-200">
                day{currentStreak === 1 ? '' : 's'}
              </span>
            </p>
            <p className="text-[11px] text-emerald-200/80 font-medium mt-1">
              Consecutive days active
            </p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Grid 2: Today's Progress Semi-Circle Ring Gauge + All-Time Cumulative Cards */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Semi-Circle Ring Gauge Card (1 Col) */}
        <motion.div variants={cardEntranceVariant}>
          <Card variant="glass-strong" className="p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">
                Today's Progress
              </span>
              <Badge variant="emerald" size="sm">Real State</Badge>
            </div>

            <RingGauge
              completed={completedTodayCount}
              snoozed={snoozedTodayCount}
              pending={pendingTodayCount}
              total={totalDueToday}
            />

            <p className="text-[11px] text-[#1e3f2b] text-center font-medium mt-2">
              Ratio of scheduled appliances turned off or checked today.
            </p>
          </Card>
        </motion.div>

        {/* All-Time Savings Cards (2 Cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={cardEntranceVariant} className="h-full">
            <Card interactive variant="glass" className="p-5 h-full flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-[#14301f] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">All-Time Energy Saved</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                  <CountUp value={kwhSavedAllTime} decimals={2} suffix=" kWh" />
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/10 flex items-center justify-between text-[11px] text-[#1e3f2b]">
                <span>Cumulative logged savings</span>
                <span className="font-bold flex items-center text-emerald-800">
                  Calculated <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardEntranceVariant} className="h-full">
            <Card interactive variant="glass" className="p-5 h-full flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-[#14301f] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Estimated Bill Avoidance</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                  <CountUp value={costSavedAllTime} decimals={2} prefix="₹" />
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/10 flex items-center justify-between text-[11px] text-[#1e3f2b]">
                <span>At active tariff rate (₹{state.settings.tariffPerKwh}/kWh)</span>
                <span className="font-bold flex items-center text-emerald-800">
                  Settings <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Grid 3: Weekly Activity Pill Bar Chart Card */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntranceVariant}>
          <Card variant="glass-strong" className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0f2819] flex items-center gap-2">
                  Weekly Energy Trend
                </h2>
                <p className="text-xs text-[#1e3f2b]">
                  Interactive breakdown across the active Monday–Sunday cycle.
                </p>
              </div>
              <Badge variant="neutral" size="sm">Estimated</Badge>
            </div>

            <PillBarChart
              data={weeklyData}
              metric={weeklyMetric}
              onMetricChange={setWeeklyMetric}
            />
          </Card>
        </motion.div>
      </motion.div>

      {/* Grid 4: Today's Scheduled Reminders & Recent Action Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Scheduled Reminders (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#102819] flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" /> Today's Scheduled Reminders
            </h2>
            <span className="text-xs font-semibold text-emerald-900">
              {completedTodayCount} of {totalDueToday} Done
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
              {dueTodayReminders.map((reminder) => {
                const isDone = isReminderDoneToday(reminder.id)
                const isPulsing = justCompletedId === reminder.id

                return (
                  <motion.div
                    key={reminder.id}
                    animate={
                      isPulsing
                        ? {
                            scale: [1, 1.015, 1],
                            backgroundColor: ['rgba(255,255,255,0.7)', 'rgba(16,185,129,0.25)', 'rgba(236,253,245,0.8)'],
                          }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl overflow-hidden"
                  >
                    <Card
                      variant="glass"
                      className={`p-3.5 transition-all ${
                        isDone
                          ? 'border-emerald-600/40 bg-emerald-50/70'
                          : 'hover:bg-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-sm truncate ${isDone ? 'line-through text-slate-500' : 'text-[#102819]'}`}>
                              {reminder.title}
                            </p>
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={isDone ? 'done-badge' : 'pending-badge'}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Badge variant={isDone ? 'emerald' : 'neutral'} size="sm">
                                  {reminder.time}
                                </Badge>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#1e3f2b] font-medium">
                            {reminder.applianceWatts && (
                              <span className="flex items-center gap-1 font-mono">
                                <Zap className="w-3 h-3 text-emerald-700" />
                                {reminder.applianceWatts}W
                              </span>
                            )}
                            <span>
                              Est. {reminder.avoidedHours ?? 1}h avoided
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isDone ? (
                            <div className="flex items-center gap-2">
                              {/* Animated Drawn Checkmark */}
                              <svg
                                className="w-5 h-5 text-emerald-700"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <motion.polyline
                                  points="20 6 9 17 4 12"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }}
                                />
                              </svg>

                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<RotateCcw className="w-3.5 h-3.5" />}
                                onClick={() => handleUndo(reminder)}
                              >
                                Undo
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
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
            </div>
          )}
        </div>

        {/* Recent Activity Log (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#102819] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Recent Completed Actions
            </h2>
            <span className="text-xs font-semibold text-[#1e3f2b]">
              Last {recentCompletions.length}
            </span>
          </div>

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
        </div>
      </div>

      {/* Add Reminder Right Drawer */}
      <ReminderFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreateReminder}
      />
    </div>
  )
}
