import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppState } from '../state'
import { dueAlerts, getAlertKey } from './alerts'
import { todayKey } from './dates'
import { sendBrowserNotification } from './notifications'
import type { Reminder } from '../types'

const ALERTED_KEYS_STORAGE = 'ecopulse_alerted_keys_v1'

function loadAlertedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(ALERTED_KEYS_STORAGE)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed) : new Set()
  } catch {
    return new Set()
  }
}

function saveAlertedKeys(keys: Set<string>): void {
  try {
    localStorage.setItem(ALERTED_KEYS_STORAGE, JSON.stringify(Array.from(keys)))
  } catch {
    // Ignore storage quota errors
  }
}

export function useReminderAlerts() {
  const { state, completeReminder, snoozeReminder, updateSettings } = useAppState()
  const [activeAlerts, setActiveAlerts] = useState<Reminder[]>([])
  const alertedKeysRef = useRef<Set<string>>(loadAlertedKeys())

  // Auto-sync notificationsEnabled if browser permission was granted directly in the browser
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      state.settings.notificationsEnabled === false
    ) {
      updateSettings({ notificationsEnabled: true })
    }
  }, [state.settings.notificationsEnabled, updateSettings])

  // Fire native browser notification if granted and enabled
  const triggerBrowserNotification = useCallback((reminder: Reminder) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      state.settings.notificationsEnabled !== false
    ) {
      sendBrowserNotification(reminder.title, {
        body: `Scheduled for ${reminder.time}. Remember to turn off or unplug your appliance!`,
        tag: `ecopulse-reminder-${reminder.id}`,
        onClick: () => {
          try {
            window.focus()
          } catch {
            // Ignore focus error
          }
        },
      })
    }
  }, [state.settings.notificationsEnabled])

  // Periodic check function
  const checkDueReminders = useCallback(() => {
    const now = new Date()
    const today = todayKey(now)
    const due = dueAlerts(state.reminders, state.completions, now, alertedKeysRef.current)

    if (due.length > 0) {
      const newAlerted = new Set(alertedKeysRef.current)
      for (const r of due) {
        newAlerted.add(getAlertKey(r, today))
        triggerBrowserNotification(r)
      }
      alertedKeysRef.current = newAlerted
      saveAlertedKeys(newAlerted)

      setActiveAlerts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const uniqueIncoming = due.filter((d) => !existingIds.has(d.id))
        return [...prev, ...uniqueIncoming]
      })
    }
  }, [state.reminders, state.completions, triggerBrowserNotification])

  // Interval check every 30 seconds
  useEffect(() => {
    checkDueReminders()
    const interval = setInterval(checkDueReminders, 30000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDueReminders()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkDueReminders])

  // Handlers for in-app alert actions
  const dismissAlert = (reminderId: string) => {
    setActiveAlerts((prev) => prev.filter((r) => r.id !== reminderId))
  }

  const markAlertDone = (reminder: Reminder) => {
    completeReminder(reminder.id, todayKey())
    dismissAlert(reminder.id)
  }

  const snoozeAlert = (reminder: Reminder, minutes: number = 15) => {
    snoozeReminder(reminder.id, minutes)
    dismissAlert(reminder.id)
  }

  return {
    activeAlerts,
    dismissAlert,
    markAlertDone,
    snoozeAlert,
  }
}
