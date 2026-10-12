import React, { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, X, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { useAppState } from '../../state'
import { todayKey } from '../../lib/dates'
import { isDueOn } from '../../lib/schedule'

export interface MobileAlertsPopoverProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileAlertsPopover: React.FC<MobileAlertsPopoverProps> = ({ isOpen, onClose }) => {
  const { state, completeReminder } = useAppState()
  const navigate = useNavigate()
  const today = todayKey()

  const dueToday = useMemo(() => {
    return state.reminders.filter((r) => isDueOn(r, today))
  }, [state.reminders, today])

  const doneTodayIds = useMemo(() => {
    return new Set(state.completions.filter((c) => c.date === today).map((c) => c.reminderId))
  }, [state.completions, today])

  const pendingDue = dueToday.filter((r) => !doneTodayIds.has(r.id))

  const handleMarkDone = (id: string) => {
    completeReminder(id, today)
  }

  const handleViewAll = () => {
    navigate('/reminders')
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="Alerts and Reminders"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed top-14 right-3 z-50 w-[90vw] max-w-xs glass-strong rounded-2xl shadow-xl p-4 border border-white/80"
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-[#14301f]">Today's Reminders</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-md text-slate-500 hover:text-[#14301f]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
              {pendingDue.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-600">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5 opacity-80" />
                  <p className="font-semibold text-emerald-900">All caught up for today!</p>
                  <p className="mt-0.5 text-slate-500">No pending reminders due right now.</p>
                </div>
              ) : (
                pendingDue.slice(0, 4).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-2.5 rounded-xl bg-white/70 border border-emerald-900/10 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#14301f] truncate">
                        {reminder.title}
                      </p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-700" />
                        {reminder.time}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkDone(reminder.id)}
                      className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 shrink-0"
                    >
                      Done
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-emerald-900/10">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 py-1"
              >
                <span>View all reminders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
