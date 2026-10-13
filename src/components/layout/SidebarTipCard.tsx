import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Lightbulb } from 'lucide-react'

const ENERGY_TIPS = [
  {
    title: 'Standby Power Drain',
    text: 'Switch off wall sockets to stop idle phantom electricity draw.',
  },
  {
    title: 'Optimal AC Set-Point',
    text: 'Set cooling to 24°C to save up to 24% on compressor energy.',
  },
  {
    title: 'Unplug Idle Chargers',
    text: 'Unplug charging bricks once phones and laptops reach 100%.',
  },
  {
    title: 'Laptop Power Saver',
    text: 'Enable battery saver and sleep displays when stepping away.',
  },
  {
    title: 'Daylight Harvesting',
    text: 'Open window blinds to illuminate study spaces with sunlight.',
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
      className={`relative overflow-hidden rounded-2xl bg-[#0a381e] text-white p-3.5 xl:p-4 shadow-md border border-emerald-500/20 select-none h-[146px] flex flex-col justify-between ${className}`}
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
      <div className="relative z-10 flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-emerald-300">
          <Lightbulb className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Campus Energy Tip</span>
        </div>
        <div className="flex items-center gap-1" role="tablist" aria-label="Energy tips navigation">
          {ENERGY_TIPS.map((tip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to tip ${i + 1}: ${tip.title}`}
              aria-selected={i === index}
              role="tab"
              className="p-1 -m-0.5 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-1 group"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === index
                    ? 'bg-emerald-400 w-3.5 shadow-xs'
                    : 'bg-white/40 w-1.5 group-hover:bg-white/80 group-hover:w-2'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tip Content: Full text without line-clamping or ellipsis truncation */}
      <div className="relative z-10 min-h-[66px] flex flex-col justify-center my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-0.5"
          >
            <h4 className="text-xs font-bold text-white tracking-tight">{currentTip.title}</h4>
            <p className="text-[11px] text-white/95 leading-relaxed font-normal">
              {currentTip.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stable footer: fixed height so showing 'Paused on hover' does not shift layout */}
      <div className="relative z-10 h-3 flex items-center">
        <span
          className={`text-[9px] text-emerald-300/80 italic transition-opacity duration-200 ${
            isPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isPaused}
        >
          Paused on hover
        </span>
      </div>
    </div>
  )
}
