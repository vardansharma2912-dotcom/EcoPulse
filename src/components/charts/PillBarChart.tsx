import React, { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WeeklyChartDataPoint } from '../../lib/analytics'
import { todayKey } from '../../lib/dates'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Calendar } from 'lucide-react'

export interface PillBarChartProps {
  data: WeeklyChartDataPoint[]
  metric: 'kwh' | 'actions'
  onMetricChange?: (metric: 'kwh' | 'actions') => void
  className?: string
}

export const PillBarChart: React.FC<PillBarChartProps> = ({
  data,
  metric,
  onMetricChange,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const prefersReduced = useReducedMotion()
  const today = todayKey()

  const hasData = data.some((d) => d.kwh > 0 || d.actions > 0)
  const maxVal = Math.max(...data.map((d) => (metric === 'kwh' ? d.kwh : d.actions)), 0)

  const getTierColor = (val: number, max: number): string => {
    if (val <= 0 || max <= 0) return ''
    const ratio = val / max
    if (ratio >= 0.75) return '#0a381e' // deep forest
    if (ratio >= 0.4) return '#196f45' // emerald
    return '#5aba86' // leaf
  }

  const getBarHeight = (val: number, max: number): number => {
    if (max <= 0 || val <= 0) return 0
    return Math.max(14, Math.round((val / max) * 100))
  }

  const ariaDescription = `Weekly activity chart displaying ${data
    .map((d) => `${d.day}: ${d.actions} actions, ${d.kwh.toFixed(2)} kWh`)
    .join('; ')}`

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Metric Toggle & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">
            Activity by Day
          </span>
          <span className="text-xs font-medium text-[#1e3f2b]">
            (Mon – Sun)
          </span>
        </div>

        {onMetricChange && (
          <div className="flex items-center gap-1 p-1 bg-white/60 rounded-xl border border-white/80 shrink-0">
            <Button
              type="button"
              variant={metric === 'kwh' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onMetricChange('kwh')}
              className={metric === 'kwh' ? 'shadow-xs' : 'text-[#14301f]'}
            >
              Energy Saved (kWh)
            </Button>
            <Button
              type="button"
              variant={metric === 'actions' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onMetricChange('actions')}
              className={metric === 'actions' ? 'shadow-xs' : 'text-[#14301f]'}
            >
              Actions Completed
            </Button>
          </div>
        )}
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-emerald-800" />}
          title="No Conservation Activity Logged This Week"
          description="Complete your daily reminders or log actions to populate your weekly energy savings chart."
        />
      ) : (
        <div
          role="img"
          aria-label={ariaDescription}
          className="relative pt-8 pb-2 focus:outline-none"
        >
          {/* Visually Hidden Data Table for Accessibility */}
          <table className="sr-only">
            <caption>Weekly Energy Conservation Activity</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Date</th>
                <th scope="col">Actions</th>
                <th scope="col">kWh Saved</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.dateKey}>
                  <td>{d.day}</td>
                  <td>{d.fullDate}</td>
                  <td>{d.actions}</td>
                  <td>{d.kwh.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-1 sm:px-4">
            {data.map((d, index) => {
              const val = metric === 'kwh' ? d.kwh : d.actions
              const heightPct = getBarHeight(val, maxVal)
              const isToday = d.dateKey === today
              const isZero = val === 0
              const tierColor = getTierColor(val, maxVal)
              const isHovered = hoveredIndex === index
              const isDimmed = hoveredIndex !== null && !isHovered

              return (
                <div
                  key={d.dateKey}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.day} (${d.fullDate}): ${d.actions} actions, ${d.kwh.toFixed(2)} kWh`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  className="group flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer outline-none select-none"
                >
                  {/* Floating Pill Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-10 z-20 whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-[#0f2819] text-xs font-bold shadow-lg shadow-emerald-950/20 border border-emerald-900/15 pointer-events-none"
                    >
                      <span>{d.actions} {d.actions === 1 ? 'action' : 'actions'} · {d.kwh.toFixed(2)} kWh</span>
                    </motion.div>
                  )}

                  {/* The Pill Bar Track / Fill */}
                  <div
                    className="w-full max-w-[42px] sm:max-w-[48px] h-full flex items-end justify-center rounded-full p-1"
                    style={{
                      transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.9, 0.4, 1)',
                      opacity: isDimmed ? 0.6 : 1,
                      transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                    }}
                  >
                    {isZero ? (
                      /* Hatched Pill for zero or inactive day */
                      <div
                        className="w-full h-8 rounded-full border border-[#8fa398]/40"
                        style={{
                          backgroundColor: '#f4f8f5',
                          backgroundImage:
                            'repeating-linear-gradient(45deg, transparent, transparent 3.8px, #8fa398 3.8px, #8fa398 5px)',
                        }}
                      />
                    ) : (
                      /* Solid Tier-Coloured Pill Bar with bottom-origin growth */
                      <motion.div
                        initial={prefersReduced ? { height: `${heightPct}%` } : { height: '0%' }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{
                          delay: prefersReduced ? 0 : index * 0.07,
                          type: 'spring',
                          stiffness: 220,
                          damping: 20,
                        }}
                        style={{
                          backgroundColor: tierColor,
                        }}
                        className="w-full rounded-full shadow-sm"
                      />
                    )}
                  </div>

                  {/* Day Label Underneath */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs block ${
                        isToday
                          ? 'font-black text-[#0a381e]'
                          : 'font-semibold text-slate-600 group-hover:text-[#0f2819]'
                      }`}
                    >
                      {d.day}
                    </span>
                    <span className="text-[10px] text-slate-400 block sm:inline">
                      {d.fullDate.split(' ')[0]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 mt-2 border-t border-emerald-950/10 text-xs font-semibold text-[#1e3f2b]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0a381e]" />
              <span>High (≥75% max)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#196f45]" />
              <span>Medium (40-75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#5aba86]" />
              <span>Low (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-[#8fa398]/50"
                style={{
                  backgroundColor: '#f4f8f5',
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 3.8px, #8fa398 3.8px, #8fa398 5px)',
                }}
              />
              <span>Zero / Future</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
