import React, { useState, useEffect, useRef, useContext, useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return

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
  }, [tier.id, tier.intensity, tier.name, showToast])

  // Size styling maps: horizontally elongated pill container
  const iconDimensions = {
    sm: { width: 22, height: 18, box: 'w-10 h-7' },
    md: { width: 28, height: 24, box: 'w-13 h-9' },
    lg: { width: 40, height: 34, box: 'w-18 h-13' },
  }[size]

  const textStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size]

  // Animation variants based on tier intensity & reducedMotion
  const canAnimate = isVisible && !reducedMotion

  const getFlameAnimation = () => {
    if (!canAnimate) return {}

    if (tier.id === 'spark' || tier.animation === 'subtle') {
      return {
        scale: [1, 1.1, 0.95, 1.08, 1],
        y: [0, -2, 0.8, -1.2, 0],
        filter: [
          `drop-shadow(0 0 2px ${tier.colors.primary}66)`,
          `drop-shadow(0 0 9px ${tier.colors.primary}dd)`,
          `drop-shadow(0 0 2px ${tier.colors.primary}66)`,
        ],
        transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'flame' || tier.animation === 'flame') {
      return {
        scale: [1, 1.12, 0.94, 1.09, 1],
        y: [0, -2.5, 1, -1.5, 0],
        rotate: [0, -3, 2.5, -2, 0],
        filter: [
          `drop-shadow(0 0 4px ${tier.colors.primary}77)`,
          `drop-shadow(0 0 13px ${tier.colors.primary}ee)`,
          `drop-shadow(0 0 4px ${tier.colors.primary}77)`,
        ],
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'blaze' || tier.animation === 'blaze') {
      return {
        scale: [1, 1.15, 0.92, 1.1, 1],
        y: [0, -3, 1.2, -2, 0],
        rotate: [0, -4, 3.5, -3, 0],
        filter: [
          `drop-shadow(0 0 5px ${tier.colors.primary}88)`,
          `drop-shadow(0 0 16px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 5px ${tier.colors.primary}88)`,
        ],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'inferno' || tier.animation === 'inferno') {
      return {
        scale: [1, 1.18, 0.91, 1.12, 1],
        y: [0, -3.5, 1.5, -2.5, 0],
        rotate: [0, -5, 4, -4, 0],
        filter: [
          `drop-shadow(0 0 7px ${tier.colors.primary}99)`,
          `drop-shadow(0 0 18px ${tier.colors.secondary}ff)`,
          `drop-shadow(0 0 7px ${tier.colors.primary}99)`,
        ],
        transition: { duration: 1.05, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'aurora' || tier.animation === 'aurora') {
      return {
        scale: [1, 1.1, 0.96, 1.08, 1],
        y: [0, -2, 1, -1.2, 0],
        filter: [
          `drop-shadow(0 0 8px ${tier.colors.primary}aa)`,
          `drop-shadow(0 0 18px ${tier.colors.secondary}dd)`,
          `drop-shadow(0 0 8px ${tier.colors.primary}aa)`,
        ],
        transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'platinum' || tier.animation === 'shimmer') {
      return {
        scale: [1, 1.08, 0.96, 1.06, 1],
        y: [0, -1.5, 0.8, -1, 0],
        filter: [
          `drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))`,
          `drop-shadow(0 0 16px rgba(226, 232, 240, 1))`,
          `drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))`,
        ],
        transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    if (tier.id === 'legend' || tier.animation === 'legend') {
      return {
        scale: [1, 1.16, 0.93, 1.1, 1],
        y: [0, -3, 1.2, -2, 0],
        filter: [
          `drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))`,
          `drop-shadow(0 0 22px rgba(253, 224, 71, 1))`,
          `drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))`,
        ],
        transition: { duration: 1.3, repeat: Infinity, ease: 'easeInOut' as const },
      }
    }

    // Dormant tier: soft breathing pulse
    return {
      scale: [1, 1.06, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const },
    }
  }

  const getContainerBoxAnimation = () => {
    if (!canAnimate || tier.intensity === 0) return {}
    return {
      boxShadow: [
        `0 0 0px ${tier.colors.primary}00, 0 1px 4px ${tier.colors.primary}20`,
        `0 0 12px ${tier.colors.primary}66, 0 2px 8px ${tier.colors.primary}40`,
        `0 0 0px ${tier.colors.primary}00, 0 1px 4px ${tier.colors.primary}20`,
      ],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
    }
  }

  const ariaLabel = `Current streak: ${days} day${days === 1 ? '' : 's'}, ${tier.name} level`

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex flex-col select-none ${className}`}
    >
      <div className="inline-flex items-center gap-2 relative">
        {/* Animated Badge Icon Container */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Level-Up Burst Ripple Ring */}
          {levelUpBurst && canAnimate && (
            <motion.div
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 2.3, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' as const }}
              className="absolute inset-0 rounded-2xl border-2 pointer-events-none z-10"
              style={{ borderColor: tier.colors.primary }}
            />
          )}

          {/* Glowing Aura Ring for Active Tiers (Spark through Legend) */}
          {tier.intensity >= 1 && canAnimate && (
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
          {(tier.id === 'aurora' || tier.id === 'platinum') && canAnimate && (
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
          {tier.id === 'legend' && canAnimate && (
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

          {/* Horizontally elongated pill container */}
          <motion.div
            animate={getContainerBoxAnimation()}
            className={`flex items-center justify-center rounded-2xl relative transition-transform ${iconDimensions.box}`}
            style={{
              backgroundColor: tier.colors.bg,
              border: `1px solid ${tier.colors.border}`,
            }}
          >
            {/* Themed Energy-Flame SVG with dynamic flame animation */}
            <motion.svg
              viewBox="0 0 24 24"
              width={iconDimensions.width}
              height={iconDimensions.height}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
              aria-hidden="true"
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

              {/* Flame Silhouette */}
              <path
                d="M12 2.5C11.3 5 9.4 7.2 8.5 9.4C7.3 12 7.7 15.2 9.8 17.5C8.4 16.1 8 14.2 8.5 12.8C9 11.4 10.4 10 11.4 8.7C12.3 11 14.2 12.4 14.8 14.3C15.2 15.6 14.7 17.2 13.5 18.3C16.8 17.4 18.6 14.1 17.8 10.8C17.1 8.2 14.4 5.2 12 2.5Z"
                fill={`url(#${gradientId})`}
                stroke={tier.colors.stroke}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Internal Electric Bolt Core */}
              {tier.intensity > 0 && (
                <motion.path
                  d="M12 9.5L10.2 13.2H12.6L11 16.8L14.4 12.2H12.2L13.4 9.5H12Z"
                  fill="#ffffff"
                  fillOpacity={tier.intensity >= 4 ? 0.95 : 0.8}
                  animate={
                    canAnimate
                      ? {
                          opacity: [0.75, 1, 0.7, 1, 0.75],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                  }}
                />
              )}
            </motion.svg>
          </motion.div>
        </div>

        {/* Labels & Details */}
        {!compact && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {showDaysCount && (
                <span className={`font-black tracking-tight text-[#0f2819] tabular-nums ${textStyles}`}>
                  {`${days} day${days === 1 ? '' : 's'}`}
                </span>
              )}

              {showLabel && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
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

            {/* Sub-caption or Progress Indicator */}
            {showProgress && (
              <div className="mt-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#1e3f2b]">
                  {nextTier ? (
                    <span>
                      {`${daysToNext} more day${daysToNext === 1 ? '' : 's'} to ${nextTier.name}`}
                    </span>
                  ) : (
                    <span className="text-amber-800 font-extrabold flex items-center gap-1">
                      Max level achieved! 🏆
                    </span>
                  )}
                  {progress !== null && (
                    <span className="tabular-nums opacity-75">{Math.round(progress * 100)}%</span>
                  )}
                </div>

                {/* Progress Bar Track */}
                <div className="h-1.5 w-32 sm:w-40 rounded-full bg-black/10 overflow-hidden relative">
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
        )}
      </div>
    </div>
  )
}
