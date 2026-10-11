import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { staggerContainerVariant, cardEntranceVariant } from '../lib/motionVariants'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { DemoBanner } from '../components/layout/DemoBanner'
import { CountUp } from '../components/ui/CountUp'
import { PillBarChart } from '../components/charts/PillBarChart'
import { useAppState } from '../state'
import {
  weeklySeries,
  getWeekComparison,
  computeStreaksFromCompletions,
  groupCompletionsByDate,
  getAchievements,
  getTrendSeries,
} from '../lib/analytics'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Zap,
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react'

export const AnalyticsPage: React.FC = () => {
  const { state } = useAppState()
  const [chartMetric, setChartMetric] = useState<'kwh' | 'actions'>('kwh')
  const [visibleDateGroups, setVisibleDateGroups] = useState<number>(5)

  // Purely computed metrics
  const [now] = useState(() => new Date())
  const weeklyData = useMemo(() => weeklySeries(state.completions, now), [state.completions, now])
  const weekComparison = useMemo(() => getWeekComparison(state.completions, now), [state.completions, now])
  const streaks = useMemo(() => computeStreaksFromCompletions(state.completions, now), [state.completions, now])
  const groupedHistory = useMemo(() => groupCompletionsByDate(state.completions), [state.completions])
  const achievements = useMemo(() => getAchievements(state.completions, streaks), [state.completions, streaks])
  const trendData = useMemo(() => getTrendSeries(state.completions, now), [state.completions, now])

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
    <div className="space-y-6">
      <PageHeader
        title="Conservation Analytics"
        description="Historical trends, weekly activity breakdowns, habit streaks, and milestone achievements."
      />

      {/* Demo sample data banner if active */}
      <DemoBanner />

      {/* Key All-Time Overview Cards with CountUp & Stagger Entrance */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        <motion.div variants={cardEntranceVariant}>
          <Card interactive variant="glass" className="p-4 group">
            <div className="flex items-center justify-between text-[#14301f] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Saved</span>
              <div className="p-1.5 rounded-lg bg-emerald-800/10 text-emerald-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={totalKwhAllTime} decimals={2} suffix=" kWh" />
            </p>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Estimated all-time energy</p>
          </Card>
        </motion.div>

        <motion.div variants={cardEntranceVariant}>
          <Card interactive variant="glass" className="p-4 group">
            <div className="flex items-center justify-between text-[#14301f] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Cost Avoided</span>
              <div className="p-1.5 rounded-lg bg-emerald-800/10 text-emerald-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={totalCostAllTime} decimals={2} prefix="₹" />
            </p>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Estimated at active tariffs</p>
          </Card>
        </motion.div>

        <motion.div variants={cardEntranceVariant}>
          <Card interactive variant="glass" className="p-4 group">
            <div className="flex items-center justify-between text-[#14301f] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Actions</span>
              <div className="p-1.5 rounded-lg bg-emerald-800/10 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={totalActionsAllTime} />
            </p>
            <p className="text-[11px] text-[#1e3f2b] font-medium mt-1">Energy-saving checks completed</p>
          </Card>
        </motion.div>

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
          <Card interactive variant="forest" className="p-4 group">
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active Streak</span>
              <div className="p-1.5 rounded-lg bg-white/15 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight flex items-baseline gap-1">
              <CountUp value={streaks.currentStreak} />
              <span className="text-sm font-semibold text-emerald-200">
                day{streaks.currentStreak === 1 ? '' : 's'}
              </span>
            </p>
            <p className="text-[11px] text-emerald-200/80 font-medium mt-1">
              Longest record: {streaks.longestStreak} day{streaks.longestStreak === 1 ? '' : 's'}
            </p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Shared Pill Bar Chart (HTML/CSS + motion.div, not Recharts) */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntranceVariant}>
          <Card variant="glass-strong" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0f2819] flex items-center gap-2">
                  Weekly Activity Breakdown (Mon – Sun)
                </h2>
                <p className="text-xs text-[#1e3f2b]">
                  Tier-shaded pill bars showing daily energy avoidance and reminder actions.
                </p>
              </div>
              <Badge variant="neutral" size="sm">Estimated</Badge>
            </div>

            <PillBarChart
              data={weeklyData}
              metric={chartMetric}
              onMetricChange={setChartMetric}
            />
          </Card>
        </motion.div>
      </motion.div>

      {/* Analytics Trend Area Chart (Recharts) - Requirement 12 */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntranceVariant}>
          <Card variant="glass-strong" className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#0f2819]">
                    Conservation Trajectory (Period Comparison)
                  </h2>
                  <Badge variant="emerald" size="sm">Trend Area</Badge>
                </div>
                <p className="text-xs text-[#1e3f2b] mt-0.5">
                  Continuous estimated daily kWh curve comparing current period against the previous cycle.
                </p>
              </div>

              {/* Legend top right */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[#1e3f2b]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-[#196f45]" />
                  <span>This period</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t border-dashed border-[#8fa398]" />
                  <span>Previous</span>
                </div>
              </div>
            </div>

            {!trendData.hasTrendData ? (
              <EmptyState
                icon={<TrendingUp className="w-6 h-6 text-emerald-800" />}
                title="Not Enough History for Trend Analysis"
                description="Trend curves require at least 3 distinct days of conservation activity. Complete reminders or load sample data in Settings to preview."
              />
            ) : (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#196f45" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#196f45" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20, 48, 31, 0.08)" />
                    <XAxis
                      dataKey="day"
                      stroke="#1e3f2b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(20, 48, 31, 0.2)' }}
                    />
                    <YAxis
                      stroke="#1e3f2b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(20, 48, 31, 0.2)' }}
                      unit=" kWh"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof trendData.data)[0]
                          return (
                            <div className="rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md text-xs">
                              <p className="font-bold text-[#0f2819]">{data.day}</p>
                              <p className="text-emerald-800 font-semibold mt-0.5">
                                This period: {data.kwh.toFixed(2)} kWh
                              </p>
                              <p className="text-slate-500 font-medium">
                                Previous: {data.previousKwh.toFixed(2)} kWh
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    {/* Previous period: dashed grey-green line */}
                    <Area
                      type="monotone"
                      dataKey="previousKwh"
                      stroke="#8fa398"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fill="transparent"
                      isAnimationActive={true}
                    />
                    {/* This period: solid emerald line with soft green gradient fill */}
                    <Area
                      type="monotone"
                      dataKey="kwh"
                      stroke="#196f45"
                      strokeWidth={2.5}
                      fill="url(#trendGradient)"
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Week-over-Week Comparison */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntranceVariant}>
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

            {!weekComparison.hasLastWeekData ? (
              <div className="rounded-xl bg-white/50 p-4 border border-white/70 text-center">
                <p className="text-xs font-semibold text-[#1e3f2b]">
                  Not enough history yet — comparison will show once last week has logged actions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/60 p-4 border border-white/80 space-y-1">
                  <span className="text-xs font-semibold text-[#1e3f2b]">Energy Avoidance Shift</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f2819] tabular-nums">
                      {weekComparison.thisWeekKwh.toFixed(2)} kWh
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      vs {weekComparison.lastWeekKwh.toFixed(2)} kWh last week
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800">
                    {weekComparison.kwhDiff >= 0
                      ? `+${weekComparison.kwhDiff.toFixed(2)} kWh (+${Math.round((weekComparison.kwhDiff / (weekComparison.lastWeekKwh || 1)) * 100)}%) increase`
                      : `${weekComparison.kwhDiff.toFixed(2)} kWh shift`}
                  </p>
                </div>

                <div className="rounded-xl bg-white/60 p-4 border border-white/80 space-y-1">
                  <span className="text-xs font-semibold text-[#1e3f2b]">Completed Actions Shift</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f2819] tabular-nums">
                      {weekComparison.thisWeekActions} actions
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      vs {weekComparison.lastWeekActions} actions last week
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800">
                    {weekComparison.actionsDiff >= 0
                      ? `+${weekComparison.actionsDiff} more actions completed`
                      : `${weekComparison.actionsDiff} actions change`}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Milestone Achievement Badges */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntranceVariant}>
          <Card variant="glass" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0f2819] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" /> Milestone Achievement Badges
                </h2>
                <p className="text-xs text-[#1e3f2b] mt-0.5">
                  Real milestones dynamically computed from authentic completed actions (never fake).
                </p>
              </div>
              <Badge variant="emerald" size="sm">
                {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {achievements.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    badge.unlocked
                      ? 'bg-white/85 border-emerald-600/40 shadow-sm'
                      : 'bg-white/40 border-stone-200/60 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[#0f2819]">{badge.title}</span>
                    <Badge variant={badge.unlocked ? 'emerald' : 'neutral'} size="sm">
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#1e3f2b] leading-relaxed mb-3">
                    {badge.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#1e3f2b]">
                      <span>Progress</span>
                      <span>{badge.progressText}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-emerald-950/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((badge.current / badge.target) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Completion History Log Grouped by Date */}
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntranceVariant}>
          <Card variant="glass" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0f2819] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-800" /> Completion History by Date
                </h2>
                <p className="text-xs text-[#1e3f2b] mt-0.5">
                  Logged energy-saving checks reverse chronologically grouped with kWh and tariff cost.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1e3f2b]">
                {groupedHistory.length} Days Recorded
              </span>
            </div>

            {groupedHistory.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={<Sparkles className="w-6 h-6 text-emerald-800" />}
                  title="No Completion History"
                  description="When you mark reminders done on the Dashboard or Reminders page, they appear in this ledger."
                />
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {visibleGroups.map((group) => (
                  <div key={group.dateKey} className="rounded-xl bg-white/60 border border-white/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-900/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0f2819]">{group.displayDate}</span>
                        <Badge variant="neutral" size="sm">
                          {group.completions.length} action{group.completions.length === 1 ? '' : 's'}
                        </Badge>
                      </div>
                      <div className="text-right text-xs font-bold text-emerald-900 tabular-nums">
                        <span>+{group.totalKwh.toFixed(2)} kWh</span>
                        <span className="text-slate-500 ml-2 font-semibold">+₹{group.totalCost.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="divide-y divide-emerald-950/5">
                      {group.completions.map((comp) => {
                        const timeStr = new Date(comp.completedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        return (
                          <div key={comp.id} className="py-1.5 flex items-center justify-between text-xs">
                            <span className="text-[#0f2819] font-medium">{comp.title}</span>
                            <div className="flex items-center gap-3 text-slate-500">
                              <span>{timeStr}</span>
                              <span className="font-mono text-emerald-800 font-bold">
                                +{comp.kWh.toFixed(2)} kWh
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {groupedHistory.length > visibleDateGroups && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ChevronDown className="w-3.5 h-3.5" />}
                      onClick={() => setVisibleDateGroups((prev) => prev + 5)}
                    >
                      Show More Days ({groupedHistory.length - visibleDateGroups} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
