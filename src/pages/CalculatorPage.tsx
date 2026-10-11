import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Calculator } from 'lucide-react'

export const CalculatorPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appliance Energy Calculator"
        description="Estimate running costs, hourly wattage draw, and potential monthly conservation per device."
      />

      <EmptyState
        icon={<Calculator className="w-6 h-6 text-slate-400" />}
        title="Appliance Audit Module"
        description="Interactive wattage calculator and appliance payback comparison tools will be built in the next project iteration. Foundation data models and energy math libraries are already initialized."
      />
    </div>
  )
}
