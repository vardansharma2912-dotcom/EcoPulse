import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { PRESETS, type AppliancePreset } from './presets'
import { calculateKwh, calculateCost } from '../../lib/energy'
import type { Reminder } from '../../types'
import { CalendarDays, CheckCircle2, ArrowRight } from 'lucide-react'

interface MonthlyCostBenchmarkCardProps {
  tariff: number
  currency: string
  selectedPreset: string
  onSelectPreset: (presetName: string) => void
  activeReminders?: Reminder[]
  className?: string
}

// 6 top campus appliances (3 balanced rows of 2) to fit right column height perfectly
const BENCHMARK_NAMES = [
  'Ceiling fan (75 W)',
  'AC 1.5 ton (1500 W)',
  'Laptop charger (65 W)',
  'Desktop PC (200 W)',
  'TV (100 W)',
  'LED bulb (9 W)',
]

export const MonthlyCostBenchmarkCard: React.FC<MonthlyCostBenchmarkCardProps> = ({
  tariff,
  currency,
  selectedPreset,
  onSelectPreset,
  activeReminders = [],
  className = '',
}) => {
  const benchmarkPresets = PRESETS.filter((p: AppliancePreset) =>
    BENCHMARK_NAMES.includes(p.name)
  )

  // Calculate impact of user's active reminders if any
  const totalDailyKwh = activeReminders.reduce(
    (sum, r) => sum + calculateKwh(r.applianceWatts ?? 0, r.avoidedHours ?? 0),
    0
  )
  const totalMonthlyCost = calculateCost(totalDailyKwh * 30, tariff)

  return (
    <Card variant="glass" className={`p-3.5 space-y-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#14301f] flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-800" /> Typical Monthly Run Costs
        </h3>
        <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-800/10">
          {currency}{tariff.toFixed(2)}/kWh
        </span>
      </div>

      {/* User's active habits impact summary */}
      {activeReminders.length > 0 ? (
        <div className="px-2.5 py-1.5 rounded-lg bg-white/70 border border-emerald-900/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="text-[11px] text-[#1e3f2b] truncate font-medium">
              <strong className="text-emerald-950 font-semibold">{activeReminders.length} active habits:</strong> avoiding ~{totalDailyKwh.toFixed(2)} kWh/day ({currency}{totalMonthlyCost.toFixed(0)}/mo)
            </span>
          </div>
          <Link
            to="/reminders"
            className="group flex items-center gap-0.5 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 shrink-0 ml-2"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      ) : (
        <div className="px-2.5 py-1.5 rounded-lg bg-white/50 border border-emerald-900/10 flex items-center justify-between text-[11px] text-slate-600">
          <span>No scheduled power-downs yet</span>
          <Link
            to="/reminders"
            className="font-semibold text-emerald-800 hover:text-emerald-950 underline shrink-0 ml-1"
          >
            Create reminder
          </Link>
        </div>
      )}

      {/* Compact 3x2 Grid of Presets with Monthly Cost */}
      <div className="grid grid-cols-2 gap-1.5">
        {benchmarkPresets.map((preset: AppliancePreset) => {
          const isSelected = selectedPreset === preset.name
          const monthlyKwh = calculateKwh(preset.watts, preset.typicalHours * 30)
          const monthlyCost = calculateCost(monthlyKwh, tariff)
          // Clean name for compact display: remove wattage suffix like " (75 W)"
          const shortName = preset.name.replace(/\s*\(\d+(\.\d+)?\s*(W|ton)\)/, '')

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onSelectPreset(preset.name)}
              title={`Load ${preset.name} (${preset.typicalHours}h/day = ${monthlyKwh.toFixed(1)} kWh/mo)`}
              className={`text-left px-2 py-1.5 rounded-lg text-xs transition-all border flex items-center justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs font-semibold'
                  : 'bg-white/60 hover:bg-white text-[#183624] border-white/80'
              }`}
            >
              <div className="min-w-0">
                <span className="truncate block font-medium text-[11px] leading-tight">{shortName}</span>
                <span
                  className={`text-[10px] block leading-tight ${
                    isSelected ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  {preset.typicalHours}h/day
                </span>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`font-mono tabular-nums text-[11px] font-bold block leading-tight ${
                    isSelected ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {currency}{monthlyCost.toFixed(0)}
                </span>
                <span
                  className={`text-[9px] block leading-none ${
                    isSelected ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  /mo
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* One-Line Caption */}
      <p className="text-[11px] text-[#1e3f2b] italic">
        Typical monthly run cost at your {currency}{tariff}/kWh tariff (30 days). Check appliance labels.
      </p>
    </Card>
  )
}
