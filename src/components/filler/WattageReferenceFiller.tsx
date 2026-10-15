import React from 'react'
import { Card } from '../ui/Card'
import { PRESETS, type AppliancePreset } from '../calculator/presets'
import { Zap } from 'lucide-react'
import type { FillerContext } from './types'

export interface WattageReferenceFillerProps {
  height: number
  context: FillerContext
  className?: string
}

export const WattageReferenceFiller: React.FC<WattageReferenceFillerProps> = ({
  height,
  context,
  className = '',
}) => {
  const { onSelectPreset, selectedPreset } = context

  // If height < 300, show top 6 presets to fit without overflow; otherwise all 10
  const displayedPresets = height < 300 ? PRESETS.slice(0, 6) : PRESETS

  return (
    <Card
      variant="glass"
      padding="none"
      style={{ height }}
      className={`p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden transition-all ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" /> Quick Reference: Appliance Wattages
          </h3>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-[var(--text-secondary)]">
            {displayedPresets.length} presets
          </span>
        </div>

        {/* 2-Column Compact Preset List */}
        <div className="grid grid-cols-2 gap-1.5">
          {displayedPresets.map((preset: AppliancePreset) => {
            const isSelected = selectedPreset === preset.name

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onSelectPreset?.(preset.name)}
                title={`Load ${preset.name} (${preset.watts}W)`}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-all border flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs font-semibold'
                    : 'bg-white/60 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/10 text-[var(--text-primary)] border-white/80 dark:border-white/10'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] shrink-0 ${
                    isSelected ? 'text-emerald-100 font-bold' : 'text-emerald-900 dark:text-emerald-300 font-semibold'
                  }`}
                >
                  {preset.watts}W
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* One-Line Caption */}
      <p className="text-[11px] text-[var(--text-secondary)] italic pt-1 border-t border-emerald-900/10 dark:border-white/10">
        Typical ratings. Check the label on your own appliance.
      </p>
    </Card>
  )
}

export default WattageReferenceFiller
