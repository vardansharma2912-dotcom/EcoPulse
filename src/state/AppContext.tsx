import React, { useReducer, useEffect } from 'react'
import type { AppState, Reminder, Settings } from '../types'
import { appReducer } from './reducer'
import { loadState, saveState, getDefaultState, setWelcomeHandled } from '../lib/storage'
import { AppContext, type AppContextValue } from './context'
import { applyTheme, subscribeToSystemScheme } from '../lib/theme'

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    return loadState() || getDefaultState()
  })

  // Sync to localStorage on every state change
  useEffect(() => {
    saveState(state)
  }, [state])

  // Synchronize theme to document element and listen to system preference changes if 'system'
  useEffect(() => {
    const currentTheme = state.settings.theme || 'light'
    applyTheme(currentTheme)

    const cleanup = subscribeToSystemScheme(
      () => state.settings.theme || 'light',
      () => {
        // live OS color scheme change handled
      }
    )
    return cleanup
  }, [state.settings.theme])

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_REMINDER', payload: reminder })
  }

  const editReminder = (reminder: Reminder) => {
    dispatch({ type: 'EDIT_REMINDER', payload: reminder })
  }

  const deleteReminder = (id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: { id } })
  }

  const toggleActive = (id: string) => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: { id } })
  }

  const completeReminder = (reminderId: string, date?: string) => {
    dispatch({ type: 'COMPLETE_REMINDER', payload: { reminderId, date } })
  }

  const undoCompletion = (reminderId: string, date?: string) => {
    dispatch({ type: 'UNDO_COMPLETION', payload: { reminderId, date } })
  }

  const snoozeReminder = (id: string, options: { minutes?: number; until?: string } | number) => {
    if (typeof options === 'number') {
      dispatch({ type: 'SNOOZE_REMINDER', payload: { id, minutes: options } })
    } else {
      dispatch({ type: 'SNOOZE_REMINDER', payload: { id, ...options } })
    }
  }

  const updateSettings = (settings: Partial<Settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }

  const resetData = () => {
    dispatch({ type: 'RESET_DATA' })
    setWelcomeHandled(false)
  }

  const replaceState = (newState: AppState) => {
    dispatch({ type: 'REPLACE_STATE', payload: newState })
    if (newState.settings.displayName) {
      setWelcomeHandled(true)
    }
  }

  const loadSampleData = () => {
    dispatch({ type: 'LOAD_SAMPLE_DATA' })
  }

  const removeSampleData = () => {
    dispatch({ type: 'REMOVE_SAMPLE_DATA' })
  }

  const value: AppContextValue = {
    state,
    dispatch,
    addReminder,
    editReminder,
    deleteReminder,
    toggleActive,
    completeReminder,
    undoCompletion,
    snoozeReminder,
    updateSettings,
    loadSampleData,
    removeSampleData,
    resetData,
    replaceState,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

