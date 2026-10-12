import { useEffect } from 'react'

/**
 * Custom hook to update document.title per route.
 * E.g., useDocumentTitle('Dashboard') sets "Dashboard · EcoPulse".
 */
export function useDocumentTitle(pageTitle?: string): void {
  useEffect(() => {
    if (typeof document === 'undefined') return

    if (!pageTitle || pageTitle === 'EcoPulse') {
      document.title = 'EcoPulse - Smart Energy Saving Reminder'
    } else {
      document.title = `${pageTitle} · EcoPulse`
    }
  }, [pageTitle])
}
