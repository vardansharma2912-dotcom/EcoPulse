import React, { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Leaf, Bell, Zap, Flame, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAppState } from '../../state'
import { setWelcomeHandled } from '../../lib/storage'

export interface WelcomeScreenProps {
  onComplete: (name?: string) => void
}

/**
 * WelcomeScreen
 * First-launch welcome experience (NOT authentication / NOT login).
 * Allows the user to choose their display name or skip.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const { updateSettings } = useAppState()
  const isReducedMotion = useReducedMotion()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const trimmed = name.trim()
  const previewGreeting = trimmed ? `Hi, ${trimmed}` : 'Hi there'

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (trimmed.length === 0) {
      setError("Please enter your name or click 'Skip for now'")
      return
    }

    if (trimmed.length > 40) {
      setError('Name must be 40 characters or fewer')
      return
    }

    setError(null)
    updateSettings({ displayName: trimmed })
    setWelcomeHandled(true)
    onComplete(trimmed)
  }

  const handleSkip = () => {
    setError(null)
    setWelcomeHandled(true)
    onComplete()
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: isReducedMotion ? 0 : 20,
      filter: isReducedMotion ? 'none' : 'blur(6px)',
      scale: isReducedMotion ? 1 : 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: isReducedMotion ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: isReducedMotion ? 0 : 0.06,
        delayChildren: isReducedMotion ? 0 : 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: isReducedMotion ? 0 : -12,
      filter: isReducedMotion ? 'none' : 'blur(4px)',
      scale: isReducedMotion ? 1 : 0.98,
      transition: { duration: isReducedMotion ? 0 : 0.25 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: isReducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isReducedMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 my-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="glass-strong max-w-[420px] sm:max-w-[440px] w-full p-5 sm:p-6 rounded-3xl shadow-2xl border border-white/70 space-y-4 text-center select-none backdrop-blur-xl bg-white/65"
      >
        {/* Leaf Logo Mark (gently scales in) */}
        <motion.div
          variants={itemVariants}
          className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20"
        >
          <motion.div
            initial={{ scale: isReducedMotion ? 1 : 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          >
            <Leaf className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
          </motion.div>
        </motion.div>

        {/* Header & Tagline */}
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#14301f] tracking-tight">
            Welcome to EcoPulse
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Small habits, tracked honestly.
          </p>
        </motion.div>

        {/* Live Greeting Preview Badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300/40 text-xs sm:text-sm font-bold text-emerald-900 tracking-tight">
            <span>{previewGreeting}</span>
          </div>
        </motion.div>

        {/* Name Input Form */}
        <motion.form variants={itemVariants} onSubmit={handleContinue} className="space-y-3.5 text-left">
          <div className="space-y-1">
            <input
              id="welcome-name"
              type="text"
              placeholder="What should we call you?"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              maxLength={40}
              autoFocus
              className="w-full px-3.5 py-2 sm:py-2.5 text-sm rounded-xl bg-white/80 border border-emerald-950/20 text-[#14301f] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/50 transition-all font-medium"
            />
            {error && (
              <p className="text-[11px] text-rose-700 font-semibold px-1 pt-0.5">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-0.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
            >
              Continue
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:text-emerald-950 transition-colors font-medium underline underline-offset-2 cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        </motion.form>

        {/* Privacy Note */}
        <motion.div
          variants={itemVariants}
          className="pt-2 border-t border-emerald-900/10 flex items-center justify-center gap-1.5 text-[11px] text-emerald-900/75 font-semibold"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Saved only in this browser. No account needed.</span>
        </motion.div>
      </motion.div>

      {/* Feature Row Under the Card (plain icon + text with thin dividers, non-clickable) */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isReducedMotion ? 0 : 0.25, duration: isReducedMotion ? 0 : 0.35 }}
        className="flex items-center justify-center gap-3 sm:gap-4 mt-3.5 text-xs font-semibold text-[#14301f]/85 select-none divide-x divide-emerald-900/20"
      >
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
          <span>Reminders</span>
        </div>
        <div className="flex items-center gap-1.5 pl-3 sm:pl-4">
          <Zap className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
          <span>Estimated savings</span>
        </div>
        <div className="flex items-center gap-1.5 pl-3 sm:pl-4">
          <Flame className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Streaks</span>
        </div>
      </motion.div>
    </div>
  )
}
