import { createContext, type ReactNode } from 'react'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  message: string
  action?: ToastAction
  icon?: ReactNode
}

export interface ToastContextType {
  toast: (message: string, options?: { action?: ToastAction; icon?: ReactNode }) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)
