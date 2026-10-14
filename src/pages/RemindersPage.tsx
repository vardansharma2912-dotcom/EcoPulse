import React, { useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../context/useToast'
import { useAppState } from '../state'
import { todayKey } from '../lib/dates'
import { todayStatus } from '../lib/schedule'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { DeleteConfirmDialog } from '../components/reminders/DeleteConfirmDialog'
import { SnoozeDialog } from '../components/reminders/SnoozeDialog'
import { ReminderCard } from '../components/reminders/ReminderCard'
import { CATEGORY_LABELS } from '../components/reminders/reminderUtils'
import { useGapMeasure } from '../components/filler/useGapMeasure'
import { FillerSlot } from '../components/filler/FillerSlot'
import type { Reminder } from '../types'
import {
  Bell,
  Plus,
  Search,
  Filter,
  AlertCircle,
  XCircle,
} from 'lucide-react'

type StatusFilter = 'all' | 'due' | 'overdue' | 'done' | 'snoozed' | 'inactive'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')
  const addParam = searchParams.get('add')

  const today = todayKey()

  // Dialog State
  const [internalFormOpen, setInternalFormOpen] = useState(false)
  const isFormOpen = internalFormOpen || addParam === 'true'
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)
  const [snoozeTarget, setSnoozeTarget] = useState<Reminder | null>(null)

  // Filter State
  const [internalStatusFilter, setInternalStatusFilter] = useState<StatusFilter>('all')
  const statusFilter: StatusFilter = filterParam === 'overdue' ? 'overdue' : internalStatusFilter

  const setStatusFilter = (filter: StatusFilter) => {
    if (filterParam) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('filter')
      setSearchParams(newParams, { replace: true })
    }
    setInternalStatusFilter(filter)
  }

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const [currentDate] = useState(() => new Date())

  const handleCloseForm = () => {
    setInternalFormOpen(false)
    if (addParam) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('add')
      setSearchParams(newParams, { replace: true })
    }
  }

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
        if (statusFilter === 'overdue') {
          return status === 'overdue'
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
    setInternalFormOpen(true)
  }

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setInternalFormOpen(true)
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

  // Two-column measurement refs for adaptive FillerSlot
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)

  const leftColReminders = useMemo(
    () => filteredReminders.filter((_, i) => i % 2 === 0),
    [filteredReminders]
  )
  const rightColReminders = useMemo(
    () => filteredReminders.filter((_, i) => i % 2 === 1),
    [filteredReminders]
  )

  const leftColMeasure = useGapMeasure({
    hostRef: leftColRef,
    targetRef: rightColRef,
    deps: [filteredReminders.length],
  })

  const rightColMeasure = useGapMeasure({
    hostRef: rightColRef,
    targetRef: leftColRef,
    deps: [filteredReminders.length],
  })

  return (
    <div className="space-y-4 lg:space-y-6 flex-1 flex flex-col">
      <PageHeader
        title="Energy-Saving Habits & Scheduled Reminders"
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
              id="reminders-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reminders by title..."
              aria-label="Search reminders by title"
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
                { id: 'overdue', label: 'Overdue' },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Column */}
          <div className="space-y-4 flex flex-col">
            <div ref={leftColRef} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {leftColReminders.map(({ reminder, status }) => (
                  <motion.div
                    key={reminder.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="h-full"
                  >
                    <ReminderCard
                      reminder={reminder}
                      status={status}
                      isMenuOpen={menuOpenId === reminder.id}
                      onToggleMenu={(id) => setMenuOpenId(menuOpenId === id ? null : id)}
                      onCloseMenu={() => setMenuOpenId(null)}
                      onComplete={handleComplete}
                      onUndo={handleUndo}
                      onOpenEdit={handleOpenEdit}
                      onOpenSnooze={(r) => setSnoozeTarget(r)}
                      onToggleActive={handleToggleActive}
                      onOpenDelete={(r) => setDeleteTarget(r)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block pt-1">
              <FillerSlot page="reminders" gap={leftColMeasure.gap} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 flex flex-col">
            <div ref={rightColRef} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {rightColReminders.map(({ reminder, status }) => (
                  <motion.div
                    key={reminder.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="h-full"
                  >
                    <ReminderCard
                      reminder={reminder}
                      status={status}
                      isMenuOpen={menuOpenId === reminder.id}
                      onToggleMenu={(id) => setMenuOpenId(menuOpenId === id ? null : id)}
                      onCloseMenu={() => setMenuOpenId(null)}
                      onComplete={handleComplete}
                      onUndo={handleUndo}
                      onOpenEdit={handleOpenEdit}
                      onOpenSnooze={(r) => setSnoozeTarget(r)}
                      onToggleActive={handleToggleActive}
                      onOpenDelete={(r) => setDeleteTarget(r)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block pt-1">
              <FillerSlot page="reminders" gap={rightColMeasure.gap} />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Drawer */}
      <ReminderFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
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
