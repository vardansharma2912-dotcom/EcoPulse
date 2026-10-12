import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

/**
 * Drawer
 * Responsive drawer component:
 * - Desktop (>= 1024px): Right drawer sliding in from x: 100%
 * - Mobile / Tablet (< 1024px): Bottom sheet sliding in from y: 100%, rounded-t-3xl, max-h-[90dvh], drag handle
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  description,
  children,
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  })

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      // Lock body scroll & signal modal state for NotchDock
      document.body.style.overflow = 'hidden'
      document.body.setAttribute('data-modal-open', 'true')

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        document.body.removeAttribute('data-modal-open')
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus()
        }
      }
    }
  }, [open, onClose])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-50 flex ${
            isDesktop ? 'justify-end' : 'items-end justify-center'
          }`}
        >
          {/* Backdrop with fade and blur(2px) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a381e]/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Panel: Bottom sheet (<1024px) or Right drawer (>=1024px) */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={isDesktop ? { x: '100%' } : { y: '100%' }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: '100%' } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className={`relative z-10 w-full glass-strong shadow-2xl flex flex-col ${
              isDesktop
                ? 'sm:w-[480px] md:w-[520px] max-w-full h-full border-l border-white/80 overflow-y-auto'
                : 'rounded-t-3xl max-h-[90dvh] border-t border-white/80 overflow-hidden'
            }`}
          >
            {/* Mobile Drag Handle */}
            {!isDesktop && (
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-12 h-1.5 bg-emerald-950/25 rounded-full" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 border-b border-emerald-900/10 shrink-0">
              <div>
                <h2 id="drawer-title" className="text-base sm:text-lg font-bold text-[#14301f] tracking-tight">
                  {title}
                </h2>
                {description && (
                  <p className="text-xs text-[#1e3f2b] mt-0.5 leading-relaxed font-medium">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 hover:text-emerald-950 hover:bg-emerald-900/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content with staggered entrance and inner scroll on mobile */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
              className="p-5 sm:p-6 flex-1 text-[#14301f] overflow-y-auto"
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
