import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { CATEGORY_LABELS } from '../reminders/reminderUtils'
import type { ReminderCategory } from '../../types'
import type { FillerContext } from './types'
import { Layers, ArrowRight } from 'lucide-react'

export interface CategoryBreakdownFillerProps {
  height: number
  context: FillerContext
  className?: string
}

export const CategoryBreakdownFiller: React.FC<CategoryBreakdownFillerProps> = ({
  height,
  context,
  className = '',
}) => {
  const { completions, reminders } = context

  // Group real completions by category
  const categories = useMemo(() => {
    const reminderMap = new Map(reminders.map((r) => [r.id, r.category]))
    const map = new Map<ReminderCategory, { actions: number; kwh: number }>()

    for (const c of completions) {
      const cat = (c.reminderId ? reminderMap.get(c.reminderId) : undefined) || 'other'
      const existing = map.get(cat) || { actions: 0, kwh: 0 }
      map.set(cat, {
        actions: existing.actions + 1,
        kwh: existing.kwh + (c.kWh || 0),
      })
    }

    return Array.from(map.entries())
      .map(([cat, stats]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        actions: stats.actions,
        kwh: Math.round(stats.kwh * 100) / 100,
      }))
      .sort((a, b) => b.actions - a.actions)
  }, [completions, reminders])

  // Guard: if fewer than 3 completions, return null (handled by catalog guard too)
  if (completions.length < 3 || categories.length === 0) {
    return null
  }

  const totalActions = completions.length
  // Adapt to height: show top 3 or top 4
  const maxItems = height < 440 ? 3 : 4
  const displayItems = categories.slice(0, maxItems)

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
          <div className="flex items-center gap-1.5 min-w-0">
            <Layers className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
              Top Action Categories
            </h3>
          </div>
          <Badge variant="neutral" size="sm" className="shrink-0 text-[10px]">
            {categories.length} {categories.length === 1 ? 'type' : 'types'}
          </Badge>
        </div>

        <p className="text-[11px] text-[var(--text-secondary)] mb-3">
          Breakdown of your {totalActions} logged conservation checks.
        </p>

        {/* Category List */}
        <div className="space-y-2.5">
          {displayItems.map((item) => {
            const pct = Math.round((item.actions / totalActions) * 100)

            return (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-primary)] truncate">{item.label}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-950 dark:text-[var(--text-primary)] shrink-0">
                    <span>{item.actions} act</span>
                    <span className="text-slate-400 dark:text-stone-500">•</span>
                    <span>{item.kwh} kWh</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-emerald-950/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Link to Analytics */}
      <div className="pt-2 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[var(--text-secondary)]">Based on logged data</span>
        <Link
          to="/analytics"
          className="font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 inline-flex items-center gap-1 group"
        >
          <span>View analytics</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  )
}

export default CategoryBreakdownFiller
