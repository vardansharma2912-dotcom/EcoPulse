import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Reminder } from '../../types'
import type { ReminderStatus } from '../../lib/schedule'
import {
  CATEGORY_LABELS,
  formatRecurrence,
  formatEnergyEstimate,
  renderStatusBadge,
} from './reminderUtils'
import {
  Clock,
  Zap,
  Edit2,
  Trash2,
  BellOff,
  RotateCcw,
  MoreVertical,
} from 'lucide-react'

export interface ReminderCardProps {
  reminder: Reminder
  status: ReminderStatus
  isMenuOpen: boolean
  onToggleMenu: (id: string) => void
  onCloseMenu: () => void
  onComplete: (reminder: Reminder) => void
  onUndo: (reminder: Reminder) => void
  onOpenEdit: (reminder: Reminder) => void
  onOpenSnooze: (reminder: Reminder) => void
  onToggleActive: (reminder: Reminder) => void
  onOpenDelete: (reminder: Reminder) => void
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  status,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onComplete,
  onUndo,
  onOpenEdit,
  onOpenSnooze,
  onToggleActive,
  onOpenDelete,
}) => {
  const isDone = status === 'done'

  return (
    <Card
      variant="glass"
      padding="none"
      className={`p-4 sm:p-5 h-full transition-colors flex flex-col gap-3 justify-between ${
        isMenuOpen ? 'relative z-20 ' : ''
      }${
        !reminder.active
          ? 'opacity-65 bg-white/40 dark:bg-white/[0.03]'
          : isDone
          ? 'border-emerald-600/40 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-sm'
          : 'hover:bg-white/75 dark:hover:bg-white/[0.08]'
      }`}
    >
      {/* Top Section: Row 1 (Title + ⋮ Menu) and Row 2 (Category + Status Chips) */}
      <div className="space-y-2.5">
        {/* Row 1: Title (wraps to 2 lines max, line-clamp-2) & ⋮ Menu Button at top-right (36x36, items-start) */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="font-bold text-base text-[var(--text-primary)] leading-snug flex-1 min-w-0 line-clamp-2 break-words"
            title={reminder.title}
          >
            {reminder.title}
          </h3>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onToggleMenu(reminder.id)}
              aria-label={`More actions for ${reminder.title}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-stone-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-900/10 dark:hover:bg-white/10 transition-colors border border-emerald-950/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={onCloseMenu}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl bg-white/95 dark:bg-[#0c2417] backdrop-blur-md shadow-xl border border-emerald-950/15 dark:border-white/15 p-1.5 space-y-1 text-xs font-semibold text-[var(--text-primary)]"
                  >
                    {reminder.active && !isDone && (
                      <button
                        type="button"
                        onClick={() => {
                          onCloseMenu()
                          onOpenSnooze(reminder)
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/10 dark:hover:bg-white/10 text-left transition-colors cursor-pointer"
                      >
                        <BellOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Snooze reminder</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu()
                        onOpenEdit(reminder)
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/10 dark:hover:bg-white/10 text-left transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                      <span>Edit reminder</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu()
                        onToggleActive(reminder)
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/10 dark:hover:bg-white/10 text-left transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-stone-400" />
                      <span>{reminder.active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    <div className="h-px bg-emerald-900/10 dark:bg-white/10 my-0.5" />
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu()
                        onOpenDelete(reminder)
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-900/10 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-left transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete reminder</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2: Category Chip + Status Chip */}
        <div className="flex items-center flex-wrap gap-2">
          <Badge variant="neutral" size="sm">
            {CATEGORY_LABELS[reminder.category]}
          </Badge>
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {renderStatusBadge(status, reminder.active)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Row 3 (Combined Meta + Action Row): Stacked Meta on Left, Done / Undo Button on Right */}
      <div className="border-t border-emerald-900/10 dark:border-white/10 pt-3 mt-auto flex flex-col min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between gap-3">
        {/* Left Column: Two Meta Lines Stacked */}
        <div className="space-y-1 text-xs text-[var(--text-primary)] font-semibold min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
              <span>{`${reminder.time} • ${formatRecurrence(reminder)}`}</span>
            </span>
            {reminder.snoozedUntil && status === 'snoozed' && (
              <span className="text-[11px] text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1">
                <BellOff className="w-3 h-3 shrink-0" />
                <span>
                  Snoozed until {new Date(reminder.snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <Zap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{formatEnergyEstimate(reminder)}</span>
          </div>
        </div>

        {/* Right Column: Done / Undo Done Button (min 44px tall for touch) */}
        <div className="shrink-0 w-full min-[400px]:w-auto flex items-center">
          {isDone ? (
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[44px] w-full min-[400px]:w-auto justify-center"
              icon={<RotateCcw className="w-3.5 h-3.5 text-slate-700" />}
              onClick={() => onUndo(reminder)}
            >
              Undo Done
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              disabled={!reminder.active}
              className="min-h-[44px] w-full min-[400px]:w-auto justify-center"
              icon={
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                </svg>
              }
              onClick={() => onComplete(reminder)}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
