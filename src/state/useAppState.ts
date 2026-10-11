import { useContext } from 'react'
import { AppContext, type AppContextValue } from './context'

export function useAppState(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}
