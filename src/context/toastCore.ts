import { createContext } from 'react'

export interface ToastItem {
  id: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastContextValue {
  showToast: (message: string, action?: { label: string; onClick: () => void }) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
