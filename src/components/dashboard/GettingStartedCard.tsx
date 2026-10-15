import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  CheckCircle2,
  Circle,
  Sparkles,
  X,
  User,
  Check,
  PlusCircle,
  Calculator,
  Bell,
  ArrowRight,
} from 'lucide-react'
import { Card } from '../ui/Card'
import { useAppState } from '../../state'
import { CHECKLIST_DISMISSED_KEY } from '../../lib/storage'
import {
  CALC_VISITED_KEY,
  getChecklistFirstSeenTimestamp,
  isChecklistExpired,
} from '../../lib/checklist'

export interface GettingStartedCardProps {
  onOpenAddReminder?: () => void
}

export const GettingStartedCard: React.FC<GettingStartedCardProps> = ({ onOpenAddReminder }) => {
  const { state } = useAppState()

  // Earliest reminder creation date as fallback for pre-existing users
  const earliestReminderCreatedAt = useMemo(() => {
    if (!state.reminders || state.reminders.length === 0) return undefined
    let earliest = Infinity
    for (const r of state.reminders) {
      if (r.createdAt) {
        const time = new Date(r.createdAt).getTime()
        if (!isNaN(time) && time < earliest) {
          earliest = time
        }
      }
    }
    return earliest !== Infinity ? new Date(earliest).toISOString() : undefined
  }, [state.reminders])

  const [isExpired] = useState(() => {
    const firstSeen = getChecklistFirstSeenTimestamp(earliestReminderCreatedAt)
    return isChecklistExpired(firstSeen)
  })

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(CHECKLIST_DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  // Derive item completion strictly from real state
  const items = useMemo(() => {
    const isNameSet = Boolean(state.settings.displayName?.trim())
    const isFirstDone = state.completions.length > 0
    const isOwnAdded = state.reminders.some(
      (r) => !['rem-1', 'rem-2', 'rem-3', 'rem-4', 'rem-5', 'rem-6'].includes(r.id)
    )
    let isCalcVisited = false
    try {
      isCalcVisited = localStorage.getItem(CALC_VISITED_KEY) === 'true'
    } catch {
      isCalcVisited = false
    }
    const isNotifEnabled = Boolean(state.settings.notificationsEnabled)

    return [
      {
        id: 'name',
        label: 'Set your display name',
        done: isNameSet,
        link: '/settings',
        icon: User,
      },
      {
        id: 'done',
        label: 'Mark your first reminder done',
        done: isFirstDone,
        link: '/reminders',
        icon: Check,
      },
      {
        id: 'custom-reminder',
        label: 'Add your own custom reminder',
        done: isOwnAdded,
        onClick: onOpenAddReminder,
        link: onOpenAddReminder ? undefined : '/reminders?add=true',
        icon: PlusCircle,
      },
      {
        id: 'calc',
        label: 'Open the energy calculator',
        done: isCalcVisited,
        link: '/calculator',
        icon: Calculator,
      },
      {
        id: 'notif',
        label: 'Enable browser reminder alerts',
        done: isNotifEnabled,
        link: '/settings',
        icon: Bell,
      },
    ]
  }, [state.settings.displayName, state.settings.notificationsEnabled, state.completions.length, state.reminders, onOpenAddReminder])

  const completedCount = items.filter((i) => i.done).length
  const allCompleted = completedCount === items.length

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true')
    } catch {
      // Ignore
    }
  }

  // Hides itself when zero reminders (hero card shown first), expired (after 3 days), dismissed, or when all items are done
  if (!state.reminders || state.reminders.length === 0 || isExpired || dismissed || allCompleted) {
    return null
  }

  const percent = Math.round((completedCount / items.length) * 100)

  return (
    <Card variant="glass-strong" className="p-4 sm:p-5 relative overflow-hidden border-emerald-800/20 shadow-md">
      {/* Top Banner Row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-900/10">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-[#14301f] tracking-tight truncate">
              Getting Started Checklist
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
              {completedCount} of {items.length}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Complete small milestones to get the most out of EcoPulse.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-900/5 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-emerald-950/10 rounded-full h-1.5 my-3 overflow-hidden">
        <motion.div
          className="bg-emerald-700 h-1.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {items.map((item) => {
          const Content = (
            <div
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${item.done
                  ? 'bg-emerald-100/60 text-emerald-950'
                  : 'bg-white/70 text-slate-700 hover:bg-white hover:text-emerald-950 hover:shadow-xs'
                }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className={`truncate ${item.done ? 'line-through opacity-75' : ''}`}>
                {item.label}
              </span>
              {!item.done && <ArrowRight className="w-3 h-3 text-slate-400 ml-auto shrink-0" />}
            </div>
          )

          if (item.done) {
            return (
              <div key={item.id} className="cursor-default">
                {Content}
              </div>
            )
          }

          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="text-left cursor-pointer w-full"
              >
                {Content}
              </button>
            )
          }

          return (
            <Link key={item.id} to={item.link || '#'} className="block">
              {Content}
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
