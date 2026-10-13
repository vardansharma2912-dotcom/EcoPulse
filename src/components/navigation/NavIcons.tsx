import React, { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export interface NavIconProps {
  className?: string
  isHovered?: boolean
  isActive?: boolean
  size?: number
}

/**
 * 1. Dashboard Nav Icon
 * 4 asymmetrical boxes move clockwise and morph into the size of the box at their new location.
 * The overall layout remains identical before and after the animation.
 */
export const DashboardNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  isHovered = false,
  isActive = false,
}) => {
  const reducedMotion = useReducedMotion()
  const [internalTrigger, setInternalTrigger] = useState(0)
  const triggered = isHovered || internalTrigger > 0

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setInternalTrigger((p) => p + 1)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Box 1 (top-left): starts (3,3,7,9), moves clockwise to top-right (14,3,7,5) */}
        <motion.rect
          rx="1"
          animate={
            triggered && !reducedMotion
              ? {
                  x: [3, 14, 14, 3, 3],
                  y: [3, 3, 12, 16, 3],
                  width: [7, 7, 7, 7, 7],
                  height: [9, 5, 9, 5, 9],
                }
              : { x: 3, y: 3, width: 7, height: 9 }
          }
          transition={{ duration: 0.9, ease: [0.34, 1.3, 0.64, 1] }}
        />

        {/* Box 2 (top-right): starts (14,3,7,5), moves clockwise to bottom-right (14,12,7,9) */}
        <motion.rect
          rx="1"
          animate={
            triggered && !reducedMotion
              ? {
                  x: [14, 14, 3, 3, 14],
                  y: [3, 12, 16, 3, 3],
                  width: [7, 7, 7, 7, 7],
                  height: [5, 9, 5, 9, 5],
                }
              : { x: 14, y: 3, width: 7, height: 5 }
          }
          transition={{ duration: 0.9, ease: [0.34, 1.3, 0.64, 1] }}
        />

        {/* Box 3 (bottom-right): starts (14,12,7,9), moves clockwise to bottom-left (3,16,7,5) */}
        <motion.rect
          rx="1"
          animate={
            triggered && !reducedMotion
              ? {
                  x: [14, 3, 3, 14, 14],
                  y: [12, 16, 3, 3, 12],
                  width: [7, 7, 7, 7, 7],
                  height: [9, 5, 9, 5, 9],
                }
              : { x: 14, y: 12, width: 7, height: 9 }
          }
          transition={{ duration: 0.9, ease: [0.34, 1.3, 0.64, 1] }}
        />

        {/* Box 4 (bottom-left): starts (3,16,7,5), moves clockwise to top-left (3,3,7,9) */}
        <motion.rect
          rx="1"
          animate={
            triggered && !reducedMotion
              ? {
                  x: [3, 3, 14, 14, 3],
                  y: [16, 3, 3, 12, 16],
                  width: [7, 7, 7, 7, 7],
                  height: [5, 9, 5, 9, 5],
                }
              : { x: 3, y: 16, width: 7, height: 5 }
          }
          transition={{ duration: 0.9, ease: [0.34, 1.3, 0.64, 1] }}
        />
      </svg>
    </span>
  )
}

/**
 * 2. Reminders Nav Icon (Bell)
 * The bell swings back and forth around its top hanger,
 * and the ball (clapper) below the bell swings in dynamic follower motion.
 */
export const RemindersNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  isHovered = false,
}) => {
  const reducedMotion = useReducedMotion()
  const [internalTrigger, setInternalTrigger] = useState(0)
  const triggered = isHovered || internalTrigger > 0

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setInternalTrigger((p) => p + 1)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Bell Body swinging around top anchor (x: 12, y: 3) */}
        <motion.path
          d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
          style={{ originX: '12px', originY: '3px' }}
          animate={
            triggered && !reducedMotion
              ? {
                  rotate: [0, -22, 18, -14, 10, -5, 2, 0],
                }
              : { rotate: 0 }
          }
          transition={{ duration: 0.95, ease: 'easeInOut' }}
        />

        {/* The ball / clapper below the bell swinging with energetic momentum */}
        <motion.path
          d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
          style={{ originX: '12px', originY: '17px' }}
          animate={
            triggered && !reducedMotion
              ? {
                  x: [0, 3.2, -3.2, 2.2, -1.8, 1, 0],
                  rotate: [0, 26, -22, 16, -12, 6, 0],
                }
              : { x: 0, rotate: 0 }
          }
          transition={{ duration: 0.95, ease: 'easeInOut' }}
        />
      </svg>
    </span>
  )
}

/**
 * 3. Calculator Nav Icon
 * Subtle energetic button press ripple and screen shimmer.
 */
export const CalculatorNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  isHovered = false,
}) => {
  const reducedMotion = useReducedMotion()
  const [internalTrigger, setInternalTrigger] = useState(0)
  const triggered = isHovered || internalTrigger > 0

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setInternalTrigger((p) => p + 1)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Calculator Outer Frame with quick elastic punch */}
        <motion.rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="2"
          animate={
            triggered && !reducedMotion
              ? { scale: [1, 1.08, 0.96, 1.04, 1] }
              : { scale: 1 }
          }
          style={{ originX: '12px', originY: '12px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Display Screen */}
        <line x1="8" x2="16" y1="6" y2="6" />

        {/* Grid of 6 Keys with sequential tap wave */}
        <motion.line
          x1="16"
          x2="16"
          y1="14"
          y2="18"
          animate={
            triggered && !reducedMotion
              ? { opacity: [1, 0.3, 1], y: [0, 1, 0] }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.35, delay: 0.05 }}
        />
        <motion.path
          d="M16 10h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.0 }}
        />
        <motion.path
          d="M12 10h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.05 }}
        />
        <motion.path
          d="M8 10h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.1 }}
        />
        <motion.path
          d="M12 14h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.15 }}
        />
        <motion.path
          d="M8 14h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.2 }}
        />
        <motion.path
          d="M12 18h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.25 }}
        />
        <motion.path
          d="M8 18h.01"
          animate={
            triggered && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.3, delay: 0.3 }}
        />
      </svg>
    </span>
  )
}

/**
 * 4. Analytics Nav Icon (BarChart3)
 * Dynamic rising bar equalizer animation from bottom to top.
 */
export const AnalyticsNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  isHovered = false,
}) => {
  const reducedMotion = useReducedMotion()
  const [internalTrigger, setInternalTrigger] = useState(0)
  const triggered = isHovered || internalTrigger > 0

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setInternalTrigger((p) => p + 1)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Baseline Axis */}
        <path d="M3 3v18h18" />

        {/* Bar 1 (Left) */}
        <motion.path
          d="M18 17V9"
          style={{ originY: '20px' }}
          animate={
            triggered && !reducedMotion
              ? { scaleY: [1, 0.4, 1.25, 0.9, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeInOut' }}
        />

        {/* Bar 2 (Center) */}
        <motion.path
          d="M13 17V5"
          style={{ originY: '20px' }}
          animate={
            triggered && !reducedMotion
              ? { scaleY: [1, 1.3, 0.5, 1.15, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.7, delay: 0.0, ease: 'easeInOut' }}
        />

        {/* Bar 3 (Right) */}
        <motion.path
          d="M8 17v-3"
          style={{ originY: '20px' }}
          animate={
            triggered && !reducedMotion
              ? { scaleY: [1, 0.3, 1.4, 0.8, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.7, delay: 0.18, ease: 'easeInOut' }}
        />
      </svg>
    </span>
  )
}

/**
 * 5. Learn Nav Icon (BookOpen)
 * The book turns its page smoothly from right to left across the central spine.
 */
export const LearnNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  isHovered = false,
}) => {
  const reducedMotion = useReducedMotion()
  const [internalTrigger, setInternalTrigger] = useState(0)
  const triggered = isHovered || internalTrigger > 0

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setInternalTrigger((p) => p + 1)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Left Book Page Base */}
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />

        {/* Right Book Page Base */}
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />

        {/* Animated Turning Page Leaf (Turns from right to left around center spine x: 12) */}
        <motion.path
          d="M12 7c2-2 5-3 8-3v14c-3 0-6 1-8 3z"
          style={{ originX: '12px', originY: '14px' }}
          animate={
            triggered && !reducedMotion
              ? {
                  scaleX: [1, 0.05, -1, 1],
                  opacity: [1, 0.8, 0.95, 1],
                }
              : { scaleX: 1, opacity: 1 }
          }
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
    </span>
  )
}

/**
 * 6. Settings Nav Icon (Gear)
 * Smooth clockwise gear rotation with mechanical ease.
 */
export const SettingsNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  isHovered = false,
}) => {
  const reducedMotion = useReducedMotion()
  const [internalTrigger, setInternalTrigger] = useState(0)
  const triggered = isHovered || internalTrigger > 0

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setInternalTrigger((p) => p + 1)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <motion.g
          style={{ originX: '12px', originY: '12px' }}
          animate={
            triggered && !reducedMotion
              ? { rotate: [0, 180] }
              : { rotate: 0 }
          }
          transition={{ duration: 0.75, ease: [0.34, 1.25, 0.64, 1] }}
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </motion.g>
      </svg>
    </span>
  )
}
