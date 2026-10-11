import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Pause, Play, Square } from 'lucide-react'
import { useToast } from '../../context/useToast'

export interface TimeTrackerCardProps {
  className?: string
}

export const TimeTrackerCard: React.FC<TimeTrackerCardProps> = ({ className = '' }) => {
  const { showToast } = useToast()
  // Start at 5048 seconds = 01:24:08 (exact time from the reference video demo!)
  const [seconds, setSeconds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ecopulse_time_tracker_secs')
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed) && parsed > 0) return parsed
      }
    }
    return 5048
  })

  const [isRunning, setIsRunning] = useState<boolean>(true)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1
        try {
          localStorage.setItem('ecopulse_time_tracker_secs', next.toString())
        } catch {
          // ignore storage error
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTogglePlayPause = () => {
    setIsRunning((prev) => {
      const next = !prev
      showToast(next ? 'Timer resumed' : 'Timer paused')
      return next
    })
  }

  const handleReset = () => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    showToast(`Energy session logged: ${hrs}h ${mins}m avoided!`)
    setIsRunning(false)
    setSeconds(0)
    try {
      localStorage.setItem('ecopulse_time_tracker_secs', '0')
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#0a381e] text-white p-5 flex flex-col justify-between shadow-xl border border-emerald-500/20 select-none ${className}`}
    >
      {/* Topographic Contour-Line SVG Background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.14]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 220"
        preserveAspectRatio="none"
      >
        <path
          d="M-30,40 C50,15 130,70 210,35 C270,10 320,45 370,30"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
        />
        <path
          d="M-30,80 C60,55 140,110 220,70 C280,45 330,85 380,70"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
        />
        <path
          d="M-30,120 C40,105 120,145 200,110 C270,85 310,135 370,120"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
        />
        <path
          d="M-30,160 C70,135 150,185 230,150 C280,125 320,165 370,160"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
        />
        <path
          d="M-30,20 C80,5 160,40 240,15 C290,0 330,30 380,18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
        />
      </svg>

      {/* Top Header: Title & Live Pulsing Indicator */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Time Tracker</h3>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'}`} />
          <span>{isRunning ? 'Live' : 'Paused'}</span>
        </div>
      </div>

      {/* Big Digital Monospace Timer Display */}
      <div className="relative z-10 py-3 sm:py-4 text-center">
        <span className="font-mono text-3xl sm:text-4xl md:text-[42px] font-bold text-white tracking-wider tabular-nums drop-shadow-sm select-all">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Bottom Round Controls: Pause/Play (White) and Stop (Red) */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-2">
        {/* Pause / Play Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleTogglePlayPause}
          aria-label={isRunning ? 'Pause tracker' : 'Resume tracker'}
          className="w-12 h-12 rounded-full bg-white text-[#0a381e] flex items-center justify-center shadow-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          {isRunning ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </motion.button>

        {/* Stop / Reset Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleReset}
          aria-label="Stop and log session"
          className="w-12 h-12 rounded-full bg-[#c53030] hover:bg-[#a82525] text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <Square className="w-4 h-4 fill-current" />
        </motion.button>
      </div>
    </div>
  )
}
