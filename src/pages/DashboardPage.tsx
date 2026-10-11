import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Card } from '../components/ui/Card'
import { Zap, Clock, TrendingUp } from 'lucide-react'
import { useAppState } from '../state'

export const DashboardPage: React.FC = () => {
  const { state } = useAppState()

  // Real data calculations only: no simulated values
  const totalKwh = state.completions.reduce((acc, c) => acc + c.kWh, 0)
  const totalSaved = state.completions.reduce((acc, c) => acc + c.costSaved, 0)
  const completionsCount = state.completions.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Dashboard"
        description="Daily overview of verified energy-saving actions and conservation metrics."
      />

      {/* Real Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Energy Saved</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {totalKwh.toFixed(2)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Calculated from verified actions</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Estimated Bill Reduction</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            ₹{totalSaved.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">At ₹{state.settings.tariffPerKwh}/unit domestic tariff</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Actions Completed</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {completionsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Logged reminder completions</p>
        </Card>
      </div>

      {/* Honest Empty State for Activity Feed */}
      <EmptyState
        icon={<Zap className="w-6 h-6 text-slate-400" />}
        title="No Activity Logged Today"
        description="No energy saving actions have been logged yet today. Complete your active reminders in the Reminders tab to start tracking real kilowatt-hours saved."
      />
    </div>
  )
}
