import React from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Clock, Sun, BellOff } from 'lucide-react'
import { addDays } from '../../lib/dates'

export interface SnoozeDialogProps {
  open: boolean
  onClose: () => void
  onSnooze: (options: { minutes?: number; until?: string }) => void
  reminderTitle: string
}

export const SnoozeDialog: React.FC<SnoozeDialogProps> = ({
  open,
  onClose,
  onSnooze,
  reminderTitle,
}) => {
  const handleSnoozeMinutes = (minutes: number) => {
    onSnooze({ minutes })
    onClose()
  }

  const handleSnoozeTomorrowMorning = () => {
    const tomorrow = addDays(new Date(), 1)
    tomorrow.setHours(8, 0, 0, 0)
    onSnooze({ until: tomorrow.toISOString() })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Snooze Reminder"
      description={`Postpone notifications and due alerts for "${reminderTitle}".`}
    >
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={() => handleSnoozeMinutes(15)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#14301f]">15 minutes</p>
              <p className="text-xs text-[#1e3f2b]">Brief pause while finishing task</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
            Select →
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSnoozeMinutes(60)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <BellOff className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#14301f]">1 hour</p>
              <p className="text-xs text-[#1e3f2b]">Postpone until later today</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
            Select →
          </span>
        </button>

        <button
          type="button"
          onClick={handleSnoozeTomorrowMorning}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-900">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#14301f]">Until tomorrow morning</p>
              <p className="text-xs text-[#1e3f2b]">Resume tomorrow at 08:00 AM</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
            Select →
          </span>
        </button>

        <div className="flex justify-end pt-3 border-t border-emerald-950/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
