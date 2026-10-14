import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { CountUp } from '../ui/CountUp'
import {
  getWeekGlanceDays,
  getWeekGlanceStats,
  getNextUpReminder,
} from '../../lib/dashboardWeek'
import { getWeeklyChartData } from '../../lib/analytics'
import type { FillerContext } from './types'
import {
  CalendarDays,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export interface WeekGlanceExpandedFillerProps {
  height: number
  context: FillerContext
  className?: string
}

export const WeekGlanceExpandedFiller: React.FC<WeekGlanceExpandedFillerProps> = ({
  height,
  context,
  className = '',
}) => {
  const { completions, reminders } = context
  const [now] = useState(() => new Date())

  const days = useMemo(
    () => getWeekGlanceDays(completions, now),
    [completions, now]
  )

  const stats = useMemo(
    () => getWeekGlanceStats(days, completions, now),
    [days, completions, now]
  )

  const nextUp = useMemo(
    () => getNextUpReminder(reminders, completions, now),
    [reminders, completions, now]
  )

  const chartData = useMemo(
    () => getWeeklyChartData(completions, now),
    [completions, now]
  )

  const maxVal = Math.max(...chartData.map((d) => d.actions), 1)

  // Scale internal sections based on height
  const showSparkline = height >= 420
  const hideStats = height < 460 && !showSparkline

  return (
    <Card
      variant="glass"
      padding="none"
      style={{ height }}
      className={`p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="w-4 h-4 text-emerald-800 shrink-0" />
          <h3 className="text-sm font-bold text-[#102819] truncate">
            This Week at a Glance
          </h3>
        </div>
        <Badge variant="neutral" size="sm" className="shrink-0 text-[10px]">
          Mon – Sun
        </Badge>
      </div>

      {/* Row of 7 Day Dots */}
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1.5 text-center items-center">
          {days.map((day) => {
            const isCompleted = day.status === 'completed'
            const isMissed = day.status === 'missed'

            return (
              <div
                key={day.dateKey}
                className="flex flex-col items-center gap-1 min-w-0"
              >
                <span
                  className={`text-[10px] leading-tight ${
                    day.isToday
                      ? 'font-extrabold text-emerald-950 underline decoration-emerald-600 decoration-2 underline-offset-2'
                      : 'font-semibold text-slate-600'
                  }`}
                >
                  {day.dayLabel}
                </span>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    day.isToday
                      ? 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-white/80 shadow-xs'
                      : ''
                  } ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs border border-emerald-700/60'
                      : isMissed
                      ? 'border border-slate-300 dark:border-slate-600 bg-slate-100/50'
                      : 'border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white/40'
                  }`}
                  style={
                    isMissed
                      ? {
                          backgroundImage:
                            'repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.4) 0, rgba(148, 163, 184, 0.4) 1.5px, transparent 1.5px, transparent 5px)',
                        }
                      : undefined
                  }
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                  ) : (
                    <span
                      className={`text-[10px] font-mono tabular-nums leading-none ${
                        day.isToday ? 'font-bold text-emerald-950' : 'text-slate-400 font-medium'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mini 7-Bar Sparkline (Reuse existing pill bar styles, real data only) */}
      {showSparkline && (
        <div className="rounded-xl bg-white/50 border border-white/70 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-800" /> Daily Actions Sparkline
            </span>
            <span className="font-mono text-emerald-900 font-bold">
              {stats.actionsThisWeek} total
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 items-end h-12 pt-1">
            {chartData.map((d) => {
              const heightPct = maxVal > 0 ? Math.max((d.actions / maxVal) * 100, 10) : 10
              const hasActivity = d.actions > 0

              return (
                <div key={d.dateKey} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    title={`${d.day}: ${d.actions} action(s), ${d.kwh.toFixed(2)} kWh`}
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[18px] rounded-full transition-all ${
                      hasActivity
                        ? 'bg-emerald-600 border border-emerald-700/60 shadow-2xs'
                        : 'bg-emerald-950/10'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-500">{d.day[0]}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3 Stat Tiles */}
      {!hideStats && (
        stats.isEmpty ? (
          <div className="rounded-xl border border-dashed border-emerald-800/20 bg-emerald-50/40 p-2 text-center">
            <p className="text-xs text-[#1e3f2b] font-medium">
              Complete your first reminder to see your week here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/70 bg-white/60 p-1.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block truncate">
                Actions
              </span>
              <p className="text-base font-extrabold text-[#0f2819] tabular-nums leading-tight mt-0.5">
                <CountUp value={stats.actionsThisWeek} />
              </p>
              <span className="text-[9px] font-medium text-emerald-800 block truncate">
                this week
              </span>
            </div>

            <div className="rounded-xl border border-white/70 bg-white/60 p-1.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block truncate">
                Avoided
              </span>
              <p className="text-base font-extrabold text-[#0f2819] tabular-nums leading-tight mt-0.5">
                <CountUp value={stats.kwhAvoidedThisWeek} decimals={2} />
                <span className="text-[10px] font-bold text-emerald-900 ml-0.5">kWh</span>
              </p>
              <span className="text-[9px] font-medium text-emerald-800 block truncate">
                this week
              </span>
            </div>

            <div className="rounded-xl border border-white/70 bg-white/60 p-1.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block truncate">
                Best Day
              </span>
              <p className="text-base font-extrabold text-[#0f2819] leading-tight mt-0.5">
                {stats.bestDay}
              </p>
              <span className="text-[9px] font-medium text-emerald-800 block truncate">
                most active
              </span>
            </div>
          </div>
        )
      )}

      {/* Next Up Line */}
      <div className="pt-2 border-t border-emerald-900/10 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 min-w-0 text-[#102819]">
          <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
          {nextUp ? (
            <p className="truncate font-medium text-[11px]">
              <span className="font-bold text-emerald-950">Next up:</span>{' '}
              {nextUp.title}{' '}
              <span className="text-slate-500 font-mono">
                ({nextUp.type === 'tomorrow' ? 'Tomorrow ' : ''}{nextUp.time})
              </span>
            </p>
          ) : (
            <p className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> All caught up for today
            </p>
          )}
        </div>

        <Link
          to="/reminders"
          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 inline-flex items-center gap-0.5"
        >
          Open reminders
          <ArrowRight className="w-3 h-3 text-emerald-800" />
        </Link>
      </div>
    </Card>
  )
}

export default WeekGlanceExpandedFiller
