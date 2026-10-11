import React, { useState } from 'react'
import { Drawer } from '../ui/Drawer'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Reminder, ReminderCategory, RecurrenceType } from '../../types'

const CATEGORY_OPTIONS: { value: ReminderCategory; label: string }[] = [
  { value: 'lighting', label: 'Lighting' },
  { value: 'cooling', label: 'Cooling (Fans, AC)' },
  { value: 'chargers', label: 'Chargers & Adapters' },
  { value: 'computing', label: 'Computers & Laptops' },
  { value: 'standby', label: 'Standby & Entertainment' },
  { value: 'shared', label: 'Shared spaces / Corridors' },
  { value: 'other', label: 'Other appliances' },
]

const DAYS_OF_WEEK = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
]

interface FormContentProps {
  initialReminder?: Reminder | null
  onSave: (reminderData: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => void
  onClose: () => void
}

const ReminderFormContent: React.FC<FormContentProps> = ({
  initialReminder,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialReminder)

  const [title, setTitle] = useState(initialReminder ? initialReminder.title : '')
  const [category, setCategory] = useState<ReminderCategory>(
    initialReminder ? initialReminder.category : 'lighting'
  )
  const [time, setTime] = useState(initialReminder ? initialReminder.time : '09:00')
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    initialReminder ? initialReminder.recurrence : 'daily'
  )
  const [days, setDays] = useState<number[]>(
    initialReminder?.days || [1, 2, 3, 4, 5]
  )
  const [watts, setWatts] = useState<string>(
    initialReminder?.applianceWatts !== undefined ? String(initialReminder.applianceWatts) : ''
  )
  const [hours, setHours] = useState<string>(
    initialReminder?.avoidedHours !== undefined ? String(initialReminder.avoidedHours) : ''
  )
  const [active, setActive] = useState<boolean>(
    initialReminder ? initialReminder.active : true
  )

  const [errors, setErrors] = useState<{
    title?: string
    time?: string
    days?: string
    watts?: string
    hours?: string
  }>({})

  const toggleDay = (dayIndex: number) => {
    if (days.includes(dayIndex)) {
      setDays(days.filter((d) => d !== dayIndex))
    } else {
      setDays([...days, dayIndex].sort())
    }
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      newErrors.title = 'Title is required'
    } else if (trimmedTitle.length > 80) {
      newErrors.title = 'Title must be 80 characters or fewer'
    }

    if (!time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      newErrors.time = 'Valid time in 24-hour format (HH:mm) is required'
    }

    if (recurrence === 'weekly' && days.length === 0) {
      newErrors.days = 'Select at least one day for weekly recurrence'
    }

    if (watts.trim() !== '') {
      const numWatts = parseFloat(watts)
      if (isNaN(numWatts) || numWatts < 0 || numWatts > 10000) {
        newErrors.watts = 'Appliance wattage must be between 0 and 10,000 Watts'
      }
    }

    if (hours.trim() !== '') {
      const numHours = parseFloat(hours)
      if (isNaN(numHours) || numHours < 0 || numHours > 24) {
        newErrors.hours = 'Avoided hours must be between 0 and 24 hours'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const parsedWatts = watts.trim() !== '' ? parseFloat(watts) : undefined
    const parsedHours = hours.trim() !== '' ? parseFloat(hours) : undefined

    if (isEditing && initialReminder) {
      onSave({
        ...initialReminder,
        title: title.trim(),
        category,
        time,
        recurrence,
        days: recurrence === 'weekly' ? days : undefined,
        applianceWatts: parsedWatts,
        avoidedHours: parsedHours,
        active,
      })
    } else {
      onSave({
        title: title.trim(),
        category,
        time,
        recurrence,
        days: recurrence === 'weekly' ? days : undefined,
        applianceWatts: parsedWatts,
        avoidedHours: parsedHours,
        active,
      })
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Title */}
      <Input
        label="Reminder Title *"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
        }}
        placeholder="e.g. Turn off classroom projector"
        error={errors.title}
        hint={`${title.length}/80 characters`}
        autoFocus
      />

      {/* Category & Recurrence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label htmlFor="reminder-category" className="block text-xs font-semibold text-[#14301f]">
            Category
          </label>
          <select
            id="reminder-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ReminderCategory)}
            className="w-full rounded-lg bg-white/95 border border-emerald-950/20 px-3 py-2 text-sm text-[#14301f] focus-visible:outline-2 focus-visible:outline-emerald-800"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reminder-time" className="block text-xs font-semibold text-[#14301f]">
            Reminder Time (24h) *
          </label>
          <input
            id="reminder-time"
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value)
              if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }))
            }}
            className="w-full rounded-lg bg-white/95 border border-emerald-950/20 px-3 py-2 text-sm text-[#14301f] focus-visible:outline-2 focus-visible:outline-emerald-800 font-mono"
          />
          {errors.time && <p className="text-xs text-rose-700 font-medium">{errors.time}</p>}
        </div>
      </div>

      {/* Recurrence selection */}
      <div className="space-y-1.5">
        <label htmlFor="reminder-recurrence" className="block text-xs font-semibold text-[#14301f]">
          Schedule Recurrence
        </label>
        <select
          id="reminder-recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
          className="w-full rounded-lg bg-white/95 border border-emerald-950/20 px-3 py-2 text-sm text-[#14301f] focus-visible:outline-2 focus-visible:outline-emerald-800"
        >
          <option value="daily">Daily (Every day)</option>
          <option value="weekdays">Weekdays (Mon – Fri)</option>
          <option value="weekly">Weekly (Selected days)</option>
          <option value="once">Once (Created day only)</option>
        </select>
      </div>

      {/* Weekly Day Selector */}
      {recurrence === 'weekly' && (
        <div className="space-y-1.5 p-3 rounded-xl bg-white/60 border border-emerald-900/15">
          <span className="block text-xs font-semibold text-[#14301f]">Active Days of Week *</span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DAYS_OF_WEEK.map(({ day, label }) => {
              const isSelected = days.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white/80 text-slate-700 border border-slate-300 hover:bg-white'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {errors.days && <p className="text-xs text-rose-700 font-medium">{errors.days}</p>}
        </div>
      )}

      {/* Energy Estimates (Watts & Hours) */}
      <div className="p-3.5 rounded-xl bg-white/70 border border-emerald-900/15 space-y-3">
        <p className="text-xs font-bold text-[#14301f] uppercase tracking-wide">
          Energy Estimation (Optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Appliance Rating (Watts)"
            type="number"
            step="1"
            min="0"
            max="10000"
            value={watts}
            onChange={(e) => {
              setWatts(e.target.value)
              if (errors.watts) setErrors((prev) => ({ ...prev, watts: undefined }))
            }}
            placeholder="e.g. 60"
            error={errors.watts}
            hint="Typical: LED 10-40W, Fan 75W, AC 1500W"
          />

          <Input
            label="Avoided Usage (Hours)"
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value)
              if (errors.hours) setErrors((prev) => ({ ...prev, hours: undefined }))
            }}
            placeholder="e.g. 3"
            error={errors.hours}
            hint="Hours the device stays off per action"
          />
        </div>
      </div>

      {/* Active status checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="reminder-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-slate-300 cursor-pointer"
        />
        <label htmlFor="reminder-active" className="text-xs font-semibold text-[#14301f] cursor-pointer">
          Reminder is active and scheduled
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-950/10">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          {isEditing ? 'Save Changes' : 'Create Reminder'}
        </Button>
      </div>
    </form>
  )
}

export interface ReminderFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (reminderData: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => void
  initialReminder?: Reminder | null
}

export const ReminderFormDialog: React.FC<ReminderFormDialogProps> = ({
  open,
  onClose,
  onSave,
  initialReminder,
}) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={initialReminder ? 'Edit Energy Reminder' : 'Create New Energy Reminder'}
      description="Set a schedule to turn off, unplug, or power down devices to save campus energy."
    >
      {open && (
        <ReminderFormContent
          key={initialReminder ? initialReminder.id : 'new-reminder'}
          initialReminder={initialReminder}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Drawer>
  )
}
