import React from 'react'
import { Card } from '../ui/Card'
import { PRESETS, type AppliancePreset } from './presets'
import { Zap } from 'lucide-react'

interface QuickReferenceWattagesCardProps {
  selectedPreset: string
  onSelectPreset: (presetName: string) => void
  className?: string
}

export const QuickReferenceWattagesCard: React.FC<QuickReferenceWattagesCardProps> = ({
  selectedPreset,
  onSelectPreset,
  className = '',
}) => {
  return (
    <Card variant="glass" className={`p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" /> Quick Reference: Appliance Wattages
        </h3>
        <span className="text-[10px] font-semibold text-[var(--text-muted)]">
          {PRESETS.length} presets
        </span>
      </div>

      {/* 2-Column Compact Preset List */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {PRESETS.map((preset: AppliancePreset) => {
          const isSelected = selectedPreset === preset.name

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onSelectPreset(preset.name)}
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

      {/* One-Line Caption */}
      <p className="text-[11px] text-[var(--text-secondary)] italic pt-0.5">
        Typical ratings. Check the label on your own appliance.
      </p>
    </Card>
  )
}
