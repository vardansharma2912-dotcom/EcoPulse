import React, { useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Clock, Sun, BellOff, Sliders } from 'lucide-react'
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
  const [showCustom, setShowCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('30')

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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(customMinutes, 10)
    if (!isNaN(parsed) && parsed > 0) {
      onSnooze({ minutes: parsed })
      onClose()
    }
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
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#14301f]">15 minutes</p>
              <p className="text-xs text-[#1e3f2b]">Brief pause while finishing task</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform shrink-0">
            Select →
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSnoozeMinutes(60)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <BellOff className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#14301f]">1 hour</p>
              <p className="text-xs text-[#1e3f2b]">Postpone until later today</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform shrink-0">
            Select →
          </span>
        </button>

        <button
          type="button"
          onClick={handleSnoozeTomorrowMorning}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-900 shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#14301f]">Until tomorrow morning</p>
              <p className="text-xs text-[#1e3f2b]">Resume tomorrow at 08:00 AM</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform shrink-0">
            Select →
          </span>
        </button>

        {/* Custom duration option */}
        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/70 hover:bg-white text-left border border-emerald-900/10 transition-all cursor-pointer shadow-xs group min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#14301f]">Custom duration</p>
                <p className="text-xs text-[#1e3f2b]">Specify exact minutes</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform shrink-0">
              Custom →
            </span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-xl bg-white/90 border border-emerald-700/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-bold text-emerald-950">Custom Snooze Minutes</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="1440"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="e.g. 45"
                className="text-base"
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0 min-h-[44px]">
                Snooze
              </Button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-3 border-t border-emerald-950/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="min-h-[44px] px-4">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
