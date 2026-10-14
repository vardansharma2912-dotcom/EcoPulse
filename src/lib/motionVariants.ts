import type { Variants } from 'motion/react'

export const EASING_OUT = [0.23, 1, 0.32, 1] as const
export const EASING_DRAWER = [0.32, 0.72, 0, 1] as const
export const EASING_IN_OUT = [0.77, 0, 0.175, 1] as const

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
    filter: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'blur(4px)' : 'none',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
}

export const highlightCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
    filter: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'blur(4px)' : 'none',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
}

