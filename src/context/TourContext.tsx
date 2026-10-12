import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TourDialog } from '../components/tour/TourDialog'
import { setTourSeen } from '../lib/storage'
import { useToast } from './useToast'
import { useAppState } from '../state'
import { TourContext } from './tourCore'

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const isFirstRunRef = useRef(false)
  const { showToast } = useToast()
  const { state } = useAppState()
  const navigate = useNavigate()

  const openTour = useCallback((isFirstRun = false) => {
    isFirstRunRef.current = isFirstRun
    setIsTourOpen(true)
  }, [])

  const closeTour = useCallback(
    (action?: 'start' | 'add') => {
      setIsTourOpen(false)
      const wasFirstRun = isFirstRunRef.current
      isFirstRunRef.current = false
      setTourSeen(true)

      // On first-run completion: show Welcome greeting toast if name exists
      if (wasFirstRun) {
        const name = state.settings.displayName?.trim()
        if (name) {
          showToast(`Welcome, ${name}!`)
        }
      }

      if (action === 'add') {
        navigate('/reminders?add=true')
      }
    },
    [state.settings.displayName, showToast, navigate]
  )

  return (
    <TourContext.Provider value={{ isTourOpen, openTour, closeTour: () => closeTour('start') }}>
      {children}
      <TourDialog open={isTourOpen} onClose={closeTour} />
    </TourContext.Provider>
  )
}
