import React from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Bell, Check, Clock, X } from 'lucide-react'
import type { Reminder } from '../../types'

export interface InAppAlertBannerProps {
  alerts: Reminder[]
  onMarkDone: (reminder: Reminder) => void
  onSnooze: (reminder: Reminder, minutes?: number) => void
  onDismiss: (reminderId: string) => void
}

export const InAppAlertBanner: React.FC<InAppAlertBannerProps> = ({
  alerts,
  onMarkDone,
  onSnooze,
  onDismiss,
}) => {
  if (alerts.length === 0 || typeof document === 'undefined') return null

  return createPortal(
    <aside
      aria-label="Reminder Alerts"
      aria-live="polite"
      className="fixed top-[calc(54px+env(safe-area-inset-top,0px)+6px)] lg:top-4 right-3 left-3 sm:right-4 sm:left-4 lg:left-auto lg:w-96 z-40 max-h-[60dvh] overflow-y-auto glass-strong p-3.5 border border-emerald-600/40 shadow-2xl rounded-2xl flex flex-col gap-3 pointer-events-auto"
    >
      <div className="flex items-center justify-between pb-2 border-b border-emerald-900/10 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
            {alerts.length} Action{alerts.length === 1 ? '' : 's'} Due Now
          </h3>
        </div>
      </div>

      <div className="space-y-2.5 overflow-y-auto">
        {alerts.map((reminder) => (
          <div
            key={reminder.id}
            className="p-3 bg-white/70 dark:bg-white/[0.06] border border-emerald-950/10 dark:border-white/10 rounded-xl space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-snug">
                  {reminder.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-800 dark:text-emerald-400" />
                    {reminder.time}
                  </span>
                  {reminder.applianceWatts && (
                    <span>• {reminder.applianceWatts}W</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(reminder.id)}
                aria-label="Dismiss alert"
                className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-emerald-900/5 dark:border-white/10">
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] py-1 px-2.5 min-h-[36px]"
                onClick={() => onDismiss(reminder.id)}
              >
                Dismiss
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-[11px] py-1 px-2.5 min-h-[36px]"
                icon={<Clock className="w-3 h-3" />}
                onClick={() => onSnooze(reminder, 15)}
              >
                Snooze
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-[11px] py-1 px-2.5 min-h-[36px]"
                icon={<Check className="w-3 h-3" />}
                onClick={() => onMarkDone(reminder)}
              >
                Done
              </Button>
            </div>
          </div>
        ))}
      </div>
    </aside>,
    document.body
  )
}
