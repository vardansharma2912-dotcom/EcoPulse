import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Leaf, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAppState } from '../../state'
import { useToast } from '../../context/useToast'
import { setWelcomeHandled } from '../../lib/storage'

export interface WelcomeScreenProps {
  onComplete: () => void
}

/**
 * WelcomeScreen
 * First-launch welcome experience (NOT authentication / NOT login).
 * Allows the user to choose their display name or skip.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const { updateSettings } = useAppState()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = name.trim()

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
    showToast(`Welcome, ${trimmed}!`)
    onComplete()
  }

  const handleSkip = () => {
    setError(null)
    setWelcomeHandled(true)
    showToast('Welcome, Guest!')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-[100dvh]">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="glass-strong max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/80 space-y-6 text-center"
      >
        {/* Brand Icon Badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20">
          <Leaf className="w-7 h-7" />
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14301f] tracking-tight">
            Welcome to EcoPulse
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Smart energy conservation companion for campus and daily life.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleContinue} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="welcome-name"
              className="block text-xs sm:text-sm font-semibold text-[#14301f] mb-1.5"
            >
              What should we call you?
            </label>
            <Input
              id="welcome-name"
              type="text"
              placeholder="e.g. Alex, Sam, Priyanshu"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              error={error || undefined}
              maxLength={40}
              autoFocus
              className="bg-white/80"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="w-full"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </div>
        </form>

        {/* Honest Privacy Notice */}
        <div className="pt-2 border-t border-emerald-900/10 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-emerald-900/75 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Saved only in this browser. No account needed.</span>
        </div>
      </motion.div>
    </div>
  )
}
