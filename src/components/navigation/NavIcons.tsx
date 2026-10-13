import React, { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export interface NavIconProps {
  className?: string
  isHovered?: boolean
  isActive?: boolean
  size?: number
  trigger?: number | boolean
  onClick?: (e?: React.MouseEvent) => void
}

/**
 * 1. Dashboard Nav Icon
 * 4 asymmetrical boxes move clockwise into the adjacent slot ONCE per click.
 * At rest and after each single shift, the overall grid looks exactly identical to LayoutDashboard.
 */
const DASHBOARD_BOX_POSITIONS = [
  { x: 3, y: 3, width: 7, height: 9 },   // Pos 0: Top-Left
  { x: 14, y: 3, width: 7, height: 5 },  // Pos 1: Top-Right
  { x: 14, y: 12, width: 7, height: 9 }, // Pos 2: Bottom-Right
  { x: 3, y: 16, width: 7, height: 5 },  // Pos 3: Bottom-Left
]

export const DashboardNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  trigger,
  onClick,
}) => {
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    if ((typeof trigger === 'number' && trigger > 0) || trigger === true) {
      setStep((s) => (s + 1) % 4)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    setStep((s) => (s + 1) % 4)
    onClick?.(e)
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      onClick={handleClick}
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
        {[0, 1, 2, 3].map((boxIndex) => {
          const pos = DASHBOARD_BOX_POSITIONS[(boxIndex + step) % 4]
          return (
            <motion.rect
              key={boxIndex}
              rx="1"
              animate={
                reducedMotion
                  ? { x: pos.x, y: pos.y, width: pos.width, height: pos.height }
                  : { x: pos.x, y: pos.y, width: pos.width, height: pos.height }
              }
              transition={{ duration: 0.45, ease: [0.34, 1.3, 0.64, 1] }}
            />
          )
        })}
      </svg>
    </span>
  )
}

/**
 * 2. Reminders Nav Icon (Bell)
 * The bell swings back and forth around its top hanger, and the clapper follows.
 * Triggers only when clicked.
 */
export const RemindersNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  trigger,
  onClick,
}) => {
  const reducedMotion = useReducedMotion()
  const [animKey, setAnimKey] = useState(0)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    if ((typeof trigger === 'number' && trigger > 0) || trigger === true) {
      setAnimKey((k) => k + 1)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    setAnimKey((k) => k + 1)
    onClick?.(e)
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      onClick={handleClick}
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
          key={`bell-${animKey}`}
          d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
          style={{ transformOrigin: '12px 3px' }}
          animate={
            animKey > 0 && !reducedMotion
              ? { rotate: [0, -22, 18, -14, 10, -5, 2, 0] }
              : { rotate: 0 }
          }
          transition={{ duration: 0.85, ease: 'easeInOut' }}
        />

        {/* The clapper below the bell swinging with follower momentum */}
        <motion.path
          key={`clapper-${animKey}`}
          d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
          style={{ transformOrigin: '12px 17px' }}
          animate={
            animKey > 0 && !reducedMotion
              ? {
                  x: [0, 3, -3, 2, -1.5, 0.8, 0],
                  rotate: [0, 24, -20, 14, -10, 5, 0],
                }
              : { x: 0, rotate: 0 }
          }
          transition={{ duration: 0.85, ease: 'easeInOut' }}
        />
      </svg>
    </span>
  )
}

/**
 * 3. Calculator Nav Icon
 * Subtle elastic punch and sequential keypad tap wave when clicked.
 */
export const CalculatorNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  trigger,
  onClick,
}) => {
  const reducedMotion = useReducedMotion()
  const [animKey, setAnimKey] = useState(0)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    if ((typeof trigger === 'number' && trigger > 0) || trigger === true) {
      setAnimKey((k) => k + 1)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    setAnimKey((k) => k + 1)
    onClick?.(e)
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      onClick={handleClick}
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
        <motion.rect
          key={`calc-frame-${animKey}`}
          x="4"
          y="2"
          width="16"
          height="20"
          rx="2"
          style={{ transformOrigin: '12px 12px' }}
          animate={
            animKey > 0 && !reducedMotion
              ? { scale: [1, 1.08, 0.96, 1.04, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />

        {/* Display Screen */}
        <line x1="8" x2="16" y1="6" y2="6" />

        {/* Grid of Keys with sequential tap wave */}
        <motion.line
          key={`calc-bar-${animKey}`}
          x1="16"
          x2="16"
          y1="14"
          y2="18"
          animate={
            animKey > 0 && !reducedMotion
              ? { opacity: [1, 0.3, 1], y: [0, 1, 0] }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.35, delay: 0.05 }}
        />
        <motion.path
          key={`k1-${animKey}`}
          d="M16 10h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.0 }}
        />
        <motion.path
          key={`k2-${animKey}`}
          d="M12 10h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />
        <motion.path
          key={`k3-${animKey}`}
          d="M8 10h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
        <motion.path
          key={`k4-${animKey}`}
          d="M12 14h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        />
        <motion.path
          key={`k5-${animKey}`}
          d="M8 14h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
        <motion.path
          key={`k6-${animKey}`}
          d="M12 18h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        />
        <motion.path
          key={`k7-${animKey}`}
          d="M8 18h.01"
          animate={animKey > 0 && !reducedMotion ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        />
      </svg>
    </span>
  )
}

/**
 * 4. Analytics Nav Icon (BarChart3)
 * Dynamic rising bar equalizer animation from bottom to top when clicked.
 */
export const AnalyticsNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  trigger,
  onClick,
}) => {
  const reducedMotion = useReducedMotion()
  const [animKey, setAnimKey] = useState(0)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    if ((typeof trigger === 'number' && trigger > 0) || trigger === true) {
      setAnimKey((k) => k + 1)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    setAnimKey((k) => k + 1)
    onClick?.(e)
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      onClick={handleClick}
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
        <path d="M3 3v18h18" />
        <motion.path
          key={`bar1-${animKey}`}
          d="M18 17V9"
          style={{ transformOrigin: 'center 17px' }}
          animate={
            animKey > 0 && !reducedMotion
              ? { scaleY: [1, 0.4, 1.25, 0.9, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.65, delay: 0.1, ease: 'easeInOut' }}
        />
        <motion.path
          key={`bar2-${animKey}`}
          d="M13 17V5"
          style={{ transformOrigin: 'center 17px' }}
          animate={
            animKey > 0 && !reducedMotion
              ? { scaleY: [1, 1.3, 0.5, 1.15, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.65, delay: 0.0, ease: 'easeInOut' }}
        />
        <motion.path
          key={`bar3-${animKey}`}
          d="M8 17v-3"
          style={{ transformOrigin: 'center 17px' }}
          animate={
            animKey > 0 && !reducedMotion
              ? { scaleY: [1, 0.3, 1.4, 0.8, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.65, delay: 0.18, ease: 'easeInOut' }}
        />
      </svg>
    </span>
  )
}

/**
 * 5. Learn Nav Icon (BookOpen)
 * The book turns its page strictly from right to left like in real books.
 * Triggers only when clicked.
 */
export const LearnNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  trigger,
  onClick,
}) => {
  const reducedMotion = useReducedMotion()
  const [flipKey, setFlipKey] = useState(0)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    if ((typeof trigger === 'number' && trigger > 0) || trigger === true) {
      setFlipKey((k) => k + 1)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    setFlipKey((k) => k + 1)
    onClick?.(e)
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      onClick={handleClick}
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

        {/* Turning Page Leaf: Turns from right to left around center spine (x: 12) */}
        {flipKey > 0 && !reducedMotion && (
          <motion.path
            key={`flip-${flipKey}`}
            d="M12 7c2-2 5-3 8-3v14c-3 0-6 1-8 3z"
            style={{ transformOrigin: '12px 14px' }}
            initial={{ scaleX: 1, opacity: 1 }}
            animate={{
              scaleX: [1, 0.05, -1, -1],
              opacity: [1, 1, 0.85, 0],
            }}
            transition={{
              duration: 0.65,
              times: [0, 0.45, 0.85, 1],
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        )}
      </svg>
    </span>
  )
}

/**
 * 6. Settings Nav Icon (Gear)
 * Smooth clockwise gear rotation centered exactly about its center (12, 12).
 * Triggers only when clicked.
 */
export const SettingsNavIcon: React.FC<NavIconProps> = ({
  className = 'w-4 h-4',
  trigger,
  onClick,
}) => {
  const reducedMotion = useReducedMotion()
  const [rotation, setRotation] = useState(0)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    if ((typeof trigger === 'number' && trigger > 0) || trigger === true) {
      setRotation((r) => r + 180)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    setRotation((r) => r + 180)
    onClick?.(e)
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      onClick={handleClick}
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
          style={{ transformOrigin: '12px 12px' }}
          animate={
            reducedMotion
              ? { rotate: 0 }
              : { rotate: rotation }
          }
          transition={{ duration: 0.65, ease: [0.34, 1.25, 0.64, 1] }}
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </motion.g>
      </svg>
    </span>
  )
}
