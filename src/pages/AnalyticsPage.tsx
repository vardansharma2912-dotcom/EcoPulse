import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Conservation Analytics"
        description="Historical trends, weekly carbon footprint reductions, and campus comparative data."
      />

      <EmptyState
        icon={<BarChart3 className="w-6 h-6 text-emerald-800" />}
        title="No Conservation History Logged"
        description="Analytics charts and energy trend graphs will generate automatically once verified actions are completed over consecutive days. Strictly no simulated or fake history is displayed."
      />
    </div>
  )
}
