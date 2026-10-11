import React from 'react'
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
  if (alerts.length === 0) return null

  return (
    <aside
      aria-label="Reminder Alerts"
      aria-live="polite"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 space-y-2.5 pointer-events-auto"
    >
      {alerts.map((reminder) => (
        <div
          key={reminder.id}
          className="glass-strong p-4 border border-emerald-600/40 shadow-xl rounded-2xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Energy Reminder Due
                </p>
                <h4 className="font-bold text-sm text-[#102819] leading-snug">
                  {reminder.title}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(reminder.id)}
              aria-label="Dismiss alert"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#1e3f2b] font-medium px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              Scheduled for {reminder.time}
            </span>
            {reminder.applianceWatts && (
              <span>
                Est. {reminder.applianceWatts}W
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-900/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(reminder.id)}
            >
              Dismiss
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Clock className="w-3.5 h-3.5" />}
              onClick={() => onSnooze(reminder, 15)}
            >
              Snooze 15m
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={() => onMarkDone(reminder)}
            >
              Mark Done
            </Button>
          </div>
        </div>
      ))}
    </aside>
  )
}
