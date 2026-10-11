import React, { useState, useMemo } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useAppState } from '../state'
import { todayKey } from '../lib/dates'
import { todayStatus, type ReminderStatus } from '../lib/schedule'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { DeleteConfirmDialog } from '../components/reminders/DeleteConfirmDialog'
import { SnoozeDialog } from '../components/reminders/SnoozeDialog'
import type { Reminder, ReminderCategory } from '../types'
import {
  Bell,
  Check,
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
    } else {
      addReminder(data)
    }
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-emerald-900/10">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'due', label: 'Due Today' },
              { id: 'done', label: 'Done' },
              { id: 'snoozed', label: 'Snoozed' },
              { id: 'inactive', label: 'Inactive' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white/60 text-[#183624] hover:bg-white/90 border border-transparent hover:border-emerald-900/10'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main List of Reminders */}
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
          {filteredReminders.map(({ reminder, status }) => {
            const isDone = status === 'done'

            return (
              <Card
                key={reminder.id}
                variant="glass"
                className={`transition-all flex flex-col justify-between ${
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
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-[#102819] leading-snug">
                        {reminder.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">
                          {CATEGORY_LABELS[reminder.category]}
                        </Badge>
                        {renderStatusBadge(status, reminder.active)}
                      </div>
                    </div>

                    {/* Quick Menu Icons: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(reminder)}
                        aria-label={`Edit ${reminder.title}`}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-950 hover:bg-emerald-900/10 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(reminder)}
                        aria-label={`Delete ${reminder.title}`}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-900/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

                {/* Bottom Actions Row: Active toggle, Snooze & Mark Done / Undo */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(reminder.id)}
                  >
                    {reminder.active ? 'Deactivate' : 'Activate'}
                  </Button>

                  <div className="flex items-center gap-2">
                    {reminder.active && !isDone && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<BellOff className="w-3.5 h-3.5 text-slate-700" />}
                        onClick={() => setSnoozeTarget(reminder)}
                      >
                        Snooze
                      </Button>
                    )}

                    {isDone ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<RotateCcw className="w-3.5 h-3.5 text-slate-700" />}
                        onClick={() => undoCompletion(reminder.id, today)}
                      >
                        Undo Done
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

      {/* Add / Edit Dialog */}
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
          onConfirm={() => {
            if (deleteTarget) deleteReminder(deleteTarget.id)
          }}
          reminderTitle={deleteTarget.title}
        />
      )}

      {/* Snooze Presets Dialog */}
      {snoozeTarget && (
        <SnoozeDialog
          open={Boolean(snoozeTarget)}
          onClose={() => setSnoozeTarget(null)}
          onSnooze={(options) => {
            if (snoozeTarget) snoozeReminder(snoozeTarget.id, options)
          }}
          reminderTitle={snoozeTarget.title}
        />
      )}
    </div>
  )
}
