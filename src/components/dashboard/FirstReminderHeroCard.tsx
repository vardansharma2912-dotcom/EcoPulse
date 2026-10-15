import React from 'react'
import { Plus, Lightbulb, Zap, Snowflake, Laptop, Fan, Tv } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { Reminder, ReminderCategory, RecurrenceType } from '../../types'

export interface QuickAddTemplate {
  id: string
  label: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  reminder: Omit<Reminder, 'id' | 'createdAt'>
}

export const QUICK_ADD_TEMPLATES: QuickAddTemplate[] = [
  {
    id: 'tpl-lights',
    label: 'Lights off when leaving',
    hint: 'Save ~40W',
    icon: Lightbulb,
    reminder: {
      title: 'Turn off lights when leaving',
      category: 'lighting' as ReminderCategory,
      time: '22:00',
      recurrence: 'daily' as RecurrenceType,
      applianceWatts: 40,
      avoidedHours: 4,
      active: true,
    },
  },
  {
    id: 'tpl-chargers',
    label: 'Unplug chargers',
    hint: 'Save ~25W standby',
    icon: Zap,
    reminder: {
      title: 'Unplug phone & laptop chargers',
      category: 'chargers' as ReminderCategory,
      time: '08:30',
      recurrence: 'daily' as RecurrenceType,
      applianceWatts: 25,
      avoidedHours: 8,
      active: true,
    },
  },
  {
    id: 'tpl-ac',
    label: 'AC off when room is cool',
    hint: 'Save ~1500W',
    icon: Snowflake,
    reminder: {
      title: 'Turn off AC when leaving or cool',
      category: 'cooling' as ReminderCategory,
      time: '23:00',
      recurrence: 'daily' as RecurrenceType,
      applianceWatts: 1500,
      avoidedHours: 3,
      active: true,
    },
  },
  {
    id: 'tpl-laptop',
    label: 'Laptop sleep / power down',
    hint: 'Save ~65W',
    icon: Laptop,
    reminder: {
      title: 'Put laptop to sleep overnight',
      category: 'computing' as ReminderCategory,
      time: '23:30',
      recurrence: 'daily' as RecurrenceType,
      applianceWatts: 65,
      avoidedHours: 6,
      active: true,
    },
  },
  {
    id: 'tpl-fan',
    label: 'Ceiling fan off',
    hint: 'Save ~75W',
    icon: Fan,
    reminder: {
      title: 'Switch off ceiling fan when leaving',
      category: 'cooling' as ReminderCategory,
      time: '11:00',
      recurrence: 'daily' as RecurrenceType,
      applianceWatts: 75,
      avoidedHours: 4,
      active: true,
    },
  },
  {
    id: 'tpl-tv',
    label: 'TV / screen standby off',
    hint: 'Save ~100W',
    icon: Tv,
    reminder: {
      title: 'Switch off TV & monitor at plug',
      category: 'standby' as ReminderCategory,
      time: '22:30',
      recurrence: 'daily' as RecurrenceType,
      applianceWatts: 100,
      avoidedHours: 5,
      active: true,
    },
  },
]

export interface FirstReminderHeroCardProps {
  onOpenCustom: () => void
  onSelectTemplate: (template: QuickAddTemplate) => void
  onOpenTour?: () => void
}

export const FirstReminderHeroCard: React.FC<FirstReminderHeroCardProps> = ({
  onOpenCustom,
  onSelectTemplate,
  onOpenTour,
}) => {
  return (
    <Card
      variant="glass-strong"
      className="p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl shadow-lg border border-white/80 dark:border-white/10 text-center relative overflow-hidden"
    >
      <div className="max-w-xl mx-auto space-y-4 sm:space-y-5">
        {/* Short Plain Headline Sentence */}
        <div className="space-y-1.5 sm:space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-800/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-800/15 dark:border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            Quick Start
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#0d2818] dark:text-[#f0fdf4] tracking-tight leading-snug">
            EcoPulse reminds you to switch things off. Add your first reminder in 10 seconds.
          </h2>
          <p className="text-xs sm:text-sm text-[#1e3f2b] dark:text-emerald-200/80 font-medium max-w-md mx-auto">
            Choose a common campus habit below, or make your own custom reminder.
          </p>
        </div>

        {/* ONE Large Primary Button */}
        <div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
            onClick={onOpenCustom}
            className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-bold shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all"
          >
            Add my first reminder
          </Button>
        </div>

        {/* 4-6 One-Tap Quick-Add Templates */}
        <div className="pt-2 sm:pt-3 border-t border-emerald-900/10 dark:border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1e3f2b]/80 dark:text-emerald-300/90 mb-2.5">
            Or tap a 1-tap template to prefill:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 text-left">
            {QUICK_ADD_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  className="group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-xl bg-white/70 hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-emerald-900/10 hover:border-emerald-700/40 dark:border-white/10 dark:hover:border-emerald-400/40 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-lg bg-emerald-800/10 dark:bg-emerald-500/20 group-hover:bg-emerald-700 group-hover:text-white text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-stone-400 font-semibold font-mono">
                      {tpl.reminder.time}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0d2818] dark:text-[#f0fdf4] leading-tight line-clamp-2 group-hover:text-emerald-900 dark:group-hover:text-emerald-200">
                      {tpl.label}
                    </h3>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {tpl.hint}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {onOpenTour && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenTour}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100 underline underline-offset-2 transition-colors cursor-pointer"
            >
              How EcoPulse works (3-step walkthrough)
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
