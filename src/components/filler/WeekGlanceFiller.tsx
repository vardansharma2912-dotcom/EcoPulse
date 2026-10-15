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
import type { FillerContext } from './types'
import {
  CalendarDays,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export interface WeekGlanceFillerProps {
  height: number
  context: FillerContext
  className?: string
}

export const WeekGlanceFiller: React.FC<WeekGlanceFillerProps> = ({
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

  // Drops optional sections (smallest first): stat tiles dropped when height < 290
  const hideStats = height < 290

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
          <CalendarDays className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
            This Week at a Glance
          </h3>
        </div>
        <Badge variant="neutral" size="sm" className="shrink-0 text-[10px]">
          Mon – Sun
        </Badge>
      </div>

      {/* Row of 7 Day Dots (Mon-Sun) */}
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
                      ? 'font-extrabold text-emerald-950 dark:text-emerald-300 underline decoration-emerald-600 decoration-2 underline-offset-2'
                      : 'font-semibold text-slate-600 dark:text-[var(--text-secondary)]'
                  }`}
                >
                  {day.dayLabel}
                </span>

                <div
                  title={`${day.dayLabel} (${day.dateKey}): ${
                    isCompleted
                      ? `${day.actionsCount} action${day.actionsCount === 1 ? '' : 's'} completed`
                      : isMissed
                      ? 'No actions recorded'
                      : day.isToday
                      ? 'Today (in progress)'
                      : 'Upcoming'
                  }`}
                  aria-label={`${day.dayLabel} ${day.dateKey}: ${day.status}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    day.isToday
                      ? 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-white/80 dark:ring-offset-emerald-950 shadow-xs'
                      : ''
                  } ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs border border-emerald-700/60'
                      : isMissed
                      ? 'border border-slate-300 dark:border-slate-600 bg-slate-100/50 dark:bg-white/5'
                      : 'border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white/40 dark:bg-white/[0.04]'
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
                        day.isToday ? 'font-bold text-emerald-950 dark:text-emerald-300' : 'text-slate-400 dark:text-stone-500 font-medium'
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

      {/* 3 Small Stat Tiles OR Honest Empty State */}
      {!hideStats && (
        stats.isEmpty ? (
          <div className="rounded-xl border border-dashed border-emerald-800/20 dark:border-white/10 bg-emerald-50/40 dark:bg-emerald-950/40 p-2 text-center">
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Complete your first reminder to see your week here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] p-1.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-[var(--text-secondary)] block truncate">
                Actions
              </span>
              <p className="text-base font-extrabold text-[var(--text-primary)] tabular-nums leading-tight mt-0.5">
                <CountUp value={stats.actionsThisWeek} />
              </p>
              <span className="text-[9.5px] font-medium text-emerald-800 dark:text-emerald-400 block truncate">
                this week
              </span>
            </div>

            <div className="rounded-xl border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] p-1.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-[var(--text-secondary)] block truncate">
                Energy Avoided
              </span>
              <p className="text-base font-extrabold text-[var(--text-primary)] tabular-nums leading-tight mt-0.5">
                <CountUp value={stats.kwhAvoidedThisWeek} decimals={2} />
                <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 ml-0.5">kWh</span>
              </p>
              <span className="text-[9.5px] font-medium text-emerald-800 dark:text-emerald-400 block truncate">
                this week
              </span>
            </div>

            <div className="rounded-xl border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] p-1.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-[var(--text-secondary)] block truncate">
                Best Day
              </span>
              <p className="text-base font-extrabold text-[var(--text-primary)] leading-tight mt-0.5">
                {stats.bestDay}
              </p>
              <span className="text-[9.5px] font-medium text-emerald-800 dark:text-emerald-400 block truncate">
                most active
              </span>
            </div>
          </div>
        )
      )}

      {/* Next Up Line */}
      <div className="pt-2 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 min-w-0 text-[var(--text-primary)]">
          <Clock className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
          {nextUp ? (
            <p className="truncate font-medium text-[11px]">
              <span className="font-bold text-emerald-950 dark:text-emerald-300">Next up:</span>{' '}
              {nextUp.title}{' '}
              <span className="text-slate-500 dark:text-[var(--text-secondary)] font-mono">
                ({nextUp.type === 'tomorrow' ? 'Tomorrow ' : ''}{nextUp.time})
              </span>
            </p>
          ) : (
            <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
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

export default WeekGlanceFiller
