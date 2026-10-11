import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CountUp } from '../ui/CountUp'

export interface RingGaugeProps {
  completed: number
  snoozed: number
  pending: number
  total: number
  className?: string
}

const R = 80
const CX = 100
const CY = 105

function getArcSegmentPath(tStart: number, tEnd: number): string {
  // Clamp to valid range [0, 1]
  const s = Math.max(0, Math.min(1, tStart))
  const e = Math.max(0, Math.min(1, tEnd))
  const x1 = CX - R * Math.cos(Math.PI * s)
  const y1 = CY - R * Math.sin(Math.PI * s)
  const x2 = CX - R * Math.cos(Math.PI * e)
  const y2 = CY - R * Math.sin(Math.PI * e)
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

export const RingGauge: React.FC<RingGaugeProps> = ({
  completed,
  snoozed,
  pending,
  total,
  className = '',
}) => {
  const prefersReduced = useReducedMotion()

  const hasDue = total > 0
  const completionPct = hasDue ? Math.min(100, Math.round((completed / total) * 100)) : 0

  const compFrac = hasDue ? completed / total : 0
  const snoozeFrac = hasDue ? snoozed / total : 0
  const pendFrac = hasDue ? pending / total : 0

  // Standard background arc from (20, 105) to (180, 105)
  const bgArcPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`

  // Segments geometry
  const tCompStart = 0
  const tCompEnd = compFrac

  const tSnoozeStart = compFrac
  const tSnoozeEnd = compFrac + snoozeFrac

  const tPendStart = compFrac + snoozeFrac
  const tPendEnd = Math.min(1, compFrac + snoozeFrac + pendFrac)

  const compLen = Math.max(0.1, (tCompEnd - tCompStart) * Math.PI * R)
  const snoozeLen = Math.max(0.1, (tSnoozeEnd - tSnoozeStart) * Math.PI * R)
  const pendLen = Math.max(0.1, (tPendEnd - tPendStart) * Math.PI * R)

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Semi-Circle SVG */}
      <div className="relative w-52 h-28 sm:w-60 sm:h-32 flex items-center justify-center overflow-visible">
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Hatched Pattern for Pending Segment */}
            <pattern
              id="gauge-hatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#8fa398" strokeWidth="1.8" />
            </pattern>
          </defs>

          {/* Background Track */}
          <path
            d={bgArcPath}
            fill="none"
            stroke="#e4efe7"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {hasDue && (
            <>
              {/* 3. Pending Segment (drawn on top or at the end of the arc) */}
              {pendFrac > 0 && (
                <motion.path
                  d={getArcSegmentPath(tPendStart, tPendEnd)}
                  fill="none"
                  stroke="url(#gauge-hatch)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={pendLen}
                  initial={{ strokeDashoffset: prefersReduced ? 0 : pendLen }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              {/* 2. Snoozed Segment */}
              {snoozeFrac > 0 && (
                <motion.path
                  d={getArcSegmentPath(tSnoozeStart, tSnoozeEnd)}
                  fill="none"
                  stroke="#0a381e"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={snoozeLen}
                  initial={{ strokeDashoffset: prefersReduced ? 0 : snoozeLen }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              {/* 1. Completed Segment */}
              {compFrac > 0 && (
                <motion.path
                  d={getArcSegmentPath(tCompStart, tCompEnd)}
                  fill="none"
                  stroke="#196f45"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={compLen}
                  initial={{ strokeDashoffset: prefersReduced ? 0 : compLen }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </>
          )}
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute bottom-1 inset-x-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hasDue ? (
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
              <CountUp value={completionPct} suffix="%" />
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-[#0f2819] tracking-tight">
              —
            </div>
          )}
          <span className="text-[11px] font-semibold text-[#1e3f2b]">
            {hasDue ? 'Completed Today' : 'No Reminders Due'}
          </span>
        </div>
      </div>

      {/* 3-Dot Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-emerald-900/10 text-xs font-semibold text-[#1b3b26]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#196f45]" />
          <span>Done ({completed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0a381e]" />
          <span>Snoozed ({snoozed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full border border-[#8fa398]"
            style={{
              backgroundColor: '#f4f8f5',
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 2px, #8fa398 2px, #8fa398 3.5px)',
            }}
          />
          <span>Pending ({pending})</span>
        </div>
      </div>
    </div>
  )
}
