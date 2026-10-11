import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useAppState } from '../state'
import { todayKey } from '../lib/dates'
import { Bell, Check, RotateCcw, Clock, Zap } from 'lucide-react'

export const RemindersPage: React.FC = () => {
  const { state, completeReminder, undoCompletion, toggleActive } = useAppState()
  const today = todayKey()

  const isCompletedToday = (reminderId: string) => {
    return state.completions.some(
      (c) => c.reminderId === reminderId && c.date === today
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Reminders"
        description="Daily prompts to power off, unplug, and optimize household and campus appliances."
        badge={
          <Badge variant="emerald" size="sm">
            {state.reminders.filter((r) => r.active).length} Active
          </Badge>
        }
      />

      {state.reminders.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6 text-slate-400" />}
          title="No Reminders Configured"
          description="You currently have no scheduled energy reminders. Reset to default presets in Settings or add new reminders."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.reminders.map((reminder) => {
            const completed = isCompletedToday(reminder.id)

            return (
              <Card
                key={reminder.id}
                className={`transition-colors ${
                  !reminder.active
                    ? 'opacity-60 bg-[#0d1017]'
                    : completed
                    ? 'border-emerald-800/40 bg-emerald-950/10'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {reminder.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {reminder.time} ({reminder.recurrence})
                      </span>
                      {reminder.applianceWatts && (
                        <span className="flex items-center gap-1 font-mono">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          {reminder.applianceWatts}W
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={completed ? 'emerald' : reminder.active ? 'neutral' : 'amber'}>
                    {completed ? 'Saved Today' : reminder.active ? reminder.category : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#222936] text-xs">
                  <span className="text-slate-400">
                    Est. {reminder.avoidedHours ?? 1}h avoided/action
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(reminder.id)}
                    >
                      {reminder.active ? 'Disable' : 'Enable'}
                    </Button>

                    {completed ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
                        onClick={() => undoCompletion(reminder.id, today)}
                      >
                        Undo
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!reminder.active}
                        icon={<Check className="w-3.5 h-3.5" />}
                        onClick={() => completeReminder(reminder.id, today)}
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
