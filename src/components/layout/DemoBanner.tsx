import React, { useState, useEffect } from 'react'
import { useAppState } from '../../state'
import { hasDemoCompletions } from '../../lib/sampleData'
import { Sparkles, Trash2, X } from 'lucide-react'

const DEMO_BANNER_DISMISSED_KEY = 'ecopulse_demo_banner_dismissed'

export const DemoBanner: React.FC = () => {
  const { state, removeSampleData } = useAppState()
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DEMO_BANNER_DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const isDemoActive = hasDemoCompletions(state.completions)

  useEffect(() => {
    if (!isDemoActive) {
      setIsDismissed(false)
      try {
        sessionStorage.removeItem(DEMO_BANNER_DISMISSED_KEY)
      } catch {
        // Ignore
      }
    }
  }, [isDemoActive])

  if (!isDemoActive || isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      sessionStorage.setItem(DEMO_BANNER_DISMISSED_KEY, 'true')
    } catch {
      // Ignore
    }
  }

  return (
    <div
      role="status"
      className="relative mb-6 rounded-2xl border border-amber-300/40 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 p-4 pr-10 sm:pr-12 backdrop-blur-md shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-lg text-amber-900/60 dark:text-amber-300/80 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-500/20 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
        aria-label="Dismiss banner"
        title="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-200">
              Sample data is loaded for demonstration.
            </p>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
              These simulated completions demonstrate charts, streaks, and badges. Real completions remain untouched.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={removeSampleData}
          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl border border-amber-400/40 dark:border-amber-500/40 bg-white/70 dark:bg-amber-900/40 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-sm transition-all hover:bg-white/90 dark:hover:bg-amber-900/60 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 active:scale-95 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove sample data
        </button>
      </div>
    </div>
  )
}

