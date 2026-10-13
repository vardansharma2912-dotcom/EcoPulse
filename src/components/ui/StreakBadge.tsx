import React, { useState, useEffect, useRef, useContext, useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Lock } from 'lucide-react'
import {
  getStreakTier,
  getProgressToNext,
  getDaysToNext,
  STREAK_TIERS,
} from '../../lib/streakTiers'
import { ToastContext } from '../../context/toastCore'

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
}) => {
  const reducedMotion = useReducedMotion()
  const gradientId = useId()
  const toastCtx = useContext(ToastContext)
  const showToast = toastCtx?.showToast

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

  // Session-based level-up burst detection
  const [levelUpBurst, setLevelUpBurst] = useState(false)
  const initialTierRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || isLocked) return

    const sessionKey = 'ecopulse_last_known_streak_tier'
    const storedTierId = sessionStorage.getItem(sessionKey)

    if (storedTierId === null) {
      // First mount in this browser session: remember tier and do NOT fire burst
      sessionStorage.setItem(sessionKey, tier.id)
      initialTierRef.current = tier.id
      return
    }

    if (storedTierId !== tier.id) {
      const prevTier = STREAK_TIERS.find((t) => t.id === storedTierId)
      const prevIntensity = prevTier ? prevTier.intensity : 0

      // Only fire celebratory burst when tier actually upgrades
      if (tier.intensity > prevIntensity) {
        sessionStorage.setItem(sessionKey, tier.id)
        const burstTimer = setTimeout(() => {
          setLevelUpBurst(true)
          if (showToast) {
            showToast(`Streak level up: ${tier.name}! 🔥`)
          }
        }, 50)
        const resetTimer = setTimeout(() => setLevelUpBurst(false), 2450)
        return () => {
          clearTimeout(burstTimer)
          clearTimeout(resetTimer)
        }
      }

      sessionStorage.setItem(sessionKey, tier.id)
    }
  }, [tier.id, tier.intensity, tier.name, showToast, isLocked])

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

  // Only achieved streak levels are animated; locked or dormant tiers are static
  const canAnimate = isVisible && !reducedMotion && animated && !isLocked && tier.intensity > 0

  // Real organic fire animation: base-anchored flame physics with skew, sway, elongation, and flicker
  const getFlameAnimation = () => {
    if (!canAnimate) return {}

    if (tier.id === 'spark' || tier.animation === 'subtle') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -1.8, 1.5, -1.2, 1.8, -0.6, 0],
        skewX: [0, -2.2, 2.0, -1.5, 1.5, -0.8, 0],
        scaleY: [1, 1.06, 0.97, 1.05, 0.98, 1.02, 1],
        scaleX: [1, 0.96, 1.02, 0.97, 1.01, 0.98, 1],
        y: [0, -1.5, 0.3, -1.2, 0.2, -0.6, 0],
        filter: [
          `drop-shadow(0 0 2px ${tier.colors.primary}55)`,
          `drop-shadow(0 0 7px ${tier.colors.primary}bb)`,
          `drop-shadow(0 0 3px ${tier.colors.primary}66)`,
          `drop-shadow(0 0 8px ${tier.colors.primary}cc)`,
          `drop-shadow(0 0 2px ${tier.colors.primary}55)`,
        ],
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'flame' || tier.animation === 'flame') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -2.8, 2.5, -2.0, 2.2, -1.2, 0],
        skewX: [0, -3.2, 3.0, -2.2, 2.4, -1.0, 0],
        scaleY: [1, 1.09, 0.95, 1.07, 0.96, 1.03, 1],
        scaleX: [1, 0.94, 1.03, 0.95, 1.02, 0.97, 1],
        y: [0, -2.2, 0.5, -1.8, 0.3, -1.0, 0],
        filter: [
          `drop-shadow(0 0 3px ${tier.colors.primary}77)`,
          `drop-shadow(0 0 11px ${tier.colors.primary}ee)`,
          `drop-shadow(0 0 4px ${tier.colors.primary}88)`,
          `drop-shadow(0 0 13px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 3px ${tier.colors.primary}77)`,
        ],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'blaze' || tier.animation === 'blaze') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -3.6, 3.2, -2.6, 3.0, -1.6, 0],
        skewX: [0, -4.0, 3.8, -3.0, 3.2, -1.5, 0],
        scaleY: [1, 1.12, 0.93, 1.10, 0.95, 1.04, 1],
        scaleX: [1, 0.92, 1.04, 0.94, 1.02, 0.96, 1],
        y: [0, -2.8, 0.7, -2.2, 0.4, -1.4, 0],
        filter: [
          `drop-shadow(0 0 4px ${tier.colors.primary}88)`,
          `drop-shadow(0 0 15px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 5px ${tier.colors.primary}99)`,
          `drop-shadow(0 0 17px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 4px ${tier.colors.primary}88)`,
        ],
        transition: { duration: 1.25, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'inferno' || tier.animation === 'inferno') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -4.5, 4.0, -3.5, 3.8, -2.0, 0],
        skewX: [0, -5.2, 4.8, -3.8, 4.2, -2.2, 0],
        scaleY: [1, 1.15, 0.91, 1.13, 0.93, 1.05, 1],
        scaleX: [1, 0.90, 1.05, 0.92, 1.03, 0.95, 1],
        y: [0, -3.4, 0.9, -2.8, 0.5, -1.8, 0],
        filter: [
          `drop-shadow(0 0 6px ${tier.colors.primary}99)`,
          `drop-shadow(0 0 18px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 7px ${tier.colors.primary}aa)`,
          `drop-shadow(0 0 21px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 6px ${tier.colors.primary}99)`,
        ],
        transition: { duration: 1.05, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'aurora' || tier.animation === 'aurora') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -3.2, 2.8, -2.4, 3.0, -1.4, 0],
        skewX: [0, -3.8, 3.5, -2.6, 3.2, -1.6, 0],
        scaleY: [1, 1.08, 0.95, 1.07, 0.96, 1.02, 1],
        scaleX: [1, 0.94, 1.03, 0.95, 1.02, 0.97, 1],
        y: [0, -2.2, 0.5, -1.8, 0.3, -1.0, 0],
        filter: [
          `drop-shadow(0 0 7px ${tier.colors.primary}aa)`,
          `drop-shadow(0 0 19px ${tier.colors.secondary}ee)`,
          `drop-shadow(0 0 8px ${tier.colors.primary}bb)`,
          `drop-shadow(0 0 20px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 7px ${tier.colors.primary}aa)`,
        ],
        transition: { duration: 1.9, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'platinum' || tier.animation === 'shimmer') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -2.2, 2.0, -1.6, 1.9, -0.8, 0],
        skewX: [0, -2.5, 2.2, -1.8, 2.0, -1.0, 0],
        scaleY: [1, 1.07, 0.96, 1.06, 0.97, 1.02, 1],
        scaleX: [1, 0.95, 1.02, 0.96, 1.01, 0.98, 1],
        y: [0, -1.8, 0.4, -1.4, 0.2, -0.8, 0],
        filter: [
          `drop-shadow(0 0 5px rgba(56, 189, 248, 0.7))`,
          `drop-shadow(0 0 17px rgba(226, 232, 240, 1))`,
          `drop-shadow(0 0 7px rgba(56, 189, 248, 0.8))`,
          `drop-shadow(0 0 20px rgba(226, 232, 240, 1))`,
          `drop-shadow(0 0 5px rgba(56, 189, 248, 0.7))`,
        ],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'legend' || tier.animation === 'legend') {
      return {
        transformOrigin: '12px 20px',
        rotate: [0, -3.8, 3.4, -2.8, 3.2, -1.5, 0],
        skewX: [0, -4.5, 4.0, -3.2, 3.6, -1.8, 0],
        scaleY: [1, 1.13, 0.92, 1.11, 0.94, 1.04, 1],
        scaleX: [1, 0.91, 1.04, 0.93, 1.02, 0.96, 1],
        y: [0, -3.0, 0.8, -2.4, 0.4, -1.5, 0],
        filter: [
          `drop-shadow(0 0 9px rgba(245, 158, 11, 0.85))`,
          `drop-shadow(0 0 23px rgba(253, 224, 71, 1))`,
          `drop-shadow(0 0 11px rgba(245, 158, 11, 0.95))`,
          `drop-shadow(0 0 26px rgba(253, 224, 71, 1))`,
          `drop-shadow(0 0 9px rgba(245, 158, 11, 0.85))`,
        ],
        transition: { duration: 1.25, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    // Default static fallback
    return {}
  }

  // Inner core heat flicker animation
  const getInnerCoreAnimation = () => {
    if (!canAnimate) return {}
    return {
      opacity: [0.75, 1, 0.65, 0.95, 0.72, 1],
      scaleY: [1, 1.08, 0.95, 1.05, 0.98, 1],
      y: [0, -1.2, 0.3, -0.9, 0.1, 0],
      transition: {
        duration: Math.max(0.7, 1.4 - tier.intensity * 0.1),
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
      className={`flex flex-col select-none w-full min-w-0 ${className}`}
    >
      <div className="flex items-center gap-2 relative w-full min-w-0">
        {/* Badge Icon Container */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Level-Up Burst Ripple Ring (only active when unlocked & leveled up) */}
          {levelUpBurst && canAnimate && !isLocked && (
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
              /* Themed Energy-Flame SVG with dynamic fire animation */
              <motion.svg
                viewBox="0 0 24 24"
                width={iconDimensions.width}
                height={iconDimensions.height}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
                aria-hidden="true"
                style={{ transformOrigin: '12px 20px' }}
                animate={
                  levelUpBurst && canAnimate
                    ? { scale: [1, 1.35, 1.05, 1] }
                    : getFlameAnimation()
                }
                transition={
                  levelUpBurst
                    ? { duration: 0.8, type: 'spring' as const, stiffness: 400, damping: 15 }
                    : undefined
                }
              >
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={tier.colors.secondary} />
                    <stop offset="100%" stopColor={tier.colors.primary} />
                  </linearGradient>
                </defs>

                {/* Progressive Tier-specific Flame Silhouette */}
                <path
                  d={tier.flameShape.outer}
                  fill={`url(#${gradientId})`}
                  stroke={tier.colors.stroke}
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />

                {/* Progressive Tier-specific Inner Flame / Energy Core */}
                {tier.flameShape.inner && (
                  <motion.path
                    d={tier.flameShape.inner}
                    fill={tier.intensity >= 6 ? '#ffffff' : tier.colors.secondary || '#ffffff'}
                    fillOpacity={tier.intensity >= 4 ? 0.95 : 0.82}
                    style={{ transformOrigin: '12px 20px' }}
                    animate={getInnerCoreAnimation()}
                  />
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
