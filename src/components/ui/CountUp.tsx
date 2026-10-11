import React, { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

export interface CountUpProps {
  value: number
  format?: (value: number) => string
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  format,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 0.8,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState<number>(0)
  const previousValueRef = useRef<number>(0)
  const isInitialMount = useRef<boolean>(true)

  useEffect(() => {
    if (prefersReducedMotion) {
      previousValueRef.current = value
      return
    }

    const start = isInitialMount.current ? 0 : previousValueRef.current
    isInitialMount.current = false

    const controls = animate(start, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // smooth easeOut
      onUpdate: (latest) => {
        setDisplayValue(latest)
      },
      onComplete: () => {
        setDisplayValue(value)
        previousValueRef.current = value
      },
    })

    return () => {
      controls.stop()
    }
  }, [value, duration, prefersReducedMotion])

  // Instant value render when user prefers reduced motion
  if (prefersReducedMotion) {
    const instantFormatted = format
      ? format(value)
      : `${prefix}${decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()}${suffix}`
    return <span className={className}>{instantFormatted}</span>
  }

  const formatted = format
    ? format(displayValue)
    : `${prefix}${decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString()}${suffix}`

  return <span className={className}>{formatted}</span>
}
