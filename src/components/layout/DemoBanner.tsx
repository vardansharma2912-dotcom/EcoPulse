import React from 'react'
import { useAppState } from '../../state'
import { hasDemoCompletions } from '../../lib/sampleData'
import { Sparkles, Trash2 } from 'lucide-react'

export const DemoBanner: React.FC = () => {
  const { state, removeSampleData } = useAppState()
  const isDemoActive = hasDemoCompletions(state.completions)

  if (!isDemoActive) return null

  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 backdrop-blur-md shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-800">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Sample data is loaded for demonstration.
            </p>
            <p className="text-xs text-amber-800/90">
              These simulated completions demonstrate charts, streaks, and badges. Real completions remain untouched.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={removeSampleData}
          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl border border-amber-400/40 bg-white/70 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition-all hover:bg-white/90 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 active:scale-95 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove sample data
        </button>
      </div>
    </div>
  )
}
