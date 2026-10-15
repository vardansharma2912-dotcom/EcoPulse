import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Zap, ArrowRight } from 'lucide-react'
import { Card } from '../ui/Card'
import type { FillerContext } from './types'

export interface NextUpFillerProps {
  height: number
  context: FillerContext
  className?: string
}

export const NextUpFiller: React.FC<NextUpFillerProps> = ({
  height,
  context,
  className = '',
}) => {
  const reminder = context.nextUpReminder
  if (!reminder) return null

  const isCompact = height < 185

  return (
    <Card
      variant="glass"
      padding="none"
      style={{ height }}
      className={`p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden transition-all ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-800/10 dark:border-white/10">
            <Clock className="w-3 h-3 text-emerald-800 dark:text-emerald-400" />
            Next Up • {reminder.time}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-[var(--text-secondary)] font-medium capitalize">
            {reminder.recurrence}
          </span>
        </div>

        <h3 className="font-bold text-sm text-[var(--text-primary)] leading-snug line-clamp-2">
          {reminder.title}
        </h3>

        {!isCompact && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium mt-1.5">
            {reminder.applianceWatts && (
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Zap className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                {reminder.applianceWatts}W
              </span>
            )}
            <span>• Est. {reminder.avoidedHours ?? 1}h avoided</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[var(--text-secondary)]">Ready for power down</span>
        <Link
          to="/reminders"
          className="font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 inline-flex items-center gap-1 group"
        >
          <span>Open reminders</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  )
}

export default NextUpFiller
