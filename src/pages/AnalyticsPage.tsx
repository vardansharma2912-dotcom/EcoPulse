import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { DemoBanner } from '../components/layout/DemoBanner'
import { CountUp } from '../components/ui/CountUp'
import { PillBarChart } from '../components/charts/PillBarChart'
import { AnalyticsTrendChart } from '../components/charts/AnalyticsTrendChart'
import { useAppState } from '../state'
import {
  weeklySeries,
  getWeekComparison,
  computeStreaksFromCompletions,
  groupCompletionsByDate,
  getAchievements,
} from '../lib/analytics'
import { containerVariants, cardVariants } from '../lib/motionVariants'
import { StreakBadge } from '../components/ui/StreakBadge'
import { STREAK_TIERS, getStreakTier } from '../lib/streakTiers'
import {
  Zap,
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
  Check,
  ArrowRight,
} from 'lucide-react'

export const AnalyticsPage: React.FC = () => {
  const { state } = useAppState()
  const currency = state.settings.currency || '₹'
  const [chartMetric, setChartMetric] = useState<'kwh' | 'actions'>('kwh')
  const [visibleDateGroups, setVisibleDateGroups] = useState<number>(5)

  // Purely computed metrics
  const [now] = useState(() => new Date())
  const weeklyData = useMemo(() => weeklySeries(state.completions, now), [state.completions, now])
  const weekComparison = useMemo(() => getWeekComparison(state.completions, now), [state.completions, now])
  const streaks = useMemo(() => computeStreaksFromCompletions(state.completions, now), [state.completions, now])
  const currentTier = useMemo(() => getStreakTier(streaks.currentStreak), [streaks.currentStreak])
  const groupedHistory = useMemo(() => groupCompletionsByDate(state.completions), [state.completions])
  const achievements = useMemo(() => getAchievements(state.completions, streaks), [state.completions, streaks])

  const totalKwhAllTime = useMemo(
    () => state.completions.reduce((sum, c) => sum + (c.kWh || 0), 0),
    [state.completions]
  )
  const totalCostAllTime = useMemo(
    () => state.completions.reduce((sum, c) => sum + (c.costSaved || 0), 0),
    [state.completions]
  )
  const totalActionsAllTime = state.completions.length

  const visibleGroups = useMemo(
    () => groupedHistory.slice(0, visibleDateGroups),
    [groupedHistory, visibleDateGroups]
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 lg:space-y-6 flex-1 flex flex-col"
    >
      <PageHeader
        title="Energy Conservation Trends & Habit Analytics"
        description="Historical trends, weekly activity breakdowns, habit streaks, and milestone achievements."
      />

      {/* Demo sample data banner if active */}
      <DemoBanner />

      {/* Key All-Time Overview Cards with CountUp */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div variants={cardVariants} className="h-full flex flex-col">
          <Card variant="glass" padding="none" className="p-3 sm:p-3.5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-0.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Total Saved</span>
                <Zap className="w-3.5 h-3.5 text-emerald-800" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                <CountUp value={totalKwhAllTime} decimals={2} /> <span className="text-xs sm:text-sm font-bold text-[#1b4332]">kWh</span>
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#1e3f2b] font-medium mt-1">Estimated all-time energy</p>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="h-full flex flex-col">
          <Card variant="glass" padding="none" className="p-3 sm:p-3.5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-0.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Cost Avoided</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-800" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                <CountUp value={totalCostAllTime} decimals={2} prefix={currency} />
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#1e3f2b] font-medium mt-1">Estimated at active tariffs</p>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="h-full flex flex-col">
          <Card variant="glass" padding="none" className="p-3 sm:p-3.5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-0.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Total Actions</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#0f2819] tabular-nums tracking-tight">
                <CountUp value={totalActionsAllTime} />
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#1e3f2b] font-medium mt-1">Checks completed</p>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="h-full flex flex-col">
          <Card variant="glass" padding="none" className="p-3 sm:p-3.5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#14301f] mb-0.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Active Streak</span>
                <Flame className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex items-center justify-between gap-1">
                <p className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#0f2819] tabular-nums tracking-tight whitespace-nowrap">
                  <CountUp value={streaks.currentStreak} /> <span className="text-xs sm:text-sm font-bold text-[#1b4332]">{streaks.currentStreak === 1 ? 'day' : 'days'}</span>
                </p>
                <div className="shrink-0 scale-90 sm:scale-95 origin-right">
                  <StreakBadge
                    days={streaks.currentStreak}
                    size="sm"
                    compact={true}
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#1e3f2b] font-medium mt-1 truncate">
              {currentTier.name} · Best: {streaks.longestStreak}d
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Streak Levels & Mastery Progression Strip */}
      <motion.div variants={cardVariants}>
        <Card variant="glass-strong" className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Flame className="w-4 h-4 text-amber-600 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-[#0f2819] uppercase tracking-wide">
                <span className="sm:hidden">Streak Mastery Tiers</span>
                <span className="hidden sm:inline">Streak Levels &amp; Tier Progression</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs font-medium text-[#1e3f2b] hidden xs:inline">Current:</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border shadow-xs"
                style={{
                  backgroundColor: currentTier.colors.bg,
                  color: currentTier.colors.text,
                  borderColor: currentTier.colors.border,
                }}
              >
                {currentTier.name} ({streaks.currentStreak}d)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#1e3f2b] leading-tight">
            Advance through 8 animated mastery tiers by maintaining daily energy-saving habits.
          </p>

          {/* Horizontal Strip of All 8 Tiers: 4 cols on mobile (2 rows), 8 cols on desktop (1 row) */}
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 pt-0.5">
            {STREAK_TIERS.map((t) => {
              const isCurrent = t.id === currentTier.id
              const isUnlocked = streaks.currentStreak >= t.minDays
              const isSurpassed = t.nextAt !== null && streaks.currentStreak >= t.nextAt

              return (
                <div
                  key={t.id}
                  className={`relative rounded-lg sm:rounded-xl p-1.5 sm:p-2 flex flex-col items-center text-center transition-all border ${
                    isCurrent
                      ? 'shadow-sm scale-[1.02] z-10'
                      : isUnlocked
                      ? 'bg-white/60 border-white/80'
                      : 'bg-white/20 border-black/5 opacity-50 grayscale-[35%]'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? t.colors.bg : undefined,
                    borderColor: isCurrent ? t.colors.primary : undefined,
                  }}
                >
                  {isCurrent && (
                    <span
                      className="absolute -top-1.5 px-1 py-0.1 rounded-full text-[8px] font-extrabold uppercase tracking-tight text-white shadow-xs"
                      style={{ backgroundColor: t.colors.primary }}
                    >
                      Active
                    </span>
                  )}

                  <div className="my-0.5">
                    <StreakBadge
                      days={Math.max(t.minDays, isCurrent ? streaks.currentStreak : t.minDays)}
                      size="sm"
                      compact={true}
                      isLocked={!isUnlocked}
                      animated={isUnlocked}
                    />
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-[#0f2819] leading-tight mt-0.5 truncate w-full">
                    {t.name}
                  </p>

                  <p className="text-[9.5px] sm:text-[10px] text-[#1e3f2b] font-semibold tabular-nums leading-tight mt-0.5">
                    {t.nextAt === null
                      ? '100+ d'
                      : t.minDays === 0
                      ? '0 d'
                      : `${t.minDays}–${t.nextAt - 1} d`}
                  </p>

                  <div className="mt-0.5 leading-none">
                    {isCurrent ? (
                      <span className="text-[9px] sm:text-[9.5px] font-black" style={{ color: t.colors.text }}>
                        ★ Active
                      </span>
                    ) : isSurpassed ? (
                      <span className="text-[9px] sm:text-[9.5px] font-semibold text-emerald-800 flex items-center justify-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Reached
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[9.5px] text-slate-400 font-semibold">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-900/10 flex items-center justify-between text-[11px] flex-wrap gap-1.5">
            <span className="text-[#1e3f2b] font-medium">Keep your habit streak active every day:</span>
            <Link
              to="/reminders"
              className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:text-emerald-950 hover:underline"
            >
              Manage Reminders
              <ArrowRight className="w-3 h-3 text-emerald-800" />
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Side-by-Side Activity & Comparative Trend Charts (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} className="h-full">
          <Card variant="glass-strong" className="p-5 sm:p-6 space-y-4 h-full flex flex-col justify-between">
            <PillBarChart
              data={weeklyData}
              metric={chartMetric}
              onMetricChange={setChartMetric}
              height={220}
            />
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="h-full">
          <Card variant="glass-strong" className="p-5 sm:p-6 h-full flex flex-col justify-between">
            <AnalyticsTrendChart completions={state.completions} height={220} />
          </Card>
        </motion.div>
      </div>

      {/* Week-over-Week Comparison */}
      <motion.div variants={cardVariants}>
        <Card variant="glass" className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0f2819]">
                This Week vs Last Week
              </h2>
              <Badge variant="neutral" size="sm">Estimated Comparison</Badge>
            </div>
            <p className="text-xs text-[#1e3f2b] mt-0.5">
              Pacing and habit consistency compared to the previous Monday–Sunday window.
            </p>
          </div>

          {weekComparison.hasLastWeekData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/60 bg-white/50 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e3f2b]">
                  Energy Saved (kWh)
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-extrabold text-[#0f2819]">
                    {weekComparison.thisWeekKwh.toFixed(2)} kWh
                  </span>
                  <span className="text-xs text-[#1e3f2b]">
                    vs {weekComparison.lastWeekKwh.toFixed(2)} kWh last week
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-800 mt-2">
                  {weekComparison.kwhDiff >= 0
                    ? `+${weekComparison.kwhDiff.toFixed(2)} kWh higher than last week`
                    : `${weekComparison.kwhDiff.toFixed(2)} kWh lower than last week`}
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/50 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e3f2b]">
                  Actions Completed
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-extrabold text-[#0f2819]">
                    {weekComparison.thisWeekActions} actions
                  </span>
                  <span className="text-xs text-[#1e3f2b]">
                    vs {weekComparison.lastWeekActions} actions last week
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-800 mt-2">
                  {weekComparison.actionsDiff >= 0
                    ? `+${weekComparison.actionsDiff} more actions completed`
                    : `${weekComparison.actionsDiff} fewer actions completed`}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/60 bg-white/40 p-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-800/10 text-emerald-900 mt-0.5">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#0f2819]">Not enough history yet</p>
                  <Badge variant="neutral" size="sm">Awaiting Data</Badge>
                </div>
                <p className="text-xs text-[#1e3f2b] mt-1">
                  Comparative analysis requires activity across two consecutive calendar weeks. Continue checking off your reminders this week and next week to automatically reveal comparative trends.
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Achievement Badges (Dynamically derived from real completions, never stored) */}
      <motion.div variants={cardVariants}>
        <Card variant="glass" className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-800" />
              <h2 className="text-base sm:text-lg font-bold text-[#0f2819]">
                Milestone Badges
              </h2>
              <Badge variant="neutral" size="sm">Derived Dynamically</Badge>
            </div>
            <p className="text-xs text-[#1e3f2b] mt-0.5">
              Earned based on authentic completed actions and streaks. Never hardcoded or stored separately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 transition-all border flex flex-col justify-between h-full ${
                  badge.unlocked
                    ? 'border-emerald-500/40 bg-emerald-800/10 shadow-xs'
                    : 'border-white/50 bg-white/30 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        badge.unlocked
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-black/5 text-[#1e3f2b]'
                      }`}
                    >
                      {badge.type === 'streak' ? (
                        <Flame className="h-4 w-4" />
                      ) : badge.type === 'energy' ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0f2819]">{badge.title}</h3>
                      <p className="text-[11px] text-[#1e3f2b] line-clamp-1">{badge.description}</p>
                    </div>
                  </div>

                  <Badge
                    variant={badge.unlocked ? 'emerald' : 'neutral'}
                    size="sm"
                  >
                    {badge.progressText}
                  </Badge>
                </div>

                {badge.unlocked ? (
                  <div className="mt-2.5 pt-1.5 border-t border-emerald-800/10 flex items-center justify-between text-[10px] text-emerald-900 font-bold">
                    <span>Milestone Achieved</span>
                    <span className="text-emerald-700 font-extrabold">✓ Completed</span>
                  </div>
                ) : (
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.round((badge.current / badge.target) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[#1e3f2b] font-medium text-right mt-1">
                      Progress: {badge.progressText}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Completion History Grouped by Date */}
      <motion.div variants={cardVariants}>
        <Card variant="glass" className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-800" />
                <h2 className="text-base sm:text-lg font-bold text-[#0f2819]">
                  Action Completion Log
                </h2>
              </div>
              <p className="text-xs text-[#1e3f2b] mt-0.5">
                Chronological log of verified energy-saving habits, grouped by date.
              </p>
            </div>

            {state.completions.length > 0 && (
              <Badge variant="neutral" size="sm">
                {state.completions.length} total entries
              </Badge>
            )}
          </div>

          {groupedHistory.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<Clock className="w-6 h-6 text-emerald-800" />}
                title="No Actions Logged Yet"
                description="When you mark reminders as done on the Dashboard or Reminders page, they will be archived here with exact timestamps and estimated savings."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {visibleGroups.map((group) => (
                <div key={group.dateKey} className="space-y-2">
                  {/* Date Group Header */}
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5 pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                      <span className="text-xs font-bold text-[#0f2819] uppercase tracking-wide">
                        {group.displayDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#1e3f2b] font-medium">
                      <span>{group.totalKwh.toFixed(2)} kWh est.</span>
                      <span>•</span>
                      <span>{currency}{group.totalCost.toFixed(2)} saved</span>
                    </div>
                  </div>

                  {/* Completion Items */}
                  <div className="space-y-1.5">
                    {group.completions.map((comp) => {
                      const timeStr = new Date(comp.completedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })

                      return (
                        <div
                          key={comp.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/50 px-3.5 py-2.5 transition-all hover:bg-white/70"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-800/10 text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#0f2819] truncate">
                                {comp.title}
                              </p>
                              <p className="text-[10px] text-[#1e3f2b] flex items-center gap-1.5">
                                <span>Completed at {timeStr}</span>
                                {comp.isDemo && (
                                  <span className="rounded-sm bg-amber-500/20 px-1 py-0.2 text-[9px] font-semibold text-amber-900">
                                    Demo
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-[#0f2819] tabular-nums">
                              +{comp.kWh.toFixed(2)} kWh
                            </p>
                            <p className="text-[10px] text-emerald-800 font-semibold tabular-nums">
                              +{currency}{comp.costSaved.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Show More Button if more date groups exist */}
              {groupedHistory.length > visibleDateGroups && (
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleDateGroups((prev) => prev + 5)}
                    icon={<ChevronDown className="w-3.5 h-3.5" />}
                  >
                    Show More History ({groupedHistory.length - visibleDateGroups} dates remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
