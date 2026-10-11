import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { BookOpen } from 'lucide-react'

export const LearnPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Studies Syllabus"
        description="Core concepts from CHE110: vampire draw, thermal insulation, and carbon intensity of energy grids."
      />

      <EmptyState
        icon={<BookOpen className="w-6 h-6 text-slate-400" />}
        title="Knowledge Modules & Study Material"
        description="Course material on energy efficiency, thermal comfort optimization, and academic references for the CHE110 assignment will be structured here."
      />
    </div>
  )
}
