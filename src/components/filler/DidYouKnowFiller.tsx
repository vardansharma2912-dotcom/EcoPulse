import React, { useState } from 'react'
import { Lightbulb, Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { SAFE_TIPS } from './safeTips'
import type { FillerContext } from './types'

export interface DidYouKnowFillerProps {
  height: number
  context: FillerContext
  className?: string
}

export const DidYouKnowFiller: React.FC<DidYouKnowFillerProps> = ({
  height,
  className = '',
}) => {
  // Rotates ONLY when mounted, no auto timers
  const [tipIndex] = useState(() => Math.floor(Math.random() * SAFE_TIPS.length))
  const tip = SAFE_TIPS[tipIndex] || SAFE_TIPS[0]

  const isCompact = height < 180

  return (
    <Card
      variant="glass"
      padding="none"
      style={{ height }}
      className={`p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden transition-all ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-800/10 dark:border-white/10">
            <Lightbulb className="w-3 h-3 text-emerald-800 dark:text-emerald-400" />
            Energy Saving Tip
          </span>
          <span className="text-[10px] text-slate-500 dark:text-[var(--text-secondary)] font-medium">EcoPulse Guide</span>
        </div>

        <h3 className="font-bold text-sm text-[var(--text-primary)] leading-snug">
          {tip.title}
        </h3>

        <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-3">
          {tip.text}
        </p>
      </div>

      {!isCompact && (
        <div className="pt-2 border-t border-emerald-900/10 dark:border-white/10 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium">
          <Sparkles className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>Small daily habits lower grid demand</span>
        </div>
      )}
    </Card>
  )
}

export default DidYouKnowFiller
