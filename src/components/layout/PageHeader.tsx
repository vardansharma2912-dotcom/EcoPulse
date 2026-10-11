import React from 'react'
import { motion, useReducedMotion } from 'motion/react'

export interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  badge?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  badge,
}) => {
  const prefersReduced = useReducedMotion()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-emerald-900/10">
      <div>
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Page title reveals left-to-right (clip-path inset(0 100% 0 0) to inset(0 0 0 0), 450ms) */}
          <motion.h1
            initial={prefersReduced ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#14301f]"
          >
            {title}
          </motion.h1>
          {badge}
        </div>
        {/* Subtitle fades in 150ms later */}
        {description && (
          <motion.p
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: prefersReduced ? 0 : 0.15, ease: 'easeOut' }}
            className="text-sm text-slate-700 mt-1 font-normal leading-relaxed"
          >
            {description}
          </motion.p>
        )}
      </div>
      {/* Header action buttons slide in after */}
      {action && (
        <motion.div
          initial={prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: prefersReduced ? 0 : 0.25, ease: 'easeOut' }}
          className="flex items-center gap-2.5 shrink-0"
        >
          {action}
        </motion.div>
      )}
    </div>
  )
}
