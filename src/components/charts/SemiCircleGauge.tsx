import React from 'react'
import { motion } from 'motion/react'
import { CountUp } from '../ui/CountUp'

export interface SemiCircleGaugeProps {
  completed: number
  snoozed: number
  pending: number
  total: number
  className?: string
}

export const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({
  completed,
  snoozed,
  pending,
  total,
  className = '',
}) => {
  // Semi-circle arc geometry: center (100, 100), radius 80
  // Arc length = PI * 80 = 251.33
  const ARC_LENGTH = 251.33

  const hasDue = total > 0
  const completionPct = hasDue ? Math.min(100, Math.round((completed / total) * 100)) : 0

  // Calculate arc lengths
  const completedLen = hasDue ? (completed / total) * ARC_LENGTH : 0
  const snoozedLen = hasDue ? (snoozed / total) * ARC_LENGTH : 0
  const pendingLen = hasDue ? (pending / total) * ARC_LENGTH : 0

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-48 h-28 sm:w-56 sm:h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label={`Today's progress gauge: ${completed} completed, ${snoozed} snoozed, ${pending} pending out of ${total} due.`}
        >
          <defs>
            {/* Diagonal Hatch Pattern for Pending Segment */}
            <pattern
              id="gauge-pending-hatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#8fa398" strokeWidth="1.8" />
            </pattern>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2ebe5"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {hasDue && (
            <>
              {/* 1. Pending Segment (Hatched/Base) */}
              <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gauge-pending-hatch)"
                strokeWidth="16"
                strokeDasharray={`${pendingLen} ${ARC_LENGTH}`}
                strokeDashoffset={-(completedLen + snoozedLen)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* 2. Snoozed Segment (#0a381e) */}
              {snoozed > 0 && (
                <motion.path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#0a381e"
                  strokeWidth="16"
                  strokeDasharray={`${snoozedLen} ${ARC_LENGTH}`}
                  strokeDashoffset={-completedLen}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              {/* 3. Completed Segment (#196f45) */}
              {completed > 0 && (
                <motion.path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#196f45"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${completedLen} ${ARC_LENGTH}`}
                  strokeDashoffset={0}
                  initial={{ strokeDashoffset: ARC_LENGTH }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </>
          )}
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          {hasDue ? (
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0a381e] tracking-tight">
              <CountUp value={completionPct} suffix="%" />
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-400">
              —
            </div>
          )}
          <span className="text-[10px] font-semibold text-[#1e3f2b] uppercase tracking-wider">
            {hasDue ? 'Done' : 'No Due Actions'}
          </span>
        </div>
      </div>

      {/* Legend of 3 Dots Underneath - nowrap items wrapping as whole units */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 mt-2.5 text-xs font-semibold text-[#14301f]">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#196f45] shadow-xs" />
          <span>Done ({completed})</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0a381e] shadow-xs" />
          <span>Snoozed ({snoozed})</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8fa398] border border-stone-400/50 shadow-xs" />
          <span>Pending ({pending})</span>
        </div>
      </div>
    </div>
  )
}
