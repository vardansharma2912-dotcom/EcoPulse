export type RecurrenceType = 'once' | 'daily' | 'weekdays' | 'weekly'

export type ReminderCategory = 
  | 'lighting' 
  | 'cooling' 
  | 'chargers'
  | 'computing' 
  | 'appliances' 
  | 'standby' 
  | 'shared'
  | 'other'

export interface Reminder {
  id: string
  title: string
  category: ReminderCategory
  time: string // Format "HH:mm" (24-hour)
  recurrence: RecurrenceType
  days?: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (for weekly recurrence)
  applianceWatts?: number // Rated watts of the appliance
  avoidedHours?: number // Estimated hours of usage avoided by acting on the reminder
  active: boolean
  snoozedUntil?: string // ISO timestamp if snoozed
  createdAt: string // ISO timestamp
}

export interface Completion {
  id: string
  reminderId: string
  title: string // Snapshot of the reminder title at completion time
  date: string // Local date "YYYY-MM-DD"
  completedAt: string // ISO timestamp
  kWh: number
  costSaved: number
  tariffAtTime: number
  isDemo?: boolean // Flag indicating sample/demo data
}

export interface Settings {
  displayName: string
  tariffPerKwh: number // Default 8, currency ₹
  notificationsEnabled: boolean
}

export interface AppState {
  reminders: Reminder[]
  completions: Completion[]
  settings: Settings
  lastUpdated: string
}
