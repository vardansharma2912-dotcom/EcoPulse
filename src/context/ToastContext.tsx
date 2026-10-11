import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { ToastContext, type ToastItem, type ToastAction } from './toastTypes'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const toast = useCallback((message: string, options?: { action?: ToastAction; icon?: React.ReactNode }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newToast: ToastItem = {
      id,
      message,
      action: options?.action,
      icon: options?.icon,
    }

    setToasts((prev) => {
      // Keep at most 3 stacked
      const updated = [...prev, newToast]
      if (updated.length > 3) {
        const removed = updated.shift()
        if (removed) {
          const t = timersRef.current.get(removed.id)
          if (t) clearTimeout(t)
          timersRef.current.delete(removed.id)
        }
      }
      return updated
    })

    // Auto-dismiss after 2.8s
    const timer = setTimeout(() => {
      removeToast(id)
    }, 2800)
    timersRef.current.set(id, timer)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Fixed Bottom-Center Toast Stack */}
      <div
        className="fixed bottom-6 inset-x-0 z-50 flex flex-col items-center pointer-events-none gap-2 px-4"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence mode="sync">
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a381e] text-white shadow-xl shadow-emerald-950/25 border border-emerald-700/40 text-xs sm:text-sm font-semibold max-w-md"
            >
              <div className="shrink-0 text-emerald-300">
                {item.icon || <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span className="truncate">{item.message}</span>
              {item.action && (
                <button
                  type="button"
                  onClick={() => {
                    item.action?.onClick()
                    removeToast(item.id)
                  }}
                  className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {item.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
