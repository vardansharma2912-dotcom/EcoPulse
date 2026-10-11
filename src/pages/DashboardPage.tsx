import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useAppState } from '../state'
import { todayKey } from '../lib/dates'
import { isDueOn, computeStreak } from '../lib/schedule'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { DemoBanner } from '../components/layout/DemoBanner'
import type { Reminder } from '../types'
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
  Flame,
  Plus,
  Calculator,
  RotateCcw,
  Check,
  TrendingUp,
  Calendar,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { state, completeReminder, undoCompletion, addReminder } = useAppState()
  const navigate = useNavigate()
  const today = todayKey()

  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Calculations derived purely from real state
  const dueTodayReminders = useMemo(() => {
    return state.reminders.filter((r) => isDueOn(r, today))
  }, [state.reminders, today])

  const totalDueToday = dueTodayReminders.length

  const todayCompletions = useMemo(() => {
    return state.completions.filter((c) => c.date === today)
  }, [state.completions, today])

  const completedTodayCount = todayCompletions.length
  const pendingTodayCount = Math.max(0, totalDueToday - completedTodayCount)

  const completionRate = totalDueToday > 0
    ? `${Math.min(100, Math.round((completedTodayCount / totalDueToday) * 100))}%`
    : '—'

  const kwhSavedToday = todayCompletions.reduce((acc, c) => acc + c.kWh, 0)
  const kwhSavedAllTime = state.completions.reduce((acc, c) => acc + c.kWh, 0)
  const costSavedAllTime = state.completions.reduce((acc, c) => acc + c.costSaved, 0)

  const currentStreak = useMemo(() => {
    return computeStreak(state.completions, today)
  }, [state.completions, today])

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
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Due Today */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-[#14301f] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
            <Calendar className="w-4 h-4 text-emerald-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {totalDueToday}
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Scheduled for today</p>
        </Card>

        {/* Completed Today */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-[#14301f] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {completedTodayCount}
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">
            {pendingTodayCount} action{pendingTodayCount === 1 ? '' : 's'} pending
          </p>
        </Card>

        {/* Completion % */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-[#14301f] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Progress</span>
            <Percent className="w-4 h-4 text-emerald-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {completionRate}
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Of due reminders checked</p>
        </Card>

        {/* Current Active Streak */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-[#14301f] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Action Streak</span>
            <Flame className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 tabular-nums tracking-tight flex items-baseline gap-1">
            {currentStreak} <span className="text-sm font-semibold text-[#1e3f2b]">day{currentStreak === 1 ? '' : 's'}</span>
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Consecutive days active</p>
        </Card>
      </div>

      {/* Energy & Monetary Savings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass">
          <div className="flex items-center justify-between text-[#14301f] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Energy Saved Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {kwhSavedToday.toFixed(2)} <span className="text-sm font-bold text-[#1b4332]">kWh</span>
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-semibold mt-1">
            Estimated from today's completed reminders
          </p>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-[#14301f] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">All-Time Energy Saved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {kwhSavedAllTime.toFixed(2)} <span className="text-sm font-bold text-[#1b4332]">kWh</span>
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-semibold mt-1">
            Cumulative total across all logged actions
          </p>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-[#14301f] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Bill Savings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            ₹{costSavedAllTime.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-semibold mt-1">
            Estimated at ₹{state.settings.tariffPerKwh}/kWh (set in Settings)
          </p>
        </Card>
      </div>

      {/* Two Column Layout: Today's Reminders & Recent Activity Feed */}
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

                return (
                  <Card
                    key={reminder.id}
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
                          <span>
                            Est. {reminder.avoidedHours ?? 1}h avoided
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isDone ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => undoCompletion(reminder.id, today)}
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => completeReminder(reminder.id, today)}
                          >
                            Mark Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
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

      {/* Add Reminder Dialog */}
      <ReminderFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreateReminder}
      />
    </div>
  )
}
