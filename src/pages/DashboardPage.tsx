import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Card } from '../components/ui/Card'
import { Zap, Clock, TrendingUp } from 'lucide-react'
import { useAppState } from '../state'

export const DashboardPage: React.FC = () => {
  const { state } = useAppState()

  // Calculated estimates based on completed reminders
  const totalKwh = state.completions.reduce((acc, c) => acc + c.kWh, 0)
  const totalSaved = state.completions.reduce((acc, c) => acc + c.costSaved, 0)
  const completionsCount = state.completions.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Conservation Dashboard"
        description="Daily overview of your energy-saving actions and estimated savings."
      />

      {/* Real-data Estimates on Frosted Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass">
          <div className="flex items-center justify-between text-[#14301f] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">
              Total Energy Saved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900 border border-emerald-900/10">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {totalKwh.toFixed(2)} <span className="text-sm font-bold text-[#1b4332]">kWh</span>
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-semibold mt-1">
            Estimated from your completed reminders
          </p>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-[#14301f] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">
              Estimated Bill Reduction
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900 border border-emerald-900/10">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            ₹{totalSaved.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-semibold mt-1">
            Estimated at your tariff (₹{state.settings.tariffPerKwh}/kWh placeholder, change in Settings)
          </p>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-[#14301f] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14301f]">
              Actions Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/15 flex items-center justify-center text-emerald-900 border border-emerald-900/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#0f2819] tabular-nums tracking-tight">
            {completionsCount}
          </p>
          <p className="text-[11px] text-[#1e3f2b] font-semibold mt-1">
            Reminders you marked as done (Self-reported actions)
          </p>
        </Card>
      </div>

      {/* Honest Empty State on Glass Card */}
      <EmptyState
        icon={<Zap className="w-6 h-6 text-emerald-900" />}
        title="No Activity Logged Today"
        description="No energy saving actions have been logged yet today. Check off your active energy reminders in the Reminders tab to begin tracking estimated kWh savings."
      />
    </div>
  )
}
