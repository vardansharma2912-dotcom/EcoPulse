import type { Variants } from 'motion/react'

export const staggerContainerVariant: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const cardEntranceVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
    filter: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'blur(4px)' : 'none',
  },
  show: {
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
