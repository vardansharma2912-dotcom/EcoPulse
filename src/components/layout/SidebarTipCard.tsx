import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Sparkles, Lightbulb } from 'lucide-react'

const ENERGY_TIPS = [
  {
    title: 'Vampire Power',
    text: 'Unplug chargers and adapters when done. Idle bricks continuously draw 2–5W of phantom power.',
  },
  {
    title: 'Convective Cooling',
    text: 'Ceiling fans cool skin by evaporation, not the room air. Turn them off whenever stepping outside.',
  },
  {
    title: 'Natural Daylight',
    text: 'Study by windows during afternoon hours. Keeping desk lamps switched off saves ~15W hourly.',
  },
  {
    title: 'AC Setpoints',
    text: 'Set AC to 24°C instead of 18°C. Each degree higher reduces cooling electricity consumption by ~6%.',
  },
  {
    title: 'Computer Sleep',
    text: 'Configure PC screens to sleep after 10 idle minutes; saves ~40W compared to active idle displays.',
  },
]

export const SidebarTipCard: React.FC = () => {
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (isHovered || prefersReduced) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ENERGY_TIPS.length)
    }, 8000)

    return () => clearInterval(timer)
  }, [isHovered, prefersReduced])

  const current = ENERGY_TIPS[index]

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl bg-[#0a381e] text-white p-4 overflow-hidden border border-emerald-800/60 shadow-lg shadow-emerald-950/20 select-none group"
    >
      {/* Subtle Topographic Contour-Line SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        viewBox="0 0 240 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M -20,40 Q 60,10 120,50 T 260,30"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M -20,70 Q 70,30 130,80 T 260,60"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M -20,100 Q 50,60 140,110 T 260,90"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M -20,130 Q 80,90 150,140 T 260,120"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M -20,160 Q 60,120 160,170 T 260,150"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <circle cx="180" cy="45" r="28" fill="none" stroke="white" strokeWidth="0.8" opacity="0.6" />
        <circle cx="180" cy="45" r="44" fill="none" stroke="white" strokeWidth="0.8" opacity="0.4" />
      </svg>

      {/* Card Header with Icon & Active Index */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span>Conservation Tip</span>
        </div>
        <div className="flex items-center gap-1">
          {ENERGY_TIPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to tip ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === index ? 'w-4 bg-emerald-300' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rotating Tip Content with Crossfade */}
      <div className="relative z-10 min-h-[72px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-1"
          >
            <p className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
              <span>{current.title}</span>
              <Sparkles className="w-3 h-3 text-emerald-300 inline shrink-0" />
            </p>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed font-medium">
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer hover note */}
      <div className="relative z-10 mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-200/70">
        <span>CHE110 Campus Tip</span>
        <span className="italic">{isHovered ? 'Paused' : 'Every 8s'}</span>
      </div>
    </div>
  )
}
