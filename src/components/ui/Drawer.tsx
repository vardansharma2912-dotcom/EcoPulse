import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  description,
  children,
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus()
      }
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop with Fade and Blur(2px) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-emerald-950/35 backdrop-blur-[2px]"
          />

          {/* Right Sliding Drawer Panel */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="relative w-full max-w-md h-full glass-panel shadow-2xl border-l border-white/80 p-6 flex flex-col justify-between overflow-y-auto z-10"
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-900/10 mb-5">
                <div>
                  <h2 id="drawer-title" className="text-lg font-bold text-[#14301f] tracking-tight">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-xs text-[#1e3f2b] mt-1 leading-relaxed font-medium">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="p-1.5 rounded-lg text-slate-700 hover:text-emerald-950 hover:bg-emerald-900/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Staggered Content Container */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.1,
                    },
                  },
                }}
                className="space-y-4"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
