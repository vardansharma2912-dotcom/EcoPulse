import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  Bell,
  CheckCircle2,
  Zap,
  Flame,
  Globe,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'

export interface TourDialogProps {
  open: boolean
  onClose: (action?: 'start' | 'add') => void
}

interface TourStep {
  title: string
  lines: string[]
  icon: React.ComponentType<{ className?: string }>
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Small reminders, real habits',
    lines: [
      'EcoPulse reminds you to do small energy-saving actions (lights, fans, chargers, standby devices) at times you choose.',
    ],
    icon: Bell,
  },
  {
    title: 'Mark done, or snooze',
    lines: [
      'Mark an action done when you do it. These are self-reported.',
      'Snooze for 15 minutes, 1 hour, or a custom time.',
    ],
    icon: CheckCircle2,
  },
  {
    title: 'Estimated savings',
    lines: [
      'kWh = watts × hours / 1000, and cost = kWh × your tariff.',
      'Figures are estimates, not meter readings. Set your real tariff in Settings.',
    ],
    icon: Zap,
  },
  {
    title: 'Progress and streaks',
    lines: [
      'Analytics shows your week, streaks and badges, built only from what you complete.',
    ],
    icon: Flame,
  },
  {
    title: 'Alerts need EcoPulse open',
    lines: [
      'Reminder alerts appear while EcoPulse is open in a browser tab.',
      'Turn on browser notifications in Settings.',
      'Missed reminders show as Overdue when you return.',
    ],
    icon: Globe,
  },
]

const TourModalContent: React.FC<{ onClose: (action?: 'start' | 'add') => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const isReducedMotion = useReducedMotion()

  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Track previous active element and trap focus on mount/unmount
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement | null
    return () => {
      if (previousActiveElement.current) {
        try {
          previousActiveElement.current.focus()
        } catch {
          // Ignore
        }
      }
    }
  }, [])

  // Focus dialog on step change
  useEffect(() => {
    if (dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }
  }, [currentStep])

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    onClose('start')
  }, [onClose])

  const handleStart = useCallback(() => {
    onClose('start')
  }, [onClose])

  const handleAddFirst = useCallback(() => {
    onClose('add')
  }, [onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleSkip()
      } else if (e.key === 'ArrowRight') {
        if (currentStep < TOUR_STEPS.length - 1) {
          e.preventDefault()
          handleNext()
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          e.preventDefault()
          handleBack()
        }
      } else if (e.key === 'Tab') {
        if (!dialogRef.current) return
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'))

        if (focusables.length === 0) return

        const firstElement = focusables[0]
        const lastElement = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, handleSkip, handleNext, handleBack])

  const stepData = TOUR_STEPS[currentStep]
  const IconComponent = stepData.icon
  const isLastStep = currentStep === TOUR_STEPS.length - 1

  const slideVariants = {
    enter: (dir: number) => ({
      x: isReducedMotion ? 0 : dir > 0 ? 36 : -36,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: isReducedMotion ? 0 : 0.28,
        ease: 'easeOut' as const,
      },
    },
    exit: (dir: number) => ({
      x: isReducedMotion ? 0 : dir > 0 ? -36 : 36,
      opacity: 0,
      transition: {
        duration: isReducedMotion ? 0 : 0.2,
        ease: 'easeIn' as const,
      },
    }),
  }

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-emerald-950/45 backdrop-blur-xs select-none"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-dialog-title"
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 20, scale: isReducedMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: isReducedMotion ? 0 : 15, scale: 0.98 }}
        transition={{ duration: isReducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong w-full max-w-[520px] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/80 space-y-4 max-h-[92dvh] overflow-y-auto"
      >
        {/* Header Bar: Step Indicator & Skip Button */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900 tracking-tight">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentStep
                      ? 'w-5 h-1.5 bg-emerald-700'
                      : 'w-1.5 h-1.5 bg-emerald-900/25'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-950 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-900/5 cursor-pointer inline-flex items-center gap-1"
            aria-label="Skip tour"
          >
            <span>Skip tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Direction-Aware Slide Content */}
        <div className="relative overflow-hidden min-h-[260px] sm:min-h-[250px] flex flex-col justify-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Illustration Area: Soft Green Gradient + Large Lucide Icon + Faint SVG Leaf */}
              <div className="relative rounded-2xl bg-gradient-to-br from-emerald-100/90 via-emerald-50/70 to-teal-100/80 p-6 flex items-center justify-center overflow-hidden border border-emerald-900/10 shadow-xs">
                {/* Faint Decorative Background SVG Leaf */}
                <svg
                  className="absolute right-1 -bottom-4 w-32 h-32 text-emerald-800/15 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>

                {/* Main Illustration Mark */}
                {currentStep === 0 || isLastStep ? (
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/90 border border-white/80 flex items-center justify-center shadow-md shadow-emerald-950/10">
                    <Logo size={48} />
                  </div>
                ) : (
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
                    <IconComponent className="w-7 h-7" />
                  </div>
                )}
              </div>

              {/* Title & Short Lines */}
              <div className="text-center space-y-2 px-1">
                <h2
                  id="tour-dialog-title"
                  className="text-lg sm:text-xl font-extrabold text-[#14301f] tracking-tight"
                >
                  {stepData.title}
                </h2>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-md mx-auto">
                  {stepData.lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-2 border-t border-emerald-900/10 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
            >
              Back
            </Button>
          ) : (
            <div className="w-16" />
          )}

          {!isLastStep ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="ml-auto"
              onClick={handleNext}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddFirst}
              >
                Add my first reminder
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleStart}
              >
                Start using EcoPulse
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

export const TourDialog: React.FC<TourDialogProps> = ({ open, onClose }) => {
  if (!open || typeof document === 'undefined') {
    return null
  }
  return <TourModalContent onClose={onClose} />
}
