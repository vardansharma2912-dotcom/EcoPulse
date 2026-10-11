import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Card } from '../components/ui/Card'
import { Zap, Clock, TrendingUp } from 'lucide-react'
import { useAppState } from '../state'

export const DashboardPage: React.FC = () => {
  const { state } = useAppState()

  // Real calculations only: strictly no fake numbers or simulated watts
  const totalKwh = state.completions.reduce((acc, c) => acc + c.kWh, 0)
  const totalSaved = state.completions.reduce((acc, c) => acc + c.costSaved, 0)
  const completionsCount = state.completions.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Conservation Dashboard"
        description="Daily overview of verified energy-saving actions and measured conservation metrics."
      />

      {/* Real Metrics Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-950">
              Total Energy Saved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#14301f] tabular-nums tracking-tight">
            {totalKwh.toFixed(2)} <span className="text-sm font-semibold text-slate-600">kWh</span>
          </p>
          <p className="text-[11px] text-slate-600 font-medium mt-1">Calculated from verified reminder completions</p>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-950">
              Estimated Bill Reduction
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#14301f] tabular-nums tracking-tight">
            ₹{totalSaved.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-600 font-medium mt-1">
            At ₹{state.settings.tariffPerKwh}/unit domestic tariff rate
          </p>
        </Card>

        <Card variant="glass">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-950">
              Actions Completed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#14301f] tabular-nums tracking-tight">
            {completionsCount}
          </p>
          <p className="text-[11px] text-slate-600 font-medium mt-1">Verified appliance power-down events</p>
        </Card>
      </div>

      {/* Honest Empty State for Activity Feed */}
      <EmptyState
        icon={<Zap className="w-6 h-6 text-emerald-800" />}
        title="No Activity Logged Today"
        description="No energy saving actions have been logged yet today. Check off your active energy reminders in the Reminders tab to begin tracking genuine kWh savings."
      />
    </div>
  )
}
