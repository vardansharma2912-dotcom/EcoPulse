import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Leaf } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { LogoTapCounter } from '../../lib/easterEgg'
import { useToast } from '../../context/useToast'

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
}

// 10 radially distributed leaf vectors for the Easter egg burst animation
const LEAF_BURST_PARTICLES: Particle[] = [
  { id: 0, x: 55, y: 0, rotation: 25, scale: 0.95 },
  { id: 1, x: 42, y: 38, rotation: -40, scale: 0.8 },
  { id: 2, x: 12, y: 58, rotation: 50, scale: 1.05 },
  { id: 3, x: -32, y: 48, rotation: -30, scale: 0.85 },
  { id: 4, x: -58, y: 15, rotation: 45, scale: 1.0 },
  { id: 5, x: -50, y: -30, rotation: -60, scale: 0.9 },
  { id: 6, x: -18, y: -55, rotation: 35, scale: 0.75 },
  { id: 7, x: 25, y: -50, rotation: -45, scale: 1.1 },
  { id: 8, x: 50, y: -25, rotation: 20, scale: 0.85 },
  { id: 9, x: 0, y: 64, rotation: -15, scale: 0.95 },
]

interface NavbarLogoProps {
  size?: number
  withWordmark?: boolean
  className?: string
}

export const NavbarLogo: React.FC<NavbarLogoProps> = ({
  size = 36,
  withWordmark = true,
  className = '',
}) => {
  const { showToast } = useToast()
  const isReducedMotion = useReducedMotion()
  const [bursting, setBursting] = useState(false)

  const handleTrigger = useCallback(() => {
    showToast('You found the Eco Easter egg. Switch something off today!')

    if (!isReducedMotion) {
      setBursting(true)
      setTimeout(() => {
        setBursting(false)
      }, 1200)
    }
  }, [showToast, isReducedMotion])

  const counter = useMemo(() => {
    return new LogoTapCounter(handleTrigger, 2000, 5)
  }, [handleTrigger])

  const handleClick = () => {
    counter.registerTap()
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Link
        to="/"
        onClick={handleClick}
        aria-label="EcoPulse home"
        className="inline-flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50 transition-opacity hover:opacity-90 active:opacity-80"
      >
        <Logo size={size} withWordmark={withWordmark} />
      </Link>

      {/* 1.2 s Leaf Burst Animation (8-12 leaves, disabled for reduced motion) */}
      {bursting && !isReducedMotion && (
        <div
          className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible"
          aria-hidden="true"
        >
          {LEAF_BURST_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: 0,
                scale: p.scale,
                rotate: p.rotation,
              }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute text-emerald-600 drop-shadow-sm"
            >
              <Leaf className="w-4 h-4 fill-emerald-500/30" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
