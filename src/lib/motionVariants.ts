import type { Variants } from 'motion/react'

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
