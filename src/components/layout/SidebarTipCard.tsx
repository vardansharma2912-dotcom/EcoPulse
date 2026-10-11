import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Lightbulb } from 'lucide-react'

const ENERGY_TIPS = [
  {
    title: 'Standby Power Drain',
    text: 'Standby power adds up over a year, and varies by appliance. Switching off at the wall socket eliminates passive idle draw.',
  },
  {
    title: 'Optimal AC Set-Point',
    text: 'Setting moderate air conditioning temperatures reduces compressor runtime while keeping living spaces comfortably cool.',
  },
  {
    title: 'Unplug Idle Chargers',
    text: 'Charging adapters continue drawing small currents when left plugged in. Switching off sockets when done eliminates passive draw.',
  },
  {
    title: 'Fume Hood Sash Management',
    text: 'Pulling down laboratory sash glass reduces variable air ventilation exhaust load across campus research facilities.',
  },
  {
    title: 'Daylight Harvesting',
    text: 'Opening natural window blinds and switching off overhead fixtures allows natural daylight to illuminate study desks.',
  },
]

export const SidebarTipCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ENERGY_TIPS.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isPaused])

  const currentTip = ENERGY_TIPS[index]

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden rounded-2xl bg-[#0a381e] text-white p-3.5 xl:p-4 shadow-md border border-emerald-500/20 select-none ${className}`}
    >
      {/* Original Topographic Contour-Line SVG Background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.09]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 160"
        preserveAspectRatio="none"
      >
        <path
          d="M-20,40 C40,20 100,60 160,30 C200,10 240,40 280,30"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-20,70 C50,50 110,90 170,60 C210,40 250,70 290,60"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-20,100 C30,90 90,120 150,90 C210,70 240,110 280,100"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-20,130 C60,110 120,150 180,120 C220,100 250,130 290,130"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-20,15 C70,5 130,35 190,15 C230,0 260,25 300,15"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </svg>

      {/* Tip Header */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-emerald-300">
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Campus Energy Tip</span>
        </div>
        <div className="flex items-center gap-1.5">
          {ENERGY_TIPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'bg-emerald-400 w-3' : 'bg-white/50 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tip Content with 8s Rotating Crossfade */}
      <div className="relative z-10 min-h-[58px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-1"
          >
            <h4 className="text-xs font-bold text-white tracking-tight">{currentTip.title}</h4>
            <p className="text-[11px] text-white/95 leading-relaxed font-normal">
              {currentTip.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {isPaused && (
        <span className="relative z-10 block text-[9px] text-emerald-300/80 mt-1 italic">
          Paused on hover
        </span>
      )}
    </div>
  )
}
