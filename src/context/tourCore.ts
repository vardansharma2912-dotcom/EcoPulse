import { createContext } from 'react'

export interface TourContextValue {
  isTourOpen: boolean
  openTour: (isFirstRun?: boolean) => void
  closeTour: () => void
}

export const TourContext = createContext<TourContextValue | null>(null)
