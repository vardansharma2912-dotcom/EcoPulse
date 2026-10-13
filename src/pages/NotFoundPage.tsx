import React, { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { LightbulbOff, ArrowLeft, Home, Bell, Calculator } from 'lucide-react'
import { Button } from '../components/ui/Button'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Accessible title & focus management on mount
  useEffect(() => {
    document.title = 'Page not found · EcoPulse'
    headingRef.current?.focus()
  }, [])

  // Smart history back handler (falls back to dashboard if no previous history)
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }

  // Raw requested path rendered purely as text (never as HTML)
  const requestedPath = location.pathname + (location.search || '')

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-6 sm:py-10 px-2 sm:px-4">
      {/* Centred Glass-Strong Card with Rise-in Transition */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="glass-strong w-full max-w-md sm:max-w-lg p-6 sm:p-9 rounded-2xl sm:rounded-3xl shadow-xl text-center flex flex-col items-center"
      >
        {/* Large 404 with Forest / Leaf Greens & Unlit Bulb Centerpiece */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 select-none" aria-hidden="true">
          <span className="text-6xl sm:text-7xl font-black text-[#14301f] tracking-tighter font-mono">
            4
          </span>

          {/* Soft Green Gradient Circle with Faint SVG Leaf and Unlit Bulb */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200/80 border border-emerald-600/25 shadow-inner flex items-center justify-center overflow-hidden">
            {/* Faint Botanical Watermark Leaf */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full text-emerald-800/15 p-2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>

            {/* Unlit Lightbulb Illustration with Mount Flicker Animation */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.3 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: [0.3, 1, 0.25, 0.9, 0.35, 1] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.75,
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      ease: 'easeInOut',
                    }
              }
              className="relative z-10 flex items-center justify-center text-[#14301f]"
            >
              <LightbulbOff className="w-8 h-8 sm:w-10 sm:h-10 text-[#14301f] drop-shadow-xs" />
            </motion.div>
          </div>

          <span className="text-6xl sm:text-7xl font-black text-[#14301f] tracking-tighter font-mono">
            4
          </span>
        </div>

        {/* Accessible Focusable Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xl sm:text-2xl font-extrabold text-[#14301f] tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 rounded-lg px-2 py-0.5"
        >
          This page is switched off
        </h1>

        {/* Informative Body Copy */}
        <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed max-w-sm sm:max-w-md">
          We couldn't find that page. It may have been moved, or the link may be wrong.
        </p>

        {/* Requested Attempted Path Code Chip (Always Rendered as Plain Text) */}
        <div className="mt-3.5 px-1 max-w-full">
          <span className="sr-only">Requested path: </span>
          <code
            title={requestedPath}
            className="inline-block max-w-full truncate px-3 py-1.5 rounded-lg bg-emerald-950/5 border border-emerald-900/15 font-mono text-xs sm:text-sm text-emerald-950 select-all"
          >
            {requestedPath}
          </code>
        </div>

        {/* Primary and Secondary Navigation Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="min-h-[44px] px-5"
          >
            Back to Dashboard
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleGoBack}
            className="min-h-[44px] px-5"
          >
            Go back
          </Button>
        </div>

        {/* Quiet Quick Links */}
        <div className="mt-6 pt-5 border-t border-emerald-900/10 w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
          <span>Explore:</span>
          <Link
            to="/reminders"
            className="min-h-[44px] inline-flex items-center px-2 font-medium text-emerald-800 hover:text-emerald-950 underline underline-offset-4 rounded-md focus-visible:outline-2 focus-visible:outline-emerald-800"
          >
            <Bell className="w-3.5 h-3.5 mr-1" />
            Reminders
          </Link>
          <span className="text-slate-400 select-none" aria-hidden="true">
            •
          </span>
          <Link
            to="/calculator"
            className="min-h-[44px] inline-flex items-center px-2 font-medium text-emerald-800 hover:text-emerald-950 underline underline-offset-4 rounded-md focus-visible:outline-2 focus-visible:outline-emerald-800"
          >
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Calculator
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
