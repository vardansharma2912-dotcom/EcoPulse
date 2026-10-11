import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { WeeklyChartDataPoint } from '../../lib/analytics'
import { todayKey as getTodayKey } from '../../lib/dates'

export interface PillBarChartProps {
  data: WeeklyChartDataPoint[]
  metric: 'kwh' | 'actions'
  onMetricChange?: (metric: 'kwh' | 'actions') => void
  showToggle?: boolean
  className?: string
  height?: number
}

export const PillBarChart: React.FC<PillBarChartProps> = ({
  data,
  metric,
  onMetricChange,
  showToggle = true,
  className = '',
  height = 200,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const currentToday = getTodayKey()

  const maxVal = Math.max(...data.map((d) => (metric === 'kwh' ? d.kwh : d.actions)), 0)
  const totalVal = data.reduce((acc, d) => acc + (metric === 'kwh' ? d.kwh : d.actions), 0)

  // Empty state when entire week has 0 data
  if (totalVal === 0 && maxVal === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/40 border border-white/60 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-emerald-900/10 flex items-center justify-center text-emerald-900 mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-[#0f2819]">No Activity Logged This Week</p>
        <p className="text-xs text-[#1e3f2b] max-w-xs mt-1">
          Complete energy-saving reminders to see your daily conservation pills grow here.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Weekly Energy Conservation Chart">
      {/* Top Header & Optional Metric Toggle */}
      {showToggle && onMetricChange && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">Weekly Activity</span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              {metric === 'kwh' ? 'kWh Avoided' : 'Actions Completed'}
            </span>
          </div>

          <div className="inline-flex rounded-xl bg-white/70 p-1 border border-white/80 shadow-xs">
            <button
              type="button"
              onClick={() => onMetricChange('kwh')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metric === 'kwh'
                  ? 'bg-[#0a381e] text-white shadow-xs'
                  : 'text-[#1e3f2b] hover:text-[#0f2819]'
              }`}
            >
              kWh
            </button>
            <button
              type="button"
              onClick={() => onMetricChange('actions')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metric === 'actions'
                  ? 'bg-[#0a381e] text-white shadow-xs'
                  : 'text-[#1e3f2b] hover:text-[#0f2819]'
              }`}
            >
              Actions
            </button>
          </div>
        </div>
      )}

      {/* Visually Hidden Accessible Table for Screen Readers */}
      <table className="sr-only">
        <caption>Weekly Energy Conservation Breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Date</th>
            <th scope="col">Estimated kWh</th>
            <th scope="col">Actions Done</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.dateKey}>
              <td>{d.day}</td>
              <td>{d.fullDate}</td>
              <td>{d.kwh.toFixed(2)}</td>
              <td>{d.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Graphic Chart Container */}
      <div
        role="img"
        aria-label={`Weekly pill bar chart from Monday to Sunday. Peak value: ${maxVal.toFixed(1)} ${metric === 'kwh' ? 'kWh' : 'actions'}.`}
        className="relative pt-8 pb-2 select-none"
      >
        <div className="grid grid-cols-7 gap-1 sm:gap-2.5 md:gap-3.5 items-end justify-items-center" style={{ height: `${height}px` }}>
          {data.map((d, index) => {
            const val = metric === 'kwh' ? d.kwh : d.actions
            const isZero = val <= 0
            const ratio = maxVal > 0 ? val / maxVal : 0

            // Tier colors relative to week's max
            let barColor = '#5aba86' // <40%
            if (ratio >= 0.75) {
              barColor = '#0a381e' // >=75% deep forest
            } else if (ratio >= 0.4) {
              barColor = '#196f45' // 40-75% emerald
            }

            // Height scaling (min 14% for non-zero to show pill curve)
            const heightPct = isZero ? 10 : Math.max(16, Math.round(ratio * 100))
            const isToday = d.dateKey === currentToday
            const isHovered = hoveredIndex === index
            const isDimmed = hoveredIndex !== null && !isHovered

            return (
              <div
                key={d.dateKey}
                className="relative flex flex-col items-center justify-end w-full h-full group outline-none"
                tabIndex={0}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                aria-label={`${d.day} (${d.fullDate}): ${d.actions} actions, ${d.kwh.toFixed(2)} kWh`}
              >
                {/* Floating Tooltip Pill */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: -8, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full z-30 pointer-events-none whitespace-nowrap px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white text-[#0a381e] text-[10px] sm:text-[11px] font-bold shadow-md border border-stone-200/80"
                    >
                      {d.actions} action{d.actions === 1 ? '' : 's'} · {d.kwh.toFixed(2)} kWh
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pill Bar */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{
                    scaleY: 1,
                    y: isHovered ? -3 : 0,
                    opacity: isDimmed ? 0.6 : 1,
                  }}
                  transition={{
                    scaleY: {
                      type: 'spring',
                      stiffness: 240,
                      damping: 22,
                      delay: index * 0.07,
                    },
                    y: { type: 'spring', stiffness: 400, damping: 25 },
                    opacity: { duration: 0.15 },
                  }}
                  style={{
                    height: `${heightPct}%`,
                    transformOrigin: 'bottom',
                    backgroundColor: isZero ? '#f4f8f5' : barColor,
                    backgroundImage: isZero
                      ? 'repeating-linear-gradient(45deg, #f4f8f5, #f4f8f5 4px, #8fa398 4.2px, #8fa398 5.4px)'
                      : undefined,
                  }}
                  className={`w-full max-w-[24px] sm:max-w-[36px] rounded-full transition-shadow ${
                    isZero
                      ? 'border border-[#8fa398]/30 shadow-none'
                      : isHovered
                      ? 'shadow-lg shadow-emerald-950/20 ring-2 ring-emerald-700/30'
                      : 'shadow-sm shadow-emerald-950/10'
                  }`}
                />

                {/* Day Label Underneath */}
                <div className="mt-1.5 text-center">
                  <span
                    className={`block text-[10px] sm:text-xs transition-colors ${
                      isToday
                        ? 'font-extrabold text-[#0a381e] underline decoration-emerald-600 decoration-2 underline-offset-2'
                        : 'font-semibold text-[#1e3f2b]/80'
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
