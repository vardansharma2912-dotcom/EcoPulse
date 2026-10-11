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
        icon={<Calculator className="w-6 h-6 text-emerald-800" />}
        title="Appliance Audit Module"
        description="Interactive appliance wattage audit and payback estimation tools will be connected in the next phase. Core energy math libraries and data models are already operational."
      />
    </div>
  )
}
