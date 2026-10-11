import React, { createContext } from 'react'
import type { AppState, Reminder, Settings } from '../types'
import type { AppAction } from './reducer'

export interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void
  editReminder: (reminder: Reminder) => void
  deleteReminder: (id: string) => void
  toggleActive: (id: string) => void
  completeReminder: (reminderId: string, date?: string) => void
  undoCompletion: (reminderId: string, date?: string) => void
  snoozeReminder: (id: string, options: { minutes?: number; until?: string } | number) => void
  updateSettings: (settings: Partial<Settings>) => void
  resetData: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)
