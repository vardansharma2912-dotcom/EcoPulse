import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../context/useToast'
import { useAppState } from '../state'
import { todayKey } from '../lib/dates'
import { todayStatus, type ReminderStatus } from '../lib/schedule'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { DeleteConfirmDialog } from '../components/reminders/DeleteConfirmDialog'
import { SnoozeDialog } from '../components/reminders/SnoozeDialog'
import type { Reminder, ReminderCategory } from '../types'
import {
  Bell,
  RotateCcw,
  Clock,
  Zap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  BellOff,
  AlertCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react'

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  lighting: 'Lighting',
  cooling: 'Cooling',
  chargers: 'Chargers',
  computing: 'Computers',
  appliances: 'Appliances',
  standby: 'Standby',
  shared: 'Shared spaces',
  other: 'Other',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatRecurrence(reminder: Reminder): string {
  switch (reminder.recurrence) {
    case 'once':
      return 'Once'
    case 'daily':
      return 'Daily (Every day)'
    case 'weekdays':
      return 'Weekdays (Mon – Fri)'
    case 'weekly': {
      if (!reminder.days || reminder.days.length === 0) return 'Weekly'
      const names = reminder.days.map((d) => DAY_LABELS[d]).join(', ')
      return `Weekly (${names})`
    }
    default:
      return reminder.recurrence
  }
}

function formatEnergyEstimate(reminder: Reminder): string {
  if (
    reminder.applianceWatts !== undefined &&
    reminder.avoidedHours !== undefined &&
    reminder.applianceWatts > 0 &&
    reminder.avoidedHours > 0
  ) {
    const kwh = (reminder.applianceWatts * reminder.avoidedHours) / 1000
    return `${reminder.applianceWatts}W × ${reminder.avoidedHours}h ≈ ${kwh.toFixed(2)} kWh/action`
  }
  return 'No energy estimate set'
}

type StatusFilter = 'all' | 'due' | 'done' | 'snoozed' | 'inactive'

export const RemindersPage: React.FC = () => {
  const {
    state,
    addReminder,
    editReminder,
    deleteReminder,
    completeReminder,
    undoCompletion,
    snoozeReminder,
    toggleActive,
  } = useAppState()
  const { showToast } = useToast()

  const today = todayKey()

  // Dialog State
  const [formOpen, setFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)
  const [snoozeTarget, setSnoozeTarget] = useState<Reminder | null>(null)

  // Filter State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const [currentDate] = useState(() => new Date())

  // Map reminders to their today status
  const remindersWithStatus = useMemo(() => {
    return state.reminders.map((r) => ({
      reminder: r,
      status: todayStatus(r, state.completions, currentDate),
    }))
  }, [state.reminders, state.completions, currentDate])

  // Filter and sort
  const filteredReminders = useMemo(() => {
    return remindersWithStatus
      .filter(({ reminder, status }) => {
        // Search query
        if (
          searchQuery.trim() &&
          !reminder.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        ) {
          return false
        }

        // Category filter
        if (categoryFilter !== 'all' && reminder.category !== categoryFilter) {
          return false
        }

        // Status filter
        if (statusFilter === 'due') {
          return status !== 'not-due' && reminder.active
        }
        if (statusFilter === 'done') {
          return status === 'done'
        }
        if (statusFilter === 'snoozed') {
          return status === 'snoozed'
        }
        if (statusFilter === 'inactive') {
          return !reminder.active
        }

        return true
      })
      .sort((a, b) => {
        // Sort due-today items first
        const aIsDue = a.status !== 'not-due' && a.reminder.active
        const bIsDue = b.status !== 'not-due' && b.reminder.active

        if (aIsDue && !bIsDue) return -1
        if (!aIsDue && bIsDue) return 1

        // Within due/not due, sort by time ascending
        return a.reminder.time.localeCompare(b.reminder.time)
      })
  }, [remindersWithStatus, searchQuery, categoryFilter, statusFilter])

  const handleOpenAdd = () => {
    setEditingReminder(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormOpen(true)
  }

  const handleSaveReminder = (data: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => {
    if ('id' in data) {
      editReminder(data)
      showToast('Reminder updated!')
    } else {
      addReminder(data)
      showToast('Reminder created!')
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteReminder(deleteTarget.id)
      showToast(`Deleted "${deleteTarget.title}"`)
      setDeleteTarget(null)
    }
  }

  const handleComplete = (reminder: Reminder) => {
    completeReminder(reminder.id, today)
    showToast(`Marked "${reminder.title}" done`, {
      label: 'Undo',
      onClick: () => {
        undoCompletion(reminder.id, today)
        showToast('Completion undone')
      },
    })
  }

  const handleUndo = (reminder: Reminder) => {
    undoCompletion(reminder.id, today)
    showToast('Completion undone')
  }

  const handleSnooze = (options: { minutes?: number; nextDue?: boolean }) => {
    if (snoozeTarget) {
      snoozeReminder(snoozeTarget.id, options)
      const minutes = options.minutes ?? 15
      const until = new Date(Date.now() + minutes * 60000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      showToast(`Snoozed until ${until}`)
      setSnoozeTarget(null)
    }
  }

  const handleToggleActive = (reminder: Reminder) => {
    toggleActive(reminder.id)
    showToast(reminder.active ? `Deactivated "${reminder.title}"` : `Activated "${reminder.title}"`)
  }

  const handleClearFilters = () => {
    setStatusFilter('all')
    setCategoryFilter('all')
    setSearchQuery('')
  }

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== ''

  const renderStatusBadge = (status: ReminderStatus, active: boolean) => {
    if (!active) {
      return <Badge variant="neutral">Inactive</Badge>
    }
    switch (status) {
      case 'done':
        return <Badge variant="emerald">Done today</Badge>
      case 'snoozed':
        return <Badge variant="amber">Snoozed</Badge>
      case 'overdue':
        return <Badge variant="rose">Overdue</Badge>
      case 'upcoming':
        return <Badge variant="blue">Upcoming today</Badge>
      case 'not-due':
        return <Badge variant="neutral">Not due today</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Reminders"
        description="Daily schedules to power down, unplug, and optimize household and campus appliances."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Reminder
          </Button>
        }
        badge={
          <Badge variant="emerald" size="sm">
            {state.reminders.filter((r) => r.active).length} Active
          </Badge>
        }
      />

      {/* Filter and Search Controls on Frosted Glass Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reminders by title..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white/90 border border-emerald-950/20 text-[#14301f] placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-emerald-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="rounded-lg bg-white/90 border border-emerald-950/20 px-3 py-2 text-sm text-[#14301f] focus-visible:outline-2 focus-visible:outline-emerald-800 font-medium"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs in Horizontally Scrollable Snap Row with Edge Fade */}
        <div className="relative pt-1 border-t border-emerald-900/10">
          <div className="pointer-events-none absolute left-0 top-1 bottom-0 w-3 bg-gradient-to-r from-white/90 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-1 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent z-10" />

          <div className="flex items-center gap-1.5 overflow-x-auto snap-x scrollbar-thin py-1 px-1">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'due', label: 'Due Today' },
                { id: 'done', label: 'Done' },
                { id: 'snoozed', label: 'Snoozed' },
                { id: 'inactive', label: 'Inactive' },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer select-none snap-start shrink-0 ${
                    isActive ? 'text-white' : 'text-[#183624] hover:text-[#0f2819] hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 bg-emerald-700 rounded-lg -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              )
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="ml-auto text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer shrink-0 snap-end pl-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main List of Reminders with popLayout List Reflow (Item 6) */}
      {state.reminders.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6 text-emerald-800" />}
          title="No Reminders Configured"
          description="You currently have no scheduled energy reminders. Click 'Add Reminder' above or restore the defaults via Settings."
          action={
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
              Add Your First Reminder
            </Button>
          }
        />
      ) : filteredReminders.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-6 h-6 text-emerald-800" />}
          title="No Reminders Match Your Filters"
          description="Try broadening your category, status filter, or search keywords."
          action={
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredReminders.map(({ reminder, status }) => {
              const isDone = status === 'done'

              return (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <Card
                    variant="glass"
                    className={`h-full transition-colors flex flex-col justify-between ${
                      !reminder.active
                        ? 'opacity-65 bg-white/40'
                        : isDone
                        ? 'border-emerald-600/40 bg-emerald-50/70 shadow-sm'
                        : 'hover:bg-white/75'
                    }`}
                  >
                    <div>
                      {/* Top Header: Title, Category & Status Badge */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-base text-[#102819] leading-snug">
                            {reminder.title}
                          </h3>
                          <div className="flex items-center gap-2">
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
                      </div>

                      {/* Metadata Row: Time, Recurrence & Energy Estimate */}
                      <div className="space-y-1.5 py-2 text-xs text-[#183a26] font-semibold border-y border-emerald-900/10 my-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-800" />
                            {reminder.time} • {formatRecurrence(reminder)}
                          </span>
                          {reminder.snoozedUntil && status === 'snoozed' && (
                            <span className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
                              <BellOff className="w-3 h-3" />
                              Snoozed until {new Date(reminder.snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#1b4332]">
                          <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{formatEnergyEstimate(reminder)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row: Primary Done Button + "..." Menu (Snooze, Edit, Delete) */}
                    <div className="flex items-center justify-between pt-2.5 text-xs relative">
                      {/* "..." More Menu (Snooze, Edit, Delete, Toggle Active) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === reminder.id ? null : reminder.id)}
                          aria-label={`More options for ${reminder.title}`}
                          aria-haspopup="menu"
                          aria-expanded={menuOpenId === reminder.id}
                          className="p-2 rounded-xl text-slate-600 hover:text-emerald-950 hover:bg-emerald-900/10 transition-colors border border-emerald-950/10 bg-white/70"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {menuOpenId === reminder.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setMenuOpenId(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.12 }}
                                className="absolute left-0 bottom-full mb-1.5 z-40 w-44 rounded-xl glass-strong shadow-xl border border-white/90 p-1.5 space-y-1 text-xs font-semibold text-[#14301f]"
                              >
                                {reminder.active && !isDone && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuOpenId(null)
                                      setSnoozeTarget(reminder)
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/10 text-left transition-colors"
                                  >
                                    <BellOff className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Snooze reminder</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpenId(null)
                                    handleOpenEdit(reminder)
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/10 text-left transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-emerald-800" />
                                  <span>Edit reminder</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpenId(null)
                                    handleToggleActive(reminder)
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/10 text-left transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                                  <span>{reminder.active ? 'Deactivate' : 'Activate'}</span>
                                </button>
                                <div className="h-px bg-emerald-900/10 my-0.5" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpenId(null)
                                    setDeleteTarget(reminder)
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-900/10 text-rose-700 text-left transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete reminder</span>
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Primary Action Button: "Done" with Animated Checkmark */}
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<RotateCcw className="w-3.5 h-3.5 text-slate-700" />}
                            onClick={() => handleUndo(reminder)}
                          >
                            Undo Done
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!reminder.active}
                            icon={
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <motion.path
                                  d="M5 13l4 4L19 7"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }}
                                />
                              </svg>
                            }
                            onClick={() => handleComplete(reminder)}
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Drawer */}
      <ReminderFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveReminder}
        initialReminder={editingReminder}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          reminderTitle={deleteTarget.title}
        />
      )}

      {/* Snooze Presets Dialog */}
      {snoozeTarget && (
        <SnoozeDialog
          open={Boolean(snoozeTarget)}
          onClose={() => setSnoozeTarget(null)}
          onSnooze={handleSnooze}
          reminderTitle={snoozeTarget.title}
        />
      )}
    </div>
  )
}
