import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ToastContext, type ToastItem } from './toastCore'

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

  const showToast = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastItem = { id, message, action }

      setToasts((prev) => {
        const next = [...prev, newToast]
        // Cap to maximum 3 stacked toasts
        if (next.length > 3) {
          const removed = next.shift()
          if (removed) {
            const timer = timersRef.current.get(removed.id)
            if (timer) clearTimeout(timer)
            timersRef.current.delete(removed.id)
          }
        }
        return next
      })

      const timer = setTimeout(() => {
        removeToast(id)
      }, 2800)

      timersRef.current.set(id, timer)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Bottom-Center Fixed Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4"
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a381e] text-white text-xs sm:text-sm font-semibold shadow-xl border border-emerald-500/20 max-w-md"
            >
              <span className="truncate">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick()
                    removeToast(toast.id)
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
