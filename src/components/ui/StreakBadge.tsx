import React, { useState, useEffect, useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Lock } from 'lucide-react'
import {
  getStreakTier,
  getProgressToNext,
  getDaysToNext,
  STREAK_TIERS,
} from '../../lib/streakTiers'

export interface StreakBadgeProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showProgress?: boolean
  showDaysCount?: boolean
  compact?: boolean
  className?: string
  interactive?: boolean
  isLocked?: boolean
  animated?: boolean
  celebrate?: boolean
}

const PARTICLES = [
  { id: 0, x: -10, y: -12, delay: 0.1, size: 3.5 },
  { id: 1, x: 12, y: -14, delay: 0.35, size: 4 },
  { id: 2, x: -14, y: 6, delay: 0.6, size: 3 },
  { id: 3, x: 14, y: 8, delay: 0.2, size: 4.5 },
  { id: 4, x: -6, y: -20, delay: 0.75, size: 3 },
  { id: 5, x: 8, y: -22, delay: 0.45, size: 3.5 },
]

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  days,
  size = 'md',
  showLabel = true,
  showProgress = false,
  showDaysCount = true,
  compact = false,
  className = '',
  isLocked = false,
  animated = true,
  celebrate = false,
}) => {
  const reducedMotion = useReducedMotion()
  const gradientId = useId()

  const tier = getStreakTier(days)
  const progress = getProgressToNext(days)
  const daysToNext = getDaysToNext(days)
  const nextTierIndex = STREAK_TIERS.findIndex((t) => t.id === tier.id) + 1
  const nextTier = nextTierIndex < STREAK_TIERS.length ? STREAK_TIERS[nextTierIndex] : null

  // Tab visibility tracking to pause animations when hidden
  const [isVisible, setIsVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  )

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Size styling maps: horizontally elongated pill container
  const iconDimensions = {
    sm: { width: 22, height: 18, box: 'w-10 h-7', lockSize: 13 },
    md: { width: 28, height: 24, box: 'w-13 h-9', lockSize: 16 },
    lg: { width: 40, height: 34, box: 'w-18 h-13', lockSize: 22 },
  }[size]

  const textStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size]

  // Achieved streak levels are animated; locked tiers remain static
  const canAnimate = isVisible && !reducedMotion && animated && !isLocked

  // Real organic fire animation: base-anchored flame physics matching fire.mp4 with thermal updraft, wave skew, sway, and lick (zero jumping)
  const getFlameAnimation = () => {
    if (!canAnimate) return {}

    if (tier.id === 'dormant') {
      return {
        transformOrigin: '12.5px 20.5px',
        rotate: [0, -1.5, 1.8, -1.0, 1.2, -0.6, 0],
        skewX: [0, -1.8, 2.0, -1.2, 1.5, -0.8, 0],
        scaleY: [1, 1.05, 0.97, 1.06, 0.98, 1.03, 1],
        scaleX: [1, 0.98, 1.02, 0.97, 1.01, 0.99, 1],
        filter: [
          `drop-shadow(0 -1px 3px ${tier.colors.primary}33)`,
          `drop-shadow(0 -2px 6px ${tier.colors.primary}66)`,
          `drop-shadow(0 -1px 3px ${tier.colors.primary}33)`,
        ],
        transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'spark' || tier.animation === 'subtle') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -3.2, 3.5, -2.5, 3.0, -1.5, 0],
        skewX: [0, -3.8, 4.0, -2.8, 3.2, -1.6, 0],
        scaleY: [1, 1.08, 0.96, 1.10, 0.97, 1.04, 1],
        scaleX: [1, 0.95, 1.03, 0.93, 1.02, 0.98, 1],
        filter: [
          `drop-shadow(0 -1px 3px ${tier.colors.primary}55)`,
          `drop-shadow(0 -3px 8px ${tier.colors.primary}bb)`,
          `drop-shadow(0 -2px 4px ${tier.colors.primary}77)`,
          `drop-shadow(0 -4px 10px ${tier.colors.primary}cc)`,
          `drop-shadow(0 -1px 3px ${tier.colors.primary}55)`,
        ],
        transition: { duration: 1.9, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'flame' || tier.animation === 'flame') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -4.5, 5.2, -3.8, 4.5, -2.0, 0],
        skewX: [0, -5.2, 5.8, -4.2, 4.8, -2.2, 0],
        scaleY: [1, 1.12, 0.94, 1.15, 0.96, 1.06, 1],
        scaleX: [1, 0.93, 1.04, 0.91, 1.03, 0.97, 1],
        filter: [
          `drop-shadow(0 -2px 5px ${tier.colors.primary}88)`,
          `drop-shadow(0 -4px 14px ${tier.colors.secondary}ee)`,
          `drop-shadow(0 -3px 7px ${tier.colors.primary}aa)`,
          `drop-shadow(0 -5px 16px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 -2px 5px ${tier.colors.primary}88)`,
        ],
        transition: { duration: 1.7, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'blaze' || tier.animation === 'blaze') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -5.5, 5.8, -4.5, 5.2, -2.5, 0],
        skewX: [0, -6.2, 6.5, -5.0, 5.5, -2.8, 0],
        scaleY: [1, 1.16, 0.92, 1.19, 0.94, 1.08, 1],
        scaleX: [1, 0.90, 1.05, 0.88, 1.04, 0.96, 1],
        filter: [
          `drop-shadow(0 -2px 6px ${tier.colors.primary}99)`,
          `drop-shadow(0 -5px 18px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 -3px 8px ${tier.colors.primary}bb)`,
          `drop-shadow(0 -6px 22px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 -2px 6px ${tier.colors.primary}99)`,
        ],
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'inferno' || tier.animation === 'inferno') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -6.5, 6.5, -5.2, 6.0, -3.0, 0],
        skewX: [0, -7.5, 7.2, -6.0, 6.8, -3.5, 0],
        scaleY: [1, 1.20, 0.89, 1.24, 0.92, 1.10, 1],
        scaleX: [1, 0.88, 1.07, 0.86, 1.05, 0.94, 1],
        filter: [
          `drop-shadow(0 -3px 8px ${tier.colors.primary}bb)`,
          `drop-shadow(0 -6px 24px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 -4px 10px ${tier.colors.primary}dd)`,
          `drop-shadow(0 -7px 28px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 -3px 8px ${tier.colors.primary}bb)`,
        ],
        transition: { duration: 1.15, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'aurora' || tier.animation === 'aurora') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -4.8, 4.5, -3.6, 4.5, -2.2, 0],
        skewX: [0, -5.5, 5.2, -4.2, 5.0, -2.5, 0],
        scaleY: [1, 1.14, 0.93, 1.16, 0.95, 1.06, 1],
        scaleX: [1, 0.92, 1.04, 0.90, 1.03, 0.96, 1],
        filter: [
          `drop-shadow(0 -2px 8px ${tier.colors.primary}aa)`,
          `drop-shadow(0 -5px 21px ${tier.colors.secondary}ee)`,
          `drop-shadow(0 -3px 10px ${tier.colors.primary}cc)`,
          `drop-shadow(0 -6px 24px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 -2px 8px ${tier.colors.primary}aa)`,
        ],
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'platinum' || tier.animation === 'shimmer') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -3.8, 3.5, -2.8, 3.6, -1.8, 0],
        skewX: [0, -4.5, 4.0, -3.2, 4.0, -2.0, 0],
        scaleY: [1, 1.10, 0.95, 1.13, 0.96, 1.04, 1],
        scaleX: [1, 0.94, 1.03, 0.92, 1.02, 0.97, 1],
        filter: [
          `drop-shadow(0 -2px 6px rgba(56, 189, 248, 0.75))`,
          `drop-shadow(0 -5px 19px rgba(226, 232, 240, 1))`,
          `drop-shadow(0 -3px 8px rgba(56, 189, 248, 0.9))`,
          `drop-shadow(0 -6px 22px rgba(226, 232, 240, 1))`,
          `drop-shadow(0 -2px 6px rgba(56, 189, 248, 0.75))`,
        ],
        transition: { duration: 1.45, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'legend' || tier.animation === 'legend') {
      return {
        transformOrigin: '12.5px 21px',
        rotate: [0, -5.8, 5.4, -4.2, 5.5, -2.6, 0],
        skewX: [0, -6.8, 6.2, -5.0, 6.0, -3.0, 0],
        scaleY: [1, 1.18, 0.90, 1.22, 0.93, 1.08, 1],
        scaleX: [1, 0.89, 1.06, 0.87, 1.04, 0.95, 1],
        filter: [
          `drop-shadow(0 -3px 10px rgba(245, 158, 11, 0.9))`,
          `drop-shadow(0 -6px 25px rgba(253, 224, 71, 1))`,
          `drop-shadow(0 -4px 13px rgba(245, 158, 11, 0.98))`,
          `drop-shadow(0 -8px 29px rgba(253, 224, 71, 1))`,
          `drop-shadow(0 -3px 10px rgba(245, 158, 11, 0.9))`,
        ],
        transition: { duration: 1.25, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    // Default static fallback
    return {}
  }

  // Inner core heat flicker animation: counter-phase thermal wave lick anchored to base
  const getInnerCoreAnimation = () => {
    if (!canAnimate) return {}
    if (tier.id === 'dormant') {
      return {
        transformOrigin: '12.5px 19px',
        scaleY: [1, 1.08, 0.95, 1.06, 1],
        opacity: [0.75, 0.95, 0.72, 0.92, 0.75],
        transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }
    return {
      transformOrigin: '12.5px 20px',
      rotate: [0, 4.2, -4.8, 3.4, -3.8, 1.8, 0],
      skewX: [0, 3.5, -4.2, 2.8, -3.2, 1.4, 0],
      scaleY: [1, 0.94, 1.14, 0.92, 1.10, 0.96, 1],
      scaleX: [1, 1.06, 0.92, 1.07, 0.94, 1.02, 1],
      opacity: [0.92, 1, 0.84, 1, 0.88, 1, 0.92],
      transition: {
        duration: Math.max(0.7, 1.35 - tier.intensity * 0.08),
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    }
  }

  const getContainerBoxAnimation = () => {
    if (isLocked || !canAnimate || tier.intensity === 0) return {}
    return {
      boxShadow: [
        `0 0 0px ${tier.colors.primary}00, 0 1px 4px ${tier.colors.primary}20`,
        `0 0 12px ${tier.colors.primary}66, 0 2px 8px ${tier.colors.primary}40`,
        `0 0 0px ${tier.colors.primary}00, 0 1px 4px ${tier.colors.primary}20`,
      ],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
    }
  }

  const ariaLabel = isLocked
    ? `Locked streak level: ${tier.name}`
    : `Current streak: ${days} day${days === 1 ? '' : 's'}, ${tier.name} level`

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`flex flex-col select-none ${compact ? 'w-auto' : 'w-full'} min-w-0 ${className}`}
    >
      <div className={`flex items-center gap-2 relative ${compact ? 'w-auto' : 'w-full'} min-w-0`}>
        {/* Badge Icon Container */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Level-Up Burst Ripple Ring (only active when unlocked & celebrated) */}
          {celebrate && canAnimate && !isLocked && (
            <motion.div
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 2.3, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' as const }}
              className="absolute inset-0 rounded-2xl border-2 pointer-events-none z-10"
              style={{ borderColor: tier.colors.primary }}
            />
          )}

          {/* Glowing Aura Ring for Active Unlocked Tiers */}
          {!isLocked && tier.intensity >= 1 && canAnimate && (
            <motion.div
              animate={{
                opacity: [0.35, 0.75, 0.35],
                scale: [0.94, 1.12, 0.94],
              }}
              transition={{
                duration: Math.max(1.1, 2.2 - tier.intensity * 0.18),
                repeat: Infinity,
                ease: 'easeInOut' as const,
              }}
              className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
              style={{
                background: tier.colors.gradient,
                filter: 'blur(7px)',
                opacity: 0.55,
              }}
            />
          )}

          {/* Platinum / Aurora Rotating Shimmer Conic Backdrop */}
          {!isLocked && (tier.id === 'aurora' || tier.id === 'platinum') && canAnimate && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' as const }}
              className="absolute -inset-1 rounded-2xl opacity-40 blur-[2px] pointer-events-none -z-10"
              style={{
                background: `conic-gradient(from 0deg, ${tier.colors.primary}, ${tier.colors.secondary}, ${tier.colors.primary})`,
              }}
            />
          )}

          {/* Floating Sparkle Particles for Legend Tier */}
          {!isLocked && tier.id === 'legend' && canAnimate && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {PARTICLES.map((p) => (
                <motion.span
                  key={p.id}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.6, 1.2, 0.4],
                    y: [p.y, p.y - 8, p.y - 14],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: 'easeInOut' as const,
                  }}
                  className="absolute rounded-full bg-yellow-200"
                  style={{
                    left: `calc(50% + ${p.x}px)`,
                    top: `calc(50% + ${p.y}px)`,
                    width: p.size,
                    height: p.size,
                    boxShadow: '0 0 6px #fde047',
                  }}
                />
              ))}
            </div>
          )}

          {/* Horizontally elongated pill container: Neutral with Lock icon when locked */}
          <motion.div
            animate={getContainerBoxAnimation()}
            className={`flex items-center justify-center rounded-2xl relative transition-transform ${iconDimensions.box}`}
            style={{
              backgroundColor: isLocked ? 'rgba(241, 245, 249, 0.85)' : tier.colors.bg,
              border: isLocked
                ? '1px solid rgba(203, 213, 225, 0.65)'
                : `1px solid ${tier.colors.border}`,
            }}
          >
            {isLocked ? (
              <Lock
                size={iconDimensions.lockSize}
                className="text-slate-400 stroke-[2.2]"
                aria-hidden="true"
              />
            ) : (
              /* Themed Energy-Flame SVG with dynamic fire animation matching fire.mp4 */
              <motion.svg
                viewBox="0 0 24 24"
                width={iconDimensions.width}
                height={iconDimensions.height}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
                aria-hidden="true"
                style={{ transformOrigin: '12.5px 21px' }}
                animate={
                  celebrate && canAnimate
                    ? { scale: [1, 1.35, 1.05, 1] }
                    : getFlameAnimation()
                }
                transition={
                  celebrate
                    ? { duration: 0.8, type: 'spring' as const, stiffness: 400, damping: 15 }
                    : undefined
                }
              >
                <defs>
                  {/* Outer flame gradient */}
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={tier.colors.accent || tier.colors.primary} />
                    <stop offset="45%" stopColor={tier.colors.primary} />
                    <stop offset="100%" stopColor={tier.colors.secondary} />
                  </linearGradient>

                  {/* Inner flame core gradient */}
                  <linearGradient id={`${gradientId}-inner`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="40%" stopColor={tier.colors.secondary || '#fef08a'} />
                    <stop offset="100%" stopColor={tier.colors.primary} />
                  </linearGradient>
                </defs>

                {/* Progressive Tier-specific Flame Silhouette with bold rounded stroke from fire.mp4 */}
                <path
                  d={tier.flameShape.outer}
                  fill={`url(#${gradientId})`}
                  stroke={tier.colors.stroke || '#0c2340'}
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Progressive Tier-specific Inner Flame / Energy Core */}
                {tier.flameShape.inner && (
                  <motion.path
                    d={tier.flameShape.inner}
                    fill={`url(#${gradientId}-inner)`}
                    fillOpacity={tier.intensity >= 6 ? 0.98 : 0.92}
                    style={{ transformOrigin: '12.5px 20px' }}
                    animate={getInnerCoreAnimation()}
                  />
                )}

                {/* Floating Rising Embers from fire.mp4 */}
                {canAnimate && tier.intensity >= 1 && (
                  <>
                    {/* Left Rising Ember */}
                    <motion.path
                      d="M 4.2 4.2 C 3.2 5.5 3.2 6.8 4.2 7.5 C 5.2 6.8 5.2 5.5 4.2 4.2 Z"
                      fill={tier.colors.secondary || '#fef08a'}
                      animate={{
                        opacity: [0, 0.95, 0.9, 0],
                        y: [6, -1, -9, -15],
                        x: [0, -1, -2, -3.5],
                        scale: [0.5, 1.05, 0.8, 0],
                        rotate: [0, -15, -28, -40],
                      }}
                      transition={{
                        duration: Math.max(1.2, 1.8 - tier.intensity * 0.08),
                        repeat: Infinity,
                        ease: 'easeOut' as const,
                        times: [0, 0.25, 0.7, 1],
                      }}
                      style={{ transformOrigin: '4.2px 6px' }}
                    />

                    {/* Right Rising Ember */}
                    <motion.path
                      d="M 19.5 6.0 C 18.5 7.2 18.5 8.5 19.5 9.2 C 20.5 8.5 20.5 7.2 19.5 6.0 Z"
                      fill={tier.colors.secondary || '#fef08a'}
                      animate={{
                        opacity: [0, 0.9, 0.85, 0],
                        y: [7, 0, -8, -14],
                        x: [0, 1, 2, 3.5],
                        scale: [0.5, 0.95, 0.75, 0],
                        rotate: [0, 12, 24, 35],
                      }}
                      transition={{
                        duration: Math.max(1.1, 1.6 - tier.intensity * 0.08),
                        repeat: Infinity,
                        delay: 0.5,
                        ease: 'easeOut' as const,
                        times: [0, 0.25, 0.7, 1],
                      }}
                      style={{ transformOrigin: '19.5px 7.5px' }}
                    />
                  </>
                )}
              </motion.svg>
            )}
          </motion.div>
        </div>

        {/* Labels & Details */}
        {!compact && (
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
            {showDaysCount && (
              <span className={`font-black tracking-tight text-[#0f2819] tabular-nums ${textStyles}`}>
                {`${days} day${days === 1 ? '' : 's'}`}
              </span>
            )}

            {showLabel && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0"
                style={{
                  backgroundColor: tier.colors.bg,
                  color: tier.colors.text,
                  borderColor: tier.colors.border,
                }}
              >
                {tier.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Full-width Sub-caption and Progress Track */}
      {!compact && showProgress && (
        <div className="mt-2 space-y-1.5 w-full min-w-0">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#1e3f2b] gap-1">
            {nextTier ? (
              <span className="truncate">
                {`${daysToNext} more day${daysToNext === 1 ? '' : 's'} to ${nextTier.name}`}
              </span>
            ) : (
              <span className="text-amber-800 font-extrabold flex items-center gap-1 truncate">
                Max level achieved! 🏆
              </span>
            )}
            {progress !== null && (
              <span className="tabular-nums opacity-75 shrink-0">{Math.round(progress * 100)}%</span>
            )}
          </div>

          {/* Progress Bar Track */}
          <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progress !== null ? `${progress * 100}%` : '100%' }}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              className="h-full rounded-full"
              style={{ background: tier.colors.gradient }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
