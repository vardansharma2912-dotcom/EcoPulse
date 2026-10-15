import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null

      // Auto-focus first interactive element inside dialog if not already focused
      const timer = window.setTimeout(() => {
        if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
          const focusables = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0)

          if (focusables.length > 0) {
            focusables[0].focus()
          }
        }
      }, 50)

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        } else if (e.key === 'Tab') {
          if (!dialogRef.current) return
          const focusables = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0)

          if (focusables.length === 0) return
          const first = focusables[0]
          const last = focusables[focusables.length - 1]

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault()
              last.focus()
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
          }
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      document.body.setAttribute('data-modal-open', 'true')

      return () => {
        window.clearTimeout(timer)
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        document.body.removeAttribute('data-modal-open')
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          try {
            previousActiveElement.current.focus()
          } catch {}
        }
      }
    }
  }, [open, onClose])

  if (typeof document === 'undefined') {
    return null
  }

  const dialogMotionProps = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 32 },
      }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a381e]/40 dark:bg-black/60 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          {/* Dialog Container: centered, max-height 90dvh with inner scroll */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            tabIndex={-1}
            {...dialogMotionProps}
            className="relative z-10 w-full max-w-lg max-h-[90dvh] flex flex-col rounded-2xl glass-strong text-[var(--text-primary)] border border-white/80 dark:border-white/15 p-0 shadow-2xl overflow-hidden my-auto focus:outline-none"
          >
            <div className="p-4 sm:p-6 flex flex-col max-h-[90dvh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4">
                <div>
                  <h2 id="dialog-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed font-medium">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-slate-700 dark:text-[#9db8a6] hover:text-emerald-950 dark:hover:text-[#e8f5ec] hover:bg-emerald-900/10 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 text-[var(--text-primary)]">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
