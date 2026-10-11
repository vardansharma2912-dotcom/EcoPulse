import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { motion } from 'motion/react'
import { containerVariants, cardVariants } from '../lib/motionVariants'
import {
  Lightbulb,
  Fan,
  PowerOff,
  BatteryCharging,
  Laptop,
  Thermometer,
  Sun,
  Users,
  ToggleLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
} from 'lucide-react'

interface HabitCard {
  id: string
  title: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  summary: string
  habit: string
  whyItHelps: string
  fullDetails: string
  note?: string
}

const CARDS: HabitCard[] = [
  {
    id: 'lights',
    title: 'Room & Corridor Lighting',
    category: 'Lighting',
    icon: Lightbulb,
    summary:
      'Leaving desk lamps, overhead room fixtures, and hallway lights switched on in empty rooms wastes power continuously without delivering any utility.',
    habit:
      'Make it a muscle-memory habit to flip off switches every single time you step out of a study bedroom, departmental lab, or washroom.',
    whyItHelps:
      'Immediately cuts baseline electrical consumption during vacancy intervals. Even brief 15-minute saves accumulate across a semester.',
    fullDetails:
      'Electric lighting in dormitories and study spaces operates directly on grid power. When study areas are unoccupied, illumination provides zero benefit. Developing the conscious habit of turning off lights upon exit eliminates unnecessary operating hours. Pairing desk placement with daylight and choosing task lighting over high-wattage ceiling fixtures further minimizes load.',
    note: 'Rated power varies by fixture type (compact fluorescents and older tubes draw more power than modern LEDs). Check lamp fixtures for labeled wattage.',
  },
  {
    id: 'fans',
    title: 'Ceiling & Desk Fans',
    category: 'Cooling',
    icon: Fan,
    summary:
      'Electric fans cool people by accelerating convective evaporation from the skin, not by lowering the ambient temperature of the room air.',
    habit:
      'Always switch off ceiling fans and personal desk fans the moment you vacate a room.',
    whyItHelps:
      'Running a fan in an empty room cools empty furniture while keeping the induction motor energized, consuming electricity to no effect.',
    fullDetails:
      'Unlike air conditioning systems that extract thermal heat through refrigeration cycles, fans circulate ambient room air. The perceived cooling sensation is purely physiological. When no occupant is present in the space, air movement produces no cooling effect. Switching off fans whenever leaving ensures motors run only when occupants directly benefit.',
    note: 'Motor power consumption varies by speed regulator setting and fan type (traditional induction motors draw more power than brushless DC BLDC motors).',
  },
  {
    id: 'standby',
    title: 'Standby Power (Phantom Load)',
    category: 'Standby Power',
    icon: PowerOff,
    summary:
      'Electronics such as television sets, audio monitors, microwave clocks, and gaming consoles draw constant idle power even when switched off via remotes.',
    habit:
      'Turn off consumer electronics directly at the master power strip switch or wall outlet when not actively in use.',
    whyItHelps:
      'Eliminates uninterrupted 24/7 background power draw from digital display clocks, standby sensors, and internal transformer windings.',
    fullDetails:
      'Phantom load or vampire power occurs because electronic power supplies remain energized to listen for remote control signals, sustain internal clocks, or maintain low-voltage memory. Over weeks and months, continuous low-wattage standby draw adds up across multiple appliances. Power strips with master switches make it easy to cut line voltage to entire workstation clusters at night.',
    note: 'Standby draw varies by appliance age, standby mode standards, and circuit design.',
  },
  {
    id: 'chargers',
    title: 'Device & Phone Chargers',
    category: 'Chargers',
    icon: BatteryCharging,
    summary:
      'Wall chargers and USB power bricks contain switch-mode transformers that draw a baseline idle current whenever left connected to energized wall sockets.',
    habit:
      'Unplug phone and tablet chargers from the wall socket as soon as charging completes, or switch off the socket switch.',
    whyItHelps:
      'Prevents continuous idle heat generation and passive draw from energized transformer circuits sitting unused all day long.',
    fullDetails:
      'Modern switch-mode charging bricks are engineered to convert alternating current (AC) to low-voltage direct current (DC). Even without a connected smartphone, the internal flyback converter continues pulsing at low frequency. Removing the adapter or flicking the wall switch isolates the adapter from the grid completely.',
    note: 'Idle power varies by adapter wattage rating, manufacturer quality, and internal component design.',
  },
  {
    id: 'laptop',
    title: 'Laptop & Computer Settings',
    category: 'Computing',
    icon: Laptop,
    summary:
      'High-performance OS power profiles keep processor frequencies elevated, dedicated graphic cards warm, and backlight brightness at maximum levels.',
    habit:
      'Set display sleep to 5 minutes, configure auto-sleep or hibernation during study breaks, and dim screen brightness to match indoor lighting.',
    whyItHelps:
      'Reduces unnecessary processor and display backlight power draw during reading sessions, lectures, and meal breaks.',
    fullDetails:
      'Display panels and central processors represent the bulk of a laptop’s power draw. Allowing displays to sleep during short absences extends battery life and reduces the frequency of recharge cycles from the wall socket. Disconnecting unused peripheral devices and external hard drives further reduces parasitic battery drain.',
    note: 'Power consumption varies widely depending on processor architecture, screen brightness, and computational workload.',
  },
  {
    id: 'ac',
    title: 'AC Set-Points & Airflow',
    category: 'Thermal Comfort',
    icon: Thermometer,
    summary:
      'Setting room air conditioners to very low temperatures forces compressors to run continuously against ambient outdoor heat.',
    habit:
      'Maintain moderate cooling set-points around 24°C–26°C and operate a ceiling fan on low speed to distribute cool air evenly.',
    whyItHelps:
      'Compressor runtimes decrease significantly when maintaining a realistic indoor-to-outdoor temperature differential.',
    fullDetails:
      'The compressor is the most power-intensive component of an air conditioning unit. Lowering the thermostat to 18°C does not cool the room faster; it simply keeps the compressor engaged longer. Combining a moderate 24°C setting with light fan air circulation provides equivalent perceived cooling comfort while shortening compressor duty cycles.',
    note: 'Compressor power demand varies with room insulation, window sun exposure, filter cleanliness, and equipment star rating.',
  },
  {
    id: 'daylight',
    title: 'Leveraging Natural Daylight',
    category: 'Lighting',
    icon: Sun,
    summary:
      'Using overhead electric lighting during bright daytime hours when windows provide abundant natural light causes unnecessary power consumption.',
    habit:
      'Position study tables near windows, draw back curtains to admit diffuse daylight, and keep electrical fixtures turned off until dusk.',
    whyItHelps:
      'Replaces artificial electric lighting with free, high-color-rendering solar daylight for daytime studying and reading.',
    fullDetails:
      'Natural daylight provides higher visual acuity and comfort than artificial electric lamps. By arranging dorm and study desk orientations perpendicular to window apertures, students can enjoy balanced illumination without harsh glare. Artificial lighting can then be reserved solely for late evening and night study sessions.',
    note: 'Available daylight varies with building orientation, season, cloud cover, and window shading.',
  },
  {
    id: 'shared',
    title: 'Shared Campus & Dorm Areas',
    category: 'Shared Spaces',
    icon: Users,
    summary:
      'In lecture halls, project laboratories, and dorm floor lounges, individuals frequently assume that building maintenance or someone else will turn off switches.',
    habit:
      'Take collective proactive ownership. If you are the last person exiting a shared room or project lab, take 10 seconds to switch off fixtures.',
    whyItHelps:
      'Prevents lights, monitors, and ventilation equipment in unoccupied institutional rooms from operating unobserved overnight.',
    fullDetails:
      'The "bystander effect" is a major contributor to institutional energy waste. Because electricity in college facilities is not directly metered to individual students, vacant common spaces often remain illuminated for hours after meetings conclude. Fostering a culture of shared responsibility creates substantial campus-wide savings.',
    note: 'Savings scale directly with room dimensions and the quantity of installed institutional fixtures.',
  },
  {
    id: 'switching',
    title: 'Switching at the Wall Plug',
    category: 'Habits',
    icon: ToggleLeft,
    summary:
      'Turning off appliances solely with device buttons leaves internal power supplies, transformers, and circuitry energized up to the power board.',
    habit:
      'Develop the deliberate habit of turning off the mechanical rocker switch at the wall socket or power strip.',
    whyItHelps:
      'Physically severs line voltage connection, completely isolating the appliance and preventing any residual electrical draw.',
    fullDetails:
      'Soft-off power buttons on monitors, printers, and chargers keep the front-end rectifier and filter circuitry connected to live mains voltage. Using the physical wall switch or an accessible surge protector master rocker physically breaks the electrical circuit, ensuring absolute zero current draw when equipment is idle.',
    note: 'Using a dedicated multi-socket power strip with a master switch allows isolating entire desk workstations with a single click.',
  },
]

export const LearnPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true) // By default set to play (auto move to next slide)
  const [expandedCard, setExpandedCard] = useState<HabitCard | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })
  const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640
    }
    return false
  })

  const carouselRef = useRef<HTMLDivElement>(null)
  const totalCards = CARDS.length

  // Subscribe to changes in motion preference & screen size
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQueryMotion.addEventListener('change', handleMotionChange)

    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < 640)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      mediaQueryMotion.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalCards)
  }, [totalCards])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)
  }, [totalCards])

  // Autoplay timer: auto-advances to next slide every 4 seconds when isPlaying is true
  useEffect(() => {
    if (!isPlaying || Boolean(expandedCard)) return

    const timer = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(timer)
  }, [isPlaying, expandedCard, nextSlide])

  // Keyboard navigation (ArrowLeft & ArrowRight)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextSlide()
    }
  }

  // Touch swipe support
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff > 45) {
      prevSlide()
    } else if (diff < -45) {
      nextSlide()
    }
    touchStartX.current = null
  }

  const currentCard = CARDS[currentIndex]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Energy Conservation Guide"
        description="Practical habits and conservation principles for college dormitories and campus living."
      />



    {/* 3D Glassy Carousel Section */}
    <motion.div variants={cardVariants}>
      <section
        ref={carouselRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Energy Conservation Habits Carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative py-4 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40 rounded-3xl"
      >
        {/* Screen Reader Live Region Announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Slide {currentIndex + 1} of {totalCards}: {currentCard.title}. {currentCard.summary}
        </div>

        {/* 3D / Reduced-Motion Carousel Container */}
        {prefersReducedMotion || isNarrowScreen ? (
          /* Mobile / Narrow Screen: One Centered Card with Peeking Neighbours and touch-action: pan-y */
          <div
            className="relative flex items-center justify-center overflow-hidden px-2 py-3 select-none"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Left Peeking Neighbour */}
            <div
              onClick={prevSlide}
              className="hidden xs:block absolute -left-16 sm:-left-12 w-64 rounded-2xl bg-white/45 backdrop-blur-md border border-white/60 p-4 shadow-sm opacity-50 scale-90 cursor-pointer pointer-events-auto shrink-0 select-none transition-transform active:scale-85"
              aria-hidden="true"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700/15 text-emerald-800 flex items-center justify-center shrink-0">
                  {React.createElement(CARDS[(currentIndex - 1 + totalCards) % totalCards].icon, { className: 'w-4 h-4' })}
                </div>
                <p className="text-xs font-bold text-[#0f2819] truncate">
                  {CARDS[(currentIndex - 1 + totalCards) % totalCards].title}
                </p>
              </div>
            </div>

            {/* Centered Active Card */}
            <div
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${currentIndex + 1} of ${totalCards}: ${currentCard.title}`}
              className="w-full max-w-sm rounded-[22px] bg-white/85 backdrop-blur-xl border border-white/90 p-5 shadow-xl relative z-10 transition-all"
            >
              {/* Illustration Area */}
              <div className="relative mb-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100/80 via-emerald-50/50 to-teal-100/70 p-4 border border-white/60">
                <svg
                  className="absolute -right-6 -bottom-6 h-36 w-36 text-emerald-800/10 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>

                <currentCard.icon className="relative z-10 h-14 w-14 text-emerald-800 drop-shadow-xs" />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#0f2819]">{currentCard.title}</h3>
                  <Badge variant="neutral" size="sm">
                    {currentCard.category}
                  </Badge>
                </div>

                <p className="text-xs text-[#1e3f2b] leading-relaxed line-clamp-3">
                  {currentCard.summary}
                </p>

                <div className="rounded-xl bg-emerald-800/5 p-2.5 border border-emerald-800/10 space-y-1 text-xs">
                  <p className="text-[#0f2819]">
                    <span className="font-bold text-emerald-950">Habit: </span>
                    {currentCard.habit}
                  </p>
                  <p className="text-emerald-900 text-[11px]">
                    <span className="font-semibold text-emerald-950">Why it helps: </span>
                    {currentCard.whyItHelps}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#1e3f2b]/80 italic">
                    {currentCard.note ? 'Varies by appliance' : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedCard(currentCard)}
                    icon={<Maximize2 className="w-3.5 h-3.5" />}
                  >
                    Expand
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Peeking Neighbour */}
            <div
              onClick={nextSlide}
              className="hidden xs:block absolute -right-16 sm:-right-12 w-64 rounded-2xl bg-white/45 backdrop-blur-md border border-white/60 p-4 shadow-sm opacity-50 scale-90 cursor-pointer pointer-events-auto shrink-0 select-none transition-transform active:scale-85"
              aria-hidden="true"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700/15 text-emerald-800 flex items-center justify-center shrink-0">
                  {React.createElement(CARDS[(currentIndex + 1) % totalCards].icon, { className: 'w-4 h-4' })}
                </div>
                <p className="text-xs font-bold text-[#0f2819] truncate">
                  {CARDS[(currentIndex + 1) % totalCards].title}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Full 3D Carousel Layout with Perspective Container */
          <div
            className="relative h-[440px] w-full flex items-center justify-center overflow-hidden"
            style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
          >
            {CARDS.map((card, idx) => {
              // Compute wrap-around offset relative to current card
              let offset = (idx - currentIndex) % totalCards
              if (offset > totalCards / 2) offset -= totalCards
              if (offset < -totalCards / 2) offset += totalCards

              const isCenter = offset === 0
              const isAdjacent = Math.abs(offset) === 1
              const isVisible = Math.abs(offset) <= 2

              if (!isVisible) return null

              // 3D positioning calculations
              const xPos = offset * 290
              const rotateY = offset * -32
              const zPos = isCenter ? 0 : Math.abs(offset) === 1 ? -160 : -320
              const scale = isCenter ? 1 : isAdjacent ? 0.85 : 0.72
              const opacity = isCenter ? 1 : isAdjacent ? 0.72 : 0.25
              const blurAmount = isCenter ? 0 : isAdjacent ? 1 : 4
              const zIndex = isCenter ? 30 : isAdjacent ? 20 : 10

              return (
                <motion.div
                  key={card.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${idx + 1} of ${totalCards}: ${card.title}`}
                  aria-hidden={!isCenter}
                  animate={{
                    x: xPos,
                    rotateY,
                    z: zPos,
                    scale,
                    opacity,
                    filter: `blur(${blurAmount}px)`,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 26,
                  }}
                  onClick={() => {
                    if (!isCenter) setCurrentIndex(idx)
                  }}
                  style={{
                    position: 'absolute',
                    width: '340px',
                    zIndex,
                    transformStyle: 'preserve-3d',
                    cursor: isCenter ? 'default' : 'pointer',
                  }}
                  className={`rounded-[20px] bg-white/80 backdrop-blur-xl border border-white/90 p-5 shadow-xl transition-shadow ${
                    isCenter ? 'ring-1 ring-emerald-500/30 shadow-2xl' : 'hover:opacity-90'
                  }`}
                >
                  {/* Card Illustration Area */}
                  <div className="relative mb-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100/90 via-emerald-50/60 to-teal-100/70 p-4 border border-white/70 shadow-inner">
                    {/* Faint botanical leaf watermark in background */}
                    <svg
                      className="absolute -right-5 -bottom-5 h-32 w-32 text-emerald-800/15 pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                    </svg>

                    <card.icon className="relative z-10 h-12 w-12 text-emerald-800 drop-shadow-xs" />
                  </div>

                  {/* Card Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-sm font-bold text-[#0f2819] truncate">{card.title}</h3>
                      <Badge variant="neutral" size="sm" className="shrink-0 text-[10px]">
                        {card.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#1e3f2b] leading-relaxed line-clamp-2">
                      {card.summary}
                    </p>

                    <div className="rounded-xl bg-emerald-800/5 p-2 border border-emerald-800/10 space-y-0.5 text-[11px]">
                      <p className="text-[#0f2819] truncate">
                        <span className="font-bold text-emerald-950">Habit: </span>
                        {card.habit}
                      </p>
                      <p className="text-emerald-900 text-[10px] truncate">
                        <span className="font-semibold text-emerald-950">Why it helps: </span>
                        {card.whyItHelps}
                      </p>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-[#1e3f2b]/75 italic">
                        {card.note ? 'Varies by appliance' : ''}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isCenter}
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedCard(card)
                        }}
                        icon={<Maximize2 className="w-3 h-3" />}
                        className="text-xs py-1 px-2.5"
                      >
                        Expand
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Glass Control Pill Below Carousel */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex w-[440px] max-w-[calc(100vw-32px)] items-center justify-between rounded-full bg-white/80 backdrop-blur-md border border-white/80 shadow-md px-3.5 py-1.5 transition-all">
            {/* Left controls: Prev & Play/Pause */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous habit card"
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-900 transition-colors hover:bg-emerald-800/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause auto-advance' : 'Play auto-advance'}
                title={isPlaying ? 'Pause auto-advance' : 'Play auto-advance'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-900 transition-colors hover:bg-emerald-800/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="h-4 w-px bg-black/10 shrink-0 mx-1" />

            {/* Center: Title & Slide Counter with stable spacing */}
            <div className="flex-1 flex items-center justify-between min-w-0 px-2 gap-2">
              <span className="text-xs font-bold text-[#0f2819] truncate whitespace-nowrap">
                {currentCard.title}
              </span>

              <span className="text-xs font-semibold tabular-nums text-emerald-900 shrink-0">
                {currentIndex + 1}/{totalCards}
              </span>
            </div>

            <div className="h-4 w-px bg-black/10 shrink-0 mx-1" />

            {/* Right controls: Next */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next habit card"
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-900 transition-colors hover:bg-emerald-800/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Indicator Dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Habit card indicators">
            {CARDS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Jump to ${c.title}`}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer ${
                  i === currentIndex
                    ? 'w-6 bg-emerald-800'
                    : 'w-2 bg-emerald-800/25 hover:bg-emerald-800/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </motion.div>

      {/* Expanded Card Glass Dialog */}
      {expandedCard && (
        <Dialog
          open={Boolean(expandedCard)}
          onClose={() => setExpandedCard(null)}
          title={expandedCard.title}
          description={`Energy Conservation Guide • ${expandedCard.category}`}
        >
          <div className="space-y-4 text-xs text-[#1e3f2b] leading-relaxed">
            {/* Header with illustration banner */}
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-100/80 via-emerald-50/50 to-teal-100/70 p-3.5 border border-white/70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-emerald-800 shadow-xs">
                <expandedCard.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0f2819]">{expandedCard.title}</p>
                <Badge variant="neutral" size="sm">
                  {expandedCard.category}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-[#0f2819] text-xs">Summary:</h4>
                <p className="mt-0.5">{expandedCard.summary}</p>
              </div>

              <div className="rounded-xl bg-emerald-800/5 p-3 border border-emerald-800/10 space-y-2">
                <div>
                  <span className="font-bold text-emerald-950">Recommended Habit: </span>
                  <p className="text-emerald-900 mt-0.5">{expandedCard.habit}</p>
                </div>
                <div>
                  <span className="font-bold text-emerald-950">Why it helps: </span>
                  <p className="text-emerald-900 mt-0.5">{expandedCard.whyItHelps}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0f2819] text-xs">Detailed Academic Context:</h4>
                <p className="mt-1 leading-relaxed text-[#1e3f2b]">{expandedCard.fullDetails}</p>
              </div>

              {expandedCard.note && (
                <div className="rounded-xl bg-amber-500/10 p-2.5 border border-amber-300/40 text-[11px] text-amber-950">
                  <span className="font-bold">Appliance Note: </span>
                  {expandedCard.note}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/5 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setExpandedCard(null)}>
                Close Guide
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </motion.div>
  )
}
